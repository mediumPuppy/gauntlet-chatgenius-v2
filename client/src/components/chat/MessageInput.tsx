import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Paperclip, Smile, Bot } from "lucide-react";

interface MessageInputProps {
  channelId: string;
  channelName: string;
}

export default function MessageInput({ channelId, channelName }: MessageInputProps) {
  return (
    <div className="relative">
      <Textarea
        placeholder={`Message ${channelName}`}
        className="min-h-[80px] resize-none pr-20"
      />
      <div className="absolute bottom-2 right-2 flex items-center gap-2">
        <Button variant="ghost" size="icon" className="h-8 w-8">
          <Bot className="h-5 w-5" />
        </Button>
        <Button variant="ghost" size="icon" className="h-8 w-8">
          <Paperclip className="h-5 w-5" />
        </Button>
        <Button variant="ghost" size="icon" className="h-8 w-8">
          <Smile className="h-5 w-5" />
        </Button>
      </div>
    </div>
  );
}