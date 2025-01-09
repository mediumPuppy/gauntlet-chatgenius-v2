import { z } from "zod";

// Message types matching server implementation
export interface WebSocketMessage {
  action: string;
  channelId?: number;
  content?: string;
  messageId?: number;
}

export type ConnectionStatus = "connected" | "connecting" | "disconnected";

export type MessageHandler = (message: any) => void;

export class WebSocketService {
  private ws: WebSocket | null = null;
  private status: ConnectionStatus = "disconnected";
  private messageHandlers: Set<MessageHandler> = new Set();
  private reconnectTimeout: number = 1000; // Start with 1s, will increase exponentially
  private maxReconnectTimeout: number = 30000; // Max 30s between reconnect attempts
  private reconnectTimer: NodeJS.Timeout | null = null;
  private isAlive: boolean = true;
  private pingTimer: NodeJS.Timeout | null = null;

  constructor() {
    // Determine WebSocket protocol based on current page protocol
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const host = window.location.host;
    this.url = `${protocol}//${host}/ws`;
  }

  private readonly url: string;

  public connect(): void {
    if (this.ws?.readyState === WebSocket.OPEN) return;

    try {
      this.status = "connecting";
      this.ws = new WebSocket(this.url);

      this.ws.onopen = () => {
        this.status = "connected";
        this.reconnectTimeout = 1000; // Reset reconnect timeout on successful connection
        this.notifyHandlers({
          action: "status",
          status: "connected"
        });

        // Setup ping interval after successful connection
        this.setupPingInterval();
      };

      this.ws.onclose = (event) => {
        this.status = "disconnected";
        this.notifyHandlers({
          action: "status",
          status: "disconnected",
          code: event.code,
          reason: event.reason
        });

        // Clean up ping interval
        if (this.pingTimer) {
          clearInterval(this.pingTimer);
          this.pingTimer = null;
        }

        // Don't reconnect on authentication failure (1008)
        if (event.code !== 1008) {
          this.scheduleReconnect();
        }
      };

      this.ws.onerror = (error) => {
        console.error("WebSocket error:", error);
        this.notifyHandlers({
          action: "error",
          error: "WebSocket connection error"
        });
      };

      this.ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);

          // Handle pong responses to keep connection alive
          if (data.action === 'pong') {
            this.isAlive = true;
            return;
          }

          this.notifyHandlers(data);
        } catch (error) {
          console.error("Error parsing WebSocket message:", error);
        }
      };
    } catch (error) {
      console.error("Failed to create WebSocket connection:", error);
      this.status = "disconnected";
      this.scheduleReconnect();
    }
  }

  private setupPingInterval(): void {
    // Clear any existing ping interval
    if (this.pingTimer) {
      clearInterval(this.pingTimer);
    }

    // Setup new ping interval
    this.pingTimer = setInterval(() => {
      if (!this.isAlive) {
        // Connection is dead, close it and let the onclose handler reconnect
        this.ws?.close();
        return;
      }

      this.isAlive = false;
      try {
        this.send({ action: 'ping' });
      } catch (error) {
        console.error('Failed to send ping:', error);
        this.ws?.close();
      }
    }, 30000); // 30 second ping interval to match server
  }

  private scheduleReconnect(): void {
    if (this.reconnectTimer) return;

    this.reconnectTimer = setTimeout(() => {
      this.reconnectTimer = null;
      this.connect();
      // Exponential backoff with max timeout
      this.reconnectTimeout = Math.min(this.reconnectTimeout * 2, this.maxReconnectTimeout);
    }, this.reconnectTimeout);
  }

  public disconnect(): void {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }

    if (this.pingTimer) {
      clearInterval(this.pingTimer);
      this.pingTimer = null;
    }

    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
  }

  public subscribe(handler: MessageHandler): () => void {
    this.messageHandlers.add(handler);
    return () => this.messageHandlers.delete(handler);
  }

  private notifyHandlers(message: any): void {
    this.messageHandlers.forEach(handler => handler(message));
  }

  public send(message: WebSocketMessage): void {
    if (this.ws?.readyState !== WebSocket.OPEN) {
      console.warn("WebSocket is not connected");
      return;
    }

    try {
      this.ws.send(JSON.stringify(message));
    } catch (error) {
      console.error("Failed to send message:", error);
      // If we encounter an error sending, assume the connection is bad and reconnect
      this.ws?.close();
    }
  }

  public getStatus(): ConnectionStatus {
    return this.status;
  }

  // Convenience methods for common operations
  public subscribeToChannel(channelId: number): void {
    this.send({
      action: "subscribe",
      channelId
    });
  }

  public unsubscribeFromChannel(channelId: number): void {
    this.send({
      action: "unsubscribe",
      channelId
    });
  }

  public sendMessage(channelId: number, content: string): void {
    this.send({
      action: "message",
      channelId,
      content
    });
  }

  public sendTypingIndicator(channelId: number): void {
    this.send({
      action: "typing",
      channelId
    });
  }
}

// Create singleton instance
export const websocketService = new WebSocketService();