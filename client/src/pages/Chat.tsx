import { ResizablePanelGroup, ResizablePanel } from "@/components/ui/resizable";
import ChannelList from "@/components/chat/ChannelList";
import ChatArea from "@/components/chat/ChatArea";
import WorkspaceSwitcher from "@/components/workspace/WorkspaceSwitcher";
import UserProfile from "@/components/workspace/UserProfile";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { useState } from "react";
import { useParams } from "wouter";

interface Params {
  workspaceId?: string;
  channelId?: string;
}

export default function Chat() {
  const params = useParams<Params>();
  const [selectedChannel, setSelectedChannel] = useState<string | null>(params?.channelId || null);

  return (
    <div className="h-screen flex flex-col">
      <ResizablePanelGroup direction="horizontal">
        {/* Workspace & Channel Sidebar */}
        <ResizablePanel defaultSize={20} minSize={15} maxSize={25}>
          <div className="h-screen flex flex-col bg-sidebar">
            <WorkspaceSwitcher />
            <Separator />
            <ScrollArea className="flex-1">
              <ChannelList 
                selectedChannel={selectedChannel}
                onChannelSelect={setSelectedChannel}
              />
            </ScrollArea>
            <Separator />
            <UserProfile />
          </div>
        </ResizablePanel>

        {/* Chat Area */}
        <ResizablePanel defaultSize={80}>
          <ChatArea channelId={selectedChannel} />
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  );
}