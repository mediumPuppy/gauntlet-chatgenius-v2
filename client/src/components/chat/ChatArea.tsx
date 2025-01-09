import { useState } from "react";
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
  X
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

interface ChatAreaProps {
  channelId: string | null;
}

// Mock function to get channel info - will be replaced with real data later
const getChannelInfo = (channelId: string) => {
  const allChannels = [
    ...channels.starred,
    ...channels.channels,
    ...channels.directMessages
  ];
  const channel = allChannels.find(c => c.id === channelId);
  if (channel) {
    return {
      ...channel,
      topic: "This is the main channel for team discussions and announcements",
      memberCount: 24,
      pinnedCount: 5
    };
  }
  return null;
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
      thread: []
    }
  ]); 

  const [showSearch, setShowSearch] = useState(false);
  const [activeThread, setActiveThread] = useState<string | null>(null);
  const channel = channelId ? getChannelInfo(channelId) : null;

  const handleReaction = (messageId: string, emoji: string) => {
    console.log(`Adding reaction ${emoji} to message ${messageId}`);
    // Will be implemented with real data later
  };

  const handleThreadClick = (messageId: string) => {
    setActiveThread(activeThread === messageId ? null : messageId);
  };

  if (!channelId || !channel) {
    return (
      <div className="h-screen flex items-center justify-center text-muted-foreground">
        Select a channel to start chatting
      </div>
    );
  }

  const activeThreadMessage = activeThread 
    ? messages.find(m => m.id === activeThread)
    : null;

  return (
    <div className="h-screen flex flex-col">
      {/* Enhanced Channel Header */}
      <div className="p-4 border-b">
        <div className="flex items-center justify-between">
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <Hash className="w-5 h-5 text-muted-foreground" />
              <h2 className="font-semibold">{channel.name}</h2>
              <div className="text-xs text-muted-foreground">
                {channel.memberCount} members
              </div>
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
                  <SheetTitle>Channel Info</SheetTitle>
                </SheetHeader>
                <div className="space-y-4 mt-4">
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
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
        {/* Search Bar - Only shown when search is active */}
        {showSearch && (
          <div className="mt-2">
            <input
              type="text"
              placeholder="Search in channel..."
              className="w-full px-3 py-2 rounded-md border bg-background"
            />
          </div>
        )}
      </div>

      {/* Main Content Area with Messages and Thread */}
      <div className="flex-1 flex">
        {/* Messages Area */}
        <ScrollArea className={cn(
          "flex-1 p-4",
          activeThread && "border-r"
        )}>
          <div className="space-y-4">
            {messages.map((message) => (
              <ContextMenu>
                <ContextMenuTrigger>
                  <div key={message.id} className="group">
                    <div className="flex items-start gap-3 hover:bg-muted/50 p-2 rounded-lg">
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                        {message.user.name.charAt(0)}
                      </div>
                      <div className="flex-1 space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold">{message.user.name}</span>
                          <span className="text-xs text-muted-foreground">
                            {message.timestamp}
                          </span>
                        </div>
                        <p className="text-sm">{message.content}</p>

                        {/* Reactions and Thread */}
                        <div className="flex items-center gap-4 mt-2">
                          <div className="flex -space-x-1">
                            {message.reactions.map((reaction: any, i: number) => (
                              <div
                                key={i}
                                className="px-2 py-1 text-xs bg-muted rounded-full flex items-center gap-1"
                              >
                                <span>{reaction.emoji}</span>
                                <span>{reaction.count}</span>
                              </div>
                            ))}
                          </div>

                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className={cn(
                              "text-xs gap-1",
                              message.threadCount > 0 ? "text-primary" : "text-muted-foreground"
                            )}
                            onClick={() => handleThreadClick(message.id)}
                          >
                            <MessageSquare className="w-4 h-4" />
                            {message.threadCount > 0 
                              ? `${message.threadCount} ${message.threadCount === 1 ? 'reply' : 'replies'}`
                              : 'Reply in thread'
                            }
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </ContextMenuTrigger>
                <ContextMenuContent>
                  <ContextMenuItem onClick={() => handleReaction(message.id, '👍')}>
                    Add 👍
                  </ContextMenuItem>
                  <ContextMenuItem onClick={() => handleReaction(message.id, '🎉')}>
                    Add 🎉
                  </ContextMenuItem>
                  <ContextMenuItem onClick={() => handleReaction(message.id, '❤️')}>
                    Add ❤️
                  </ContextMenuItem>
                </ContextMenuContent>
              </ContextMenu>
            ))}
          </div>
          {messages.length === 0 && (
            <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
              <Hash className="w-12 h-12 mb-4" />
              <h3 className="text-xl font-semibold mb-2">Welcome to #{channel.name}</h3>
              <p>This is the start of the channel</p>
            </div>
          )}
        </ScrollArea>

        {/* Thread Panel */}
        {activeThread && activeThreadMessage && (
          <div className="w-96 flex flex-col border-l">
            {/* Thread Header */}
            <div className="p-4 border-b flex items-center justify-between">
              <h3 className="font-semibold">Thread</h3>
              <Button 
                variant="ghost" 
                size="icon"
                onClick={() => setActiveThread(null)}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>

            {/* Original Message */}
            <div className="p-4 border-b bg-muted/30">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-sm">
                  {activeThreadMessage.user.name.charAt(0)}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-sm">{activeThreadMessage.user.name}</span>
                    <span className="text-xs text-muted-foreground">{activeThreadMessage.timestamp}</span>
                  </div>
                  <p className="text-sm mt-1">{activeThreadMessage.content}</p>
                </div>
              </div>
            </div>

            {/* Thread Replies */}
            <ScrollArea className="flex-1 p-4">
              <div className="space-y-4">
                {activeThreadMessage.thread.map((reply: any) => (
                  <div key={reply.id} className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-sm">
                      {reply.user.name.charAt(0)}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-sm">{reply.user.name}</span>
                        <span className="text-xs text-muted-foreground">{reply.timestamp}</span>
                      </div>
                      <p className="text-sm mt-1">{reply.content}</p>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>

            {/* Thread Input */}
            <div className="p-4 border-t">
              <MessageInput 
                channelId={channelId} 
                channelName={`Thread in ${channel.name}`}
              />
            </div>
          </div>
        )}
      </div>

      {/* Message Input */}
      <div className="p-4 border-t">
        <MessageInput channelId={channelId} channelName={channel.name} />
      </div>
    </div>
  );
}

// This is just for the getChannelInfo function, will be replaced with real data later
const channels = {
  starred: [
    { id: "1", name: "announcements", isPrivate: false, unreadCount: 2 },
    { id: "2", name: "important", isPrivate: true, unreadCount: 0 },
  ],
  channels: [
    { id: "3", name: "general", isPrivate: false, unreadCount: 5 },
    { id: "4", name: "random", isPrivate: false, unreadCount: 0 },
    { id: "5", name: "team-only", isPrivate: true, unreadCount: 3 },
  ],
  directMessages: [
    { id: "6", name: "Jane Smith", isOnline: true, unreadCount: 1 },
    { id: "7", name: "John Doe", isOnline: false, unreadCount: 0 },
    { id: "8", name: "Alice Johnson", isOnline: true, unreadCount: 4 },
  ],
};