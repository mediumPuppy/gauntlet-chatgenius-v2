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
        "group flex gap-3 py-1 px-2 hover:bg-muted/50 rounded-md transition-colors",
        message.isUnread && "bg-primary/5"
      )}
    >
      <Avatar className="h-8 w-8 shrink-0">
        <AvatarImage src={message.user?.avatar} />
        <AvatarFallback className="text-xs">
          {message.user?.name.slice(0, 2).toUpperCase()}
        </AvatarFallback>
      </Avatar>

      <div className="flex-1 space-y-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="font-medium text-sm">{message.user?.name}</span>
          <span className="text-xs text-muted-foreground">{message.timestamp}</span>
        </div>
        <p className="text-sm break-words">{message.content}</p>

        {/* Reactions */}
        {message.reactions && message.reactions.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-1">
            {message.reactions.map((reaction, index) => (
              <div
                key={`${reaction.emoji}-${index}`}
                className="px-2 py-0.5 text-xs bg-muted rounded-full flex items-center gap-1 hover:bg-muted/80 cursor-pointer"
              >
                <span>{reaction.emoji}</span>
                <span className="text-muted-foreground">{reaction.count}</span>
              </div>
            ))}
          </div>
        )}

        {/* Thread count */}
        {message.threadCount && message.threadCount > 0 && (
          <div className="mt-1">
            <Button
              variant="ghost"
              size="sm"
              className="h-6 text-xs gap-1 text-muted-foreground hover:text-foreground"
            >
              <MessageSquare className="h-3 w-3" />
              {message.threadCount} {message.threadCount === 1 ? 'reply' : 'replies'}
            </Button>
          </div>
        )}
      </div>

      <div className="flex items-start gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
        <Button variant="ghost" size="icon" className="h-6 w-6">
          <Smile className="h-3 w-3" />
        </Button>
        <Button variant="ghost" size="icon" className="h-6 w-6">
          <MessageSquare className="h-3 w-3" />
        </Button>
        <Button variant="ghost" size="icon" className="h-6 w-6">
          <MoreHorizontal className="h-3 w-3" />
        </Button>
      </div>
    </div>
  );
}