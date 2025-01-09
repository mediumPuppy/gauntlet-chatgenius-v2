import { useState, useRef, useEffect } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import Message from "./Message";
import MessageInput from "./MessageInput";
import { Button } from "@/components/ui/button";
import {
  Hash,
  Bot,
  Pin,
  Users,
  Search,
  Info,
  MessageSquare,
  ChevronDown,
  Smile
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from "@/components/ui/context-menu";
import EmojiPicker from "./EmojiPicker";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { getStatusColor, formatStatus } from "@/lib/utils";

interface ChatAreaProps {
  channelId: string | null;
}

// Mock function to get channel info - will be replaced with real data later
const getChannelInfo = (channelId: string) => {
  return {
    id: channelId,
    name: "general",
    topic: "General discussion",
    isDm: false,
    memberCount: 24,
    pinnedCount: 5,
    isPrivate: false,
    unreadCount: 0
  };
};

export default function ChatArea({ channelId }: ChatAreaProps) {
  const [messages] = useState<any[]>([
    {
      id: '1',
      user: { name: 'John Doe', avatar: '' },
      content: 'Hello team! Here\'s the latest update on our project.',
      timestamp: '11:30 AM',
      reactions: [
        { emoji: '👍', count: 3 },
        { emoji: '🎉', count: 2 }
      ],
      threadCount: 5,
      isUnread: true,
      thread: [
        {
          id: 't1',
          user: { name: 'Alice Johnson', avatar: '' },
          content: 'Great update! Looking forward to the next phase.',
          timestamp: '11:35 AM',
          reactions: []
        },
        {
          id: 't2',
          user: { name: 'Bob Wilson', avatar: '' },
          content: 'Can you clarify the timeline?',
          timestamp: '11:40 AM',
          reactions: [{ emoji: '👍', count: 1 }]
        }
      ]
    },
    {
      id: '2',
      user: { name: 'Jane Smith', avatar: '' },
      content: 'Thanks for the update! The progress looks great.',
      timestamp: '11:32 AM',
      reactions: [
        { emoji: '❤️', count: 1 }
      ],
      threadCount: 0,
      isUnread: true,
      thread: []
    }
  ]);

  const [showSearch, setShowSearch] = useState(false);
  const [activeThread, setActiveThread] = useState<string | null>(null);
  const [showScrollToBottom, setShowScrollToBottom] = useState(false);
  const [hasUnreadBelow, setHasUnreadBelow] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const lastMessageRef = useRef<HTMLDivElement>(null);
  const channel = channelId ? getChannelInfo(channelId) : null;

  // Handle scroll
  const handleScroll = (event: React.UIEvent<HTMLDivElement>) => {
    const { scrollTop, scrollHeight, clientHeight } = event.currentTarget;
    const isNearBottom = scrollHeight - scrollTop - clientHeight < 100;
    setShowScrollToBottom(!isNearBottom);

    // If scrolled up and more messages available, load more
    if (scrollTop < 100) {
      // TODO: Implement loading more messages
      console.log("Load more messages");
    }
  };

  // Scroll to bottom
  const scrollToBottom = () => {
    lastMessageRef.current?.scrollIntoView({ behavior: 'smooth' });
    setHasUnreadBelow(false);
  };

  // Auto scroll to bottom on new message
  useEffect(() => {
    if (messages.length > 0) {
      const isNearBottom = 
        scrollAreaRef.current && 
        scrollAreaRef.current.scrollHeight - scrollAreaRef.current.scrollTop - scrollAreaRef.current.clientHeight < 100;

      if (isNearBottom) {
        scrollToBottom();
      } else {
        setHasUnreadBelow(true);
      }
    }
  }, [messages]);

  const handleReaction = (messageId: string, emoji: string) => {
    console.log(`Adding reaction ${emoji} to message ${messageId}`);
    // Will be implemented with real data later
  };

  if (!channelId || !channel) {
    return (
      <div className="h-screen flex items-center justify-center text-muted-foreground">
        Select a channel to start chatting
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-background">
      {/* Channel Header */}
      <div className="px-4 h-14 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 flex items-center justify-between">
        <div className="flex items-center gap-2">
          {channel.isDm ? (
            <div className="relative">
              <Avatar className="h-6 w-6">
                <AvatarImage src={channel.avatar} />
                <AvatarFallback>{channel.name.slice(0, 2).toUpperCase()}</AvatarFallback>
              </Avatar>
            </div>
          ) : (
            <Hash className="w-4 h-4 text-muted-foreground" />
          )}
          <h2 className="font-medium text-sm">{channel.name}</h2>
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <span>•</span>
            <span>{channel.memberCount} members</span>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon" className="w-8 h-8">
            <Search className="w-4 h-4" />
          </Button>
          <Button variant="ghost" size="icon" className="w-8 h-8">
            <Pin className="w-4 h-4" />
          </Button>
          <Button variant="ghost" size="icon" className="w-8 h-8">
            <Users className="w-4 h-4" />
          </Button>
        </div>
      </div>

      <div className="flex-1 relative">
        <ScrollArea 
          className="h-full" 
          onScroll={handleScroll}
          ref={scrollAreaRef}
        >
          <div className="p-4 space-y-2">
            {messages.map((message, index) => (
              <div key={message.id} ref={index === messages.length - 1 ? lastMessageRef : undefined}>
                {message.isUnread && index > 0 && !messages[index - 1].isUnread && (
                  <div className="flex items-center gap-2 py-1 text-xs">
                    <div className="h-px flex-1 bg-border" />
                    <span className="text-muted-foreground px-2">New messages</span>
                    <div className="h-px flex-1 bg-border" />
                  </div>
                )}
                <ContextMenu>
                  <ContextMenuTrigger>
                    <Message message={message} />
                  </ContextMenuTrigger>
                  <ContextMenuContent>
                    <EmojiPicker onEmojiSelect={(emoji) => handleReaction(message.id, emoji)}>
                      <Button variant="ghost" className="w-full justify-start gap-2 text-sm">
                        <Smile className="w-4 h-4" />
                        Add Reaction
                      </Button>
                    </EmojiPicker>
                  </ContextMenuContent>
                </ContextMenu>
              </div>
            ))}
          </div>
        </ScrollArea>

        {/* Scroll to bottom button */}
        {showScrollToBottom && (
          <Button
            variant="secondary"
            size="sm"
            className={cn(
              "absolute bottom-4 right-4 gap-2 shadow-md transition-colors",
              hasUnreadBelow ? "bg-primary text-primary-foreground" : "bg-background"
            )}
            onClick={scrollToBottom}
          >
            <ChevronDown className="h-4 w-4" />
            {hasUnreadBelow ? "New messages" : "Scroll to bottom"}
          </Button>
        )}
      </div>

      <div className="p-4 border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <MessageInput channelId={channelId} channelName={channel.name} />
      </div>
    </div>
  );
}