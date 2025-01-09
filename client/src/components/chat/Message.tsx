import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { MessageSquare, Smile, MoreHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";

interface MessageProps {
  message: {
    id: string;
    content: string;
    user: {
      name: string;
      avatar: string;
    };
    timestamp: string;
  };
}

export default function Message({ message }: MessageProps) {
  return (
    <div className="group flex gap-4 py-2 px-2 hover:bg-muted/50 rounded">
      <Avatar className="h-10 w-10">
        <AvatarImage src={message.user?.avatar} />
        <AvatarFallback>
          {message.user?.name.slice(0, 2).toUpperCase()}
        </AvatarFallback>
      </Avatar>

      <div className="flex-1 space-y-1">
        <div className="flex items-center gap-2">
          <span className="font-semibold">{message.user?.name}</span>
          <span className="text-xs text-muted-foreground">{message.timestamp}</span>
        </div>
        <p className="text-sm">{message.content}</p>
      </div>

      <div className="flex items-start gap-1 opacity-0 group-hover:opacity-100">
        <Button variant="ghost" size="icon" className="h-8 w-8">
          <Smile className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="icon" className="h-8 w-8">
          <MessageSquare className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="icon" className="h-8 w-8">
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
