import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { MessageSquare, Smile, MoreHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface MessageProps {
  message: {
    id: string;
    content: string;
    user: {
      name: string;
      avatar: string;
    };
    timestamp: string;
    isUnread?: boolean;
    reactions?: Array<{
      emoji: string;
      count: number;
    }>;
    threadCount?: number;
  };
}

export default function Message({ message }: MessageProps) {
  return (
    <div 
      className={cn(
        "group flex gap-4 py-2 px-2 hover:bg-muted/50 rounded transition-colors",
        message.isUnread && "bg-primary/5"
      )}
    >
      <Avatar className="h-10 w-10 shrink-0">
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

        {/* Reactions */}
        {message.reactions && message.reactions.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-2">
            {message.reactions.map((reaction, index) => (
              <div
                key={`${reaction.emoji}-${index}`}
                className="px-2 py-1 text-xs bg-muted rounded-full flex items-center gap-1 hover:bg-muted/80 cursor-pointer"
              >
                <span>{reaction.emoji}</span>
                <span>{reaction.count}</span>
              </div>
            ))}
          </div>
        )}

        {/* Thread count */}
        {message.threadCount && message.threadCount > 0 && (
          <div className="mt-2">
            <Button
              variant="ghost"
              size="sm"
              className="text-xs gap-1 text-muted-foreground hover:text-foreground"
            >
              <MessageSquare className="h-3 w-3" />
              {message.threadCount} {message.threadCount === 1 ? 'reply' : 'replies'}
            </Button>
          </div>
        )}
      </div>

      <div className="flex items-start gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
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