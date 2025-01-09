import { ResizablePanelGroup, ResizablePanel } from "@/components/ui/resizable";
import ChannelList from "@/components/chat/ChannelList";
import ChatArea from "@/components/chat/ChatArea";
import WorkspaceSwitcher from "@/components/workspace/WorkspaceSwitcher";
import UserProfile from "@/components/workspace/UserProfile";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { useState, useEffect } from "react";
import { useParams, useLocation } from "wouter";
import OnboardingTour from "@/components/onboarding/OnboardingTour";

interface Params {
  workspaceId?: string;
  channelId?: string;
}

export default function Chat() {
  const params = useParams<Params>();
  const [location] = useLocation();
  const [selectedChannel, setSelectedChannel] = useState<string | null>(params?.channelId || null);
  const [showOnboarding, setShowOnboarding] = useState(false);

  useEffect(() => {
    // Check if showOnboarding is in the URL
    const searchParams = new URLSearchParams(location.split('?')[1]);
    if (searchParams.get('showOnboarding') === 'true') {
      setShowOnboarding(true);
    }
  }, [location]);

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

      <OnboardingTour
        isOpen={showOnboarding}
        onClose={() => setShowOnboarding(false)}
      />
    </div>
  );
}