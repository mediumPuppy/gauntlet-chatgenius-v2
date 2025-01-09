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

interface AuthenticatedWebSocket extends WebSocket {
  userId?: number;
  channelSubscriptions: Set<number>;
}

interface WebSocketMessage {
  type: 'message' | 'edit' | 'delete' | 'reaction' | 'typing';
  channelId: number;
  content?: string;
  messageId?: number;
}

export class MessageServer {
  private wss: WebSocketServer;
  private clients: Set<AuthenticatedWebSocket> = new Set();

  constructor(server: Server) {
    this.wss = new WebSocketServer({ 
      noServer: true,  // Important: Let the HTTP server handle upgrade
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
  }

  private setupWebSocketServer() {
    this.wss.on('connection', (ws: AuthenticatedWebSocket, req) => {
      const session = (req as any).session as Session;
      ws.userId = session.userId;
      ws.channelSubscriptions = new Set();
      this.clients.add(ws);

      ws.on('message', async (data: string) => {
        try {
          const message: WebSocketMessage = JSON.parse(data);

          // Validate user has access to the channel
          const channel = await db.query.channels.findFirst({
            where: and(
              eq(channels.id, message.channelId),
              eq(channels.isPrivate, false)
            )
          });

          if (!channel) {
            ws.send(JSON.stringify({ error: 'Channel not found or access denied' }));
            return;
          }

          switch (message.type) {
            case 'message':
              if (!message.content) return;

              // Store message in database
              const newMessages = await db.insert(messages).values({
                channelId: message.channelId,
                userId: ws.userId!,
                content: message.content,
                createdAt: new Date(),
              }).returning();

              // Type check the response
              if (newMessages && Array.isArray(newMessages) && newMessages.length > 0) {
                const newMessage = newMessages[0];
                // Broadcast to all subscribers
                this.broadcastToChannel(message.channelId, {
                  type: 'message',
                  channelId: message.channelId,
                  message: newMessage
                });
              }
              break;

            case 'typing':
              this.broadcastToChannel(message.channelId, {
                type: 'typing',
                channelId: message.channelId,
                userId: ws.userId
              });
              break;
          }
        } catch (error) {
          console.error('Error processing message:', error);
          ws.send(JSON.stringify({ error: 'Failed to process message' }));
        }
      });

      ws.on('close', () => {
        this.clients.delete(ws);
      });
    });
  }

  private broadcastToChannel(channelId: number, data: any) {
    const message = JSON.stringify(data);
    this.clients.forEach((client) => {
      if (client.channelSubscriptions.has(channelId)) {
        client.send(message);
      }
    });
  }

  // Subscribe a client to a channel
  public async subscribeToChannel(ws: AuthenticatedWebSocket, channelId: number) {
    // Verify channel access
    const channel = await db.query.channels.findFirst({
      where: and(
        eq(channels.id, channelId),
        eq(channels.isPrivate, false)
      )
    });

    if (!channel) {
      ws.send(JSON.stringify({ error: 'Channel not found or access denied' }));
      return false;
    }

    ws.channelSubscriptions.add(channelId);
    return true;
  }

  // Unsubscribe a client from a channel
  public unsubscribeFromChannel(ws: AuthenticatedWebSocket, channelId: number) {
    ws.channelSubscriptions.delete(channelId);
  }

  // Get the HTTP server for setting up other WebSocket servers (like Vite HMR)
  public getHttpServer() {
    return this.wss;
  }
}

export function setupWebSocketServer(server: Server): MessageServer {
  return new MessageServer(server);
}