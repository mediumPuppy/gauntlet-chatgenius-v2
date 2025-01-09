import { WebSocket, WebSocketServer } from 'ws';
import { type Server } from 'http';
import { parse } from 'url';
import { db } from '@db';
import { messages, channels, users } from '@db/schema';
import { eq, and } from 'drizzle-orm';
import type { Session } from 'express-session';

// Extend Session type to include our custom properties
declare module 'express-session' {
  interface Session {
    userId?: number;
  }
}

// AWS API Gateway compatible message structure
interface WebSocketEvent {
  requestContext: {
    routeKey: string;
    connectionId: string;
    eventType: 'CONNECT' | 'MESSAGE' | 'DISCONNECT';
  };
  body?: string;
}

interface WebSocketMessage {
  action: string;
  channelId: number;
  content?: string;
  messageId?: number;
}

interface AuthenticatedWebSocket extends WebSocket {
  userId?: number;
  connectionId: string;
  channelSubscriptions: Set<number>;
  isAlive: boolean;
}

export class MessageServer {
  private wss: WebSocketServer;
  private clients: Map<string, AuthenticatedWebSocket> = new Map();
  private pingInterval: NodeJS.Timeout;

  constructor(server: Server) {
    this.wss = new WebSocketServer({ 
      noServer: true,
      perMessageDeflate: true,
    });

    // Handle upgrade for our messaging WebSocket connections
    server.on('upgrade', (request, socket, head) => {
      const { pathname } = parse(request.url || '');

      // Only handle messaging WebSocket connections
      if (pathname === '/ws') {
        this.wss.handleUpgrade(request, socket, head, (ws) => {
          const session = (request as any).session as Session;
          if (!session?.userId) {
            ws.close(1008, 'Unauthorized');
            return;
          }

          this.wss.emit('connection', ws, request);
        });
      }
    });

    this.setupWebSocketServer();

    // Setup ping interval for connection health check
    this.pingInterval = setInterval(() => {
      this.clients.forEach((client) => {
        if (!this.isAlive(client)) {
          return this.handleDisconnect(client);
        }
        this.ping(client);
      });
    }, 30000);
  }

  private isAlive(client: AuthenticatedWebSocket): boolean {
    return client.readyState === WebSocket.OPEN;
  }

  private ping(client: AuthenticatedWebSocket) {
    try {
      client.ping();
    } catch (error) {
      console.error('Error sending ping:', error);
      this.handleDisconnect(client);
    }
  }

  private async handleConnect(ws: AuthenticatedWebSocket, req: any) {
    const connectionId = Math.random().toString(36).substring(2);
    ws.connectionId = connectionId;
    ws.userId = (req.session as Session).userId;
    ws.channelSubscriptions = new Set();
    ws.isAlive = true;

    this.clients.set(connectionId, ws);

    // Send connection acknowledgment
    this.sendToClient(ws, {
      action: '$connect',
      connectionId,
      message: 'Connected successfully'
    });
  }

  private handleDisconnect(ws: AuthenticatedWebSocket) {
    this.clients.delete(ws.connectionId);
    ws.terminate();
  }

  private setupWebSocketServer() {
    this.wss.on('connection', async (ws: AuthenticatedWebSocket, req) => {
      await this.handleConnect(ws, req);

      ws.on('message', async (data: string) => {
        try {
          const message: WebSocketMessage = JSON.parse(data);
          await this.handleMessage(ws, message);
        } catch (error) {
          console.error('Error processing message:', error);
          this.sendToClient(ws, {
            action: 'error',
            message: 'Failed to process message'
          });
        }
      });

      ws.on('close', () => this.handleDisconnect(ws));

      ws.on('error', (error) => {
        console.error('WebSocket error:', error);
        this.handleDisconnect(ws);
      });

      ws.on('pong', () => {
        // Update last seen timestamp
        ws.isAlive = true;
      });
    });
  }

  private async handleMessage(ws: AuthenticatedWebSocket, message: WebSocketMessage) {
    // Verify channel access
    const channel = await db.query.channels.findFirst({
      where: and(
        eq(channels.id, message.channelId),
        eq(channels.isPrivate, false)
      )
    });

    if (!channel) {
      return this.sendToClient(ws, {
        action: 'error',
        message: 'Channel not found or access denied'
      });
    }

    switch (message.action) {
      case 'message':
        await this.handleChatMessage(ws, message);
        break;

      case 'subscribe':
        await this.handleSubscribe(ws, message.channelId);
        break;

      case 'unsubscribe':
        await this.handleUnsubscribe(ws, message.channelId);
        break;

      case 'typing':
        this.broadcastToChannel(message.channelId, {
          action: 'typing',
          channelId: message.channelId,
          userId: ws.userId
        });
        break;

      default:
        this.sendToClient(ws, {
          action: 'error',
          message: 'Unknown message type'
        });
    }
  }

  private async handleChatMessage(ws: AuthenticatedWebSocket, message: WebSocketMessage) {
    if (!message.content) return;

    try {
      // Store message in database
      const [newMessage] = await db.insert(messages).values({
        channelId: message.channelId,
        userId: ws.userId!,
        content: message.content,
        createdAt: new Date(),
      }).returning();

      // Broadcast to all subscribers
      this.broadcastToChannel(message.channelId, {
        action: 'message',
        channelId: message.channelId,
        message: newMessage
      });
    } catch (error) {
      console.error('Error saving message:', error);
      this.sendToClient(ws, {
        action: 'error',
        message: 'Failed to save message'
      });
    }
  }

  private sendToClient(client: AuthenticatedWebSocket, data: any) {
    if (client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify(data));
    }
  }

  private broadcastToChannel(channelId: number, data: any) {
    this.clients.forEach((client) => {
      if (client.channelSubscriptions.has(channelId)) {
        this.sendToClient(client, data);
      }
    });
  }

  private async handleSubscribe(ws: AuthenticatedWebSocket, channelId: number) {
    // Verify channel access
    const channel = await db.query.channels.findFirst({
      where: and(
        eq(channels.id, channelId),
        eq(channels.isPrivate, false)
      )
    });

    if (!channel) {
      return this.sendToClient(ws, {
        action: 'error',
        message: 'Channel not found or access denied'
      });
    }

    ws.channelSubscriptions.add(channelId);
    this.sendToClient(ws, {
      action: 'subscribed',
      channelId
    });
  }

  private handleUnsubscribe(ws: AuthenticatedWebSocket, channelId: number) {
    ws.channelSubscriptions.delete(channelId);
    this.sendToClient(ws, {
      action: 'unsubscribed',
      channelId
    });
  }

  public getHttpServer() {
    return this.wss;
  }

  public cleanup() {
    clearInterval(this.pingInterval);
    this.clients.forEach((client) => {
      client.terminate();
    });
    this.clients.clear();
  }
}

export function setupWebSocketServer(server: Server): MessageServer {
  return new MessageServer(server);
}