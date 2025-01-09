import { MessageComposer } from '@/components/message/MessageComposer';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { showSystemNotification, showError } from '@/lib/notifications';
import { useState } from 'react';

export function Demo() {
  const { toast } = useToast();
  const [isConnected, setIsConnected] = useState(true);

  const handleSend = (content: any, files?: any[]) => {
    toast({
      title: 'Message sent',
      description: `Content: ${content.rawText}\nFiles: ${files?.length ?? 0}`,
    });
    console.log('Message content:', content);
    console.log('Files:', files);
  };

  const simulateConnectionError = () => {
    setIsConnected(false);
    showError("Could not connect to server. Please check your internet connection.");
  };

  const simulateReconnection = () => {
    setIsConnected(true);
    showSystemNotification("Successfully reconnected to server");
  };

  return (
    <div className="container max-w-2xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">System Notifications Demo</h1>

      <div className="space-y-4 mb-8">
        <div className="flex gap-4">
          <Button
            variant="destructive"
            onClick={simulateConnectionError}
            disabled={!isConnected}
          >
            Simulate Connection Error
          </Button>
          <Button
            variant="default"
            onClick={simulateReconnection}
            disabled={isConnected}
          >
            Simulate Reconnection
          </Button>
        </div>
      </div>

      <h2 className="text-xl font-bold mb-4">Message Composer Demo</h2>
      <MessageComposer onSend={handleSend} />
    </div>
  );
}