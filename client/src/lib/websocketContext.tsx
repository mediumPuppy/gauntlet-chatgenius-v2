import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { websocketService, type WebSocketMessage, type ConnectionStatus } from "./websocketService";
import { useToast } from "@/hooks/use-toast";

interface WebSocketContextType {
  send: (message: WebSocketMessage) => void;
  status: ConnectionStatus;
  subscribeToChannel: (channelId: number) => void;
  unsubscribeFromChannel: (channelId: number) => void;
  sendMessage: (channelId: number, content: string) => void;
  sendTypingIndicator: (channelId: number) => void;
}

const WebSocketContext = createContext<WebSocketContextType | null>(null);

// Make WebSocketProvider a named export
export function WebSocketProvider({ children }: { children: ReactNode }) {
  const [status, setStatus] = useState<ConnectionStatus>(websocketService.getStatus());
  const { toast } = useToast();

  useEffect(() => {
    // Subscribe to WebSocket events
    const unsubscribe = websocketService.subscribe((message) => {
      if (message.action === 'status') {
        setStatus(message.status);

        // Show connection status changes
        if (message.status === 'connected') {
          toast({
            title: "Connected",
            description: "WebSocket connection established",
          });
        } else if (message.status === 'disconnected' && message.code === 1008) {
          toast({
            title: "Connection Failed",
            description: "Authentication required. Please login again.",
            variant: "destructive",
          });
        }
      } else if (message.action === 'error') {
        toast({
          title: "Connection Error",
          description: message.error,
          variant: "destructive",
        });
      }
    });

    // Connect when the provider mounts
    websocketService.connect();

    // Cleanup on unmount
    return () => {
      unsubscribe();
      websocketService.disconnect();
    };
  }, [toast]);

  const value: WebSocketContextType = {
    send: (message) => websocketService.send(message),
    status,
    subscribeToChannel: (channelId) => websocketService.subscribeToChannel(channelId),
    unsubscribeFromChannel: (channelId) => websocketService.unsubscribeFromChannel(channelId),
    sendMessage: (channelId, content) => websocketService.sendMessage(channelId, content),
    sendTypingIndicator: (channelId) => websocketService.sendTypingIndicator(channelId),
  };

  return (
    <WebSocketContext.Provider value={value}>
      {children}
    </WebSocketContext.Provider>
  );
}

// Make useWebSocket a named export
export function useWebSocket() {
  const context = useContext(WebSocketContext);
  if (!context) {
    throw new Error("useWebSocket must be used within a WebSocketProvider");
  }
  return context;
}