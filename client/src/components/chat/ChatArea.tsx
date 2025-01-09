import { useState } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import Message from "./Message";
import MessageInput from "./MessageInput";
import { Button } from "@/components/ui/button";
import { Hash, Bot, Pin, Users } from "lucide-react";

interface ChatAreaProps {
  channelId: string | null;
}

export default function ChatArea({ channelId }: ChatAreaProps) {
  const [messages] = useState<any[]>([]); // Will be replaced with real data

  if (!channelId) {
    return (
      <div className="h-screen flex items-center justify-center text-muted-foreground">
        Select a channel to start chatting
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col">
      {/* Channel Header */}
      <div className="p-4 border-b flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Hash className="w-5 h-5 text-muted-foreground" />
          <h2 className="font-semibold">general</h2>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon">
            <Bot className="w-5 h-5" />
          </Button>
          <Button variant="ghost" size="icon">
            <Pin className="w-5 h-5" />
          </Button>
          <Button variant="ghost" size="icon">
            <Users className="w-5 h-5" />
          </Button>
        </div>
      </div>

      {/* Messages Area */}
      <ScrollArea className="flex-1 p-4">
        {messages.map((message, i) => (
          <Message key={i} message={message} />
        ))}
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
            <Hash className="w-12 h-12 mb-4" />
            <h3 className="text-xl font-semibold mb-2">Welcome to #general</h3>
            <p>This is the start of the channel</p>
          </div>
        )}
      </ScrollArea>

      {/* Message Input */}
      <div className="p-4 border-t">
        <MessageInput channelId={channelId} />
      </div>
    </div>
  );
}
