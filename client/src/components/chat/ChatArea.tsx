import { useState } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import Message from "./Message";
import { Button } from "@/components/ui/button";
import {
  Hash,
  Bot,
  Pin,
  Users,
  Search,
  Info,
  MessageSquare,
  X,
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
import { MessageComposer } from '@/components/message/MessageComposer';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { getStatusColor, formatStatus } from "@/lib/utils";
import data from '@emoji-mart/data';
import Picker from '@emoji-mart/react';
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";

interface ChatAreaProps {
  channelId: string | null;
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
    {
      id: "6",
      name: "Jane Smith",
      avatar: "https://example.com/jane.jpg",
      status: {
        text: "In a meeting",
        emoji: "🗣️",
        lastActive: new Date().toISOString()
      },
      isOnline: true,
      unreadCount: 1
    },
    {
      id: "7",
      name: "John Doe",
      avatar: "https://example.com/john.jpg",
      status: {
        text: "Away",
        emoji: "🌙",
        lastActive: new Date(Date.now() - 3600000).toISOString()
      },
      isOnline: false,
      unreadCount: 0
    },
    {
      id: "8",
      name: "Alice Johnson",
      avatar: "https://example.com/alice.jpg",
      status: {
        text: "Available",
        emoji: "💻",
        lastActive: new Date().toISOString()
      },
      isOnline: true,
      unreadCount: 4
    }
  ],
};

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
      isDm: Boolean(channels.directMessages.find(dm => dm.id === channelId)),
      topic: channel.isDm ? "Direct Message" : "This is the main channel for team discussions and announcements",
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

  const handleMessageSend = (content: any, files?: any[]) => {
    console.log('Message sent:', content);
    console.log('Files:', files);
    // Will be implemented with real data handling later
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
      {/* Enhanced Channel/DM Header */}
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

      <div className="flex-1">
        <ScrollArea className="h-full p-4">
          <div className="space-y-4">
            {messages.map((message) => (
              <ContextMenu key={message.id}>
                <ContextMenuTrigger>
                  <div className="group">
                    <div className="flex items-start gap-3 hover:bg-muted/50 p-2 rounded-lg">
                      {!channel.isDm && (
                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                          {message.user.name.charAt(0)}
                        </div>
                      )}
                      <div className="flex-1 space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold">{message.user.name}</span>
                          <span className="text-xs text-muted-foreground">
                            {message.timestamp}
                          </span>
                        </div>
                        <p className="text-sm">{message.content}</p>

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

                          <Sheet open={activeThread === message.id} onOpenChange={(open) => {
                            if (!open) setActiveThread(null);
                            else setActiveThread(message.id);
                          }}>
                            <SheetTrigger asChild>
                              <Button
                                variant="ghost"
                                size="sm"
                                className={cn(
                                  "text-xs gap-1",
                                  message.threadCount > 0 ? "text-primary" : "text-muted-foreground"
                                )}
                              >
                                <MessageSquare className="w-4 h-4" />
                                {message.threadCount > 0
                                  ? `${message.threadCount} ${message.threadCount === 1 ? 'reply' : 'replies'}`
                                  : 'Reply in thread'
                                }
                              </Button>
                            </SheetTrigger>
                            <SheetContent>
                              <SheetHeader>
                                <SheetTitle>Thread</SheetTitle>
                              </SheetHeader>

                              <div className="mt-4 p-4 border-b bg-muted/30 rounded-lg">
                                <div className="flex items-start gap-3">
                                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-sm">
                                    {message.user.name.charAt(0)}
                                  </div>
                                  <div>
                                    <div className="flex items-center gap-2">
                                      <span className="font-semibold text-sm">{message.user.name}</span>
                                      <span className="text-xs text-muted-foreground">{message.timestamp}</span>
                                    </div>
                                    <p className="text-sm mt-1">{message.content}</p>
                                  </div>
                                </div>
                              </div>

                              <ScrollArea className="flex-1 mt-4">
                                <div className="space-y-4">
                                  {message.thread.map((reply: any) => (
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

                              <div className="mt-4">
                                <MessageInput
                                  channelId={channelId}
                                  channelName={`Thread in ${channel.name}`}
                                />
                              </div>
                            </SheetContent>
                          </Sheet>
                        </div>
                      </div>
                    </div>
                  </div>
                </ContextMenuTrigger>
                <ContextMenuContent>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="ghost" className="w-full justify-start">
                        Add Reaction
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-full p-0" align="start">
                      <Picker
                        data={data}
                        onEmojiSelect={(emoji: any) => handleReaction(message.id, emoji.native)}
                        theme="light"
                        previewPosition="none"
                        skinTonePosition="none"
                      />
                    </PopoverContent>
                  </Popover>
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
      </div>

      <div className="p-4 border-t">
        <MessageComposer 
          onSend={handleMessageSend}
          placeholder={`Message ${channel.name}`}
        />
      </div>
    </div>
  );
}