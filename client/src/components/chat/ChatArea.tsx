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
    <div className="h-screen flex flex-col">
      {/* Channel Header - unchanged */}
      <div className="p-4 border-b">
        <div className="flex items-center justify-between">
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              {channel.isDm ? (
                <div className="relative">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={channel.avatar} />
                    <AvatarFallback>
                      {channel.name.split(' ').map(n => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                  <div className={cn(
                    "absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full border-2 border-background",
                    getStatusColor(channel.status, channel.isOnline)
                  )} />
                </div>
              ) : (
                <Hash className="w-5 h-5 text-muted-foreground" />
              )}
              <h2 className="font-semibold">{channel.name}</h2>
              {channel.isDm && channel.status && (
                <span className="text-xs text-muted-foreground">
                  {formatStatus(channel.status)}
                </span>
              )}
              {!channel.isDm && (
                <div className="text-xs text-muted-foreground">
                  {channel.memberCount} members
                </div>
              )}
            </div>
            <p className="text-sm text-muted-foreground mt-1">{channel.topic}</p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setShowSearch(!showSearch)}
            >
              <Search className="w-5 h-5" />
            </Button>
            <Button variant="ghost" size="icon">
              <Bot className="w-5 h-5" />
            </Button>
            <Button variant="ghost" size="icon">
              <Pin className="w-5 h-5" />
            </Button>
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Info className="w-5 h-5" />
                </Button>
              </SheetTrigger>
              <SheetContent>
                <SheetHeader>
                  <SheetTitle>{channel.isDm ? "Chat Info" : "Channel Info"}</SheetTitle>
                </SheetHeader>
                <div className="space-y-4 mt-4">
                  {!channel.isDm && (
                    <>
                      <div>
                        <h3 className="font-semibold mb-2">About</h3>
                        <p className="text-sm text-muted-foreground">{channel.topic}</p>
                      </div>
                      <div>
                        <h3 className="font-semibold mb-2">Members</h3>
                        <p className="text-sm">{channel.memberCount} members</p>
                      </div>
                      <div>
                        <h3 className="font-semibold mb-2">Pinned Items</h3>
                        <p className="text-sm">{channel.pinnedCount} pinned messages</p>
                      </div>
                    </>
                  )}
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
        {showSearch && (
          <div className="mt-2">
            <input
              type="text"
              placeholder="Search in chat..."
              className="w-full px-3 py-2 rounded-md border bg-background"
            />
          </div>
        )}
      </div>

      <div className="flex-1 relative">
        <ScrollArea 
          className="h-full" 
          onScroll={handleScroll}
          ref={scrollAreaRef}
        >
          <div className="p-4 space-y-4">
            {messages.map((message, index) => (
              <div key={message.id} ref={index === messages.length - 1 ? lastMessageRef : undefined}>
                {message.isUnread && index > 0 && !messages[index - 1].isUnread && (
                  <div className="flex items-center gap-2 py-2 text-sm text-primary">
                    <div className="h-px flex-1 bg-primary/20" />
                    <span>New messages</span>
                    <div className="h-px flex-1 bg-primary/20" />
                  </div>
                )}
                <ContextMenu>
                  <ContextMenuTrigger>
                    <Message message={message} />
                  </ContextMenuTrigger>
                  <ContextMenuContent>
                    <EmojiPicker onEmojiSelect={(emoji) => handleReaction(message.id, emoji)}>
                      <Button variant="ghost" className="w-full justify-start">
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
              "absolute bottom-4 right-4 gap-2 shadow-lg transition-opacity",
              hasUnreadBelow ? "bg-primary text-primary-foreground" : ""
            )}
            onClick={scrollToBottom}
          >
            <ChevronDown className="h-4 w-4" />
            {hasUnreadBelow ? "New messages" : "Scroll to bottom"}
          </Button>
        )}
      </div>

      <div className="p-4 border-t">
        <MessageInput channelId={channelId} channelName={channel.name} />
      </div>
    </div>
  );
}