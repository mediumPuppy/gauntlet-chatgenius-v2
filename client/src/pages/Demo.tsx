import { MessageComposer } from '@/components/message/MessageComposer';
import { useToast } from '@/hooks/use-toast';

export function Demo() {
  const { toast } = useToast();

  const handleSend = (content: any, files?: any[]) => {
    toast({
      title: 'Message sent',
      description: `Content: ${content.rawText}\nFiles: ${files?.length ?? 0}`,
    });
    console.log('Message content:', content);
    console.log('Files:', files);
  };

  return (
    <div className="container max-w-2xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Message Composer Demo</h1>
      <MessageComposer onSend={handleSend} />
    </div>
  );
}
