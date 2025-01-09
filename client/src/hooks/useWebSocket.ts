import { useState, useEffect, useCallback, useRef } from 'react';
import { useToast } from '@/hooks/use-toast';

interface WebSocketMessage {
  action: string;
  channelId?: number;
  message?: any;
  error?: string;
}

export function useWebSocket() {
  const [isConnected, setIsConnected] = useState(false);
  const [isReconnecting, setIsReconnecting] = useState(false);
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout>();
  const messageQueueRef = useRef<any[]>([]);
  const { toast } = useToast();

  // Initialize WebSocket connection
  const connect = useCallback(() => {
    if (wsRef.current?.readyState === WebSocket.OPEN) return;

    // Use the same host as the current page
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const ws = new WebSocket(`${protocol}//${window.location.host}/ws`);

    ws.onopen = () => {
      setIsConnected(true);
      setIsReconnecting(false);

      // Flush queued messages
      while (messageQueueRef.current.length > 0) {
        const message = messageQueueRef.current.shift();
        if (message) sendMessage(message);
      }
    };

    ws.onclose = () => {
      setIsConnected(false);
      wsRef.current = null;

      // Attempt to reconnect
      if (!isReconnecting) {
        setIsReconnecting(true);
        reconnectTimeoutRef.current = setTimeout(() => {
          connect();
        }, 3000);
      }
    };

    ws.onerror = (error) => {
      console.error('WebSocket error:', error);
      toast({
        title: "Connection Error",
        description: "Failed to connect to chat server. Retrying...",
        variant: "destructive",
      });
    };

    ws.onmessage = (event) => {
      try {
        const data: WebSocketMessage = JSON.parse(event.data);

        switch (data.action) {
          case '$connect':
            console.log('Connected with ID:', data.message);
            break;

          case 'error':
            toast({
              title: "Error",
              description: data.error,
              variant: "destructive",
            });
            break;

          default:
            // Dispatch to message handlers
            handleMessage(data);
        }
      } catch (error) {
        console.error('Failed to parse WebSocket message:', error);
      }
    };

    wsRef.current = ws;
  }, [toast]);

  // Send a message through WebSocket
  const sendMessage = useCallback((message: any) => {
    if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) {
      messageQueueRef.current.push(message);
      return;
    }

    wsRef.current.send(JSON.stringify(message));
  }, []);

  // Subscribe to a channel
  const subscribeToChannel = useCallback((channelId: number) => {
    sendMessage({
      action: 'subscribe',
      channelId
    });
  }, [sendMessage]);

  // Unsubscribe from a channel
  const unsubscribeFromChannel = useCallback((channelId: number) => {
    sendMessage({
      action: 'unsubscribe',
      channelId
    });
  }, [sendMessage]);

  // Send a chat message
  const sendChatMessage = useCallback((channelId: number, content: string) => {
    sendMessage({
      action: 'message',
      channelId,
      content
    });
  }, [sendMessage]);

  // Send typing indicator
  const sendTypingIndicator = useCallback((channelId: number) => {
    sendMessage({
      action: 'typing',
      channelId
    });
  }, [sendMessage]);

  // Register message handler
  const handleMessage = (message: WebSocketMessage) => {
    // Handle different message types
    switch (message.action) {
      case 'message':
        // Handle new message
        break;
      case 'typing':
        // Handle typing indicator
        break;
    }
  };

  // Connect on mount, cleanup on unmount
  useEffect(() => {
    connect();

    return () => {
      if (wsRef.current) {
        wsRef.current.close();
      }
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
    };
  }, [connect]);

  return {
    isConnected,
    isReconnecting,
    subscribeToChannel,
    unsubscribeFromChannel,
    sendChatMessage,
    sendTypingIndicator
  };
}