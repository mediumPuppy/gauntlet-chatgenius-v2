import { Hash, Lock, ChevronDown, Plus, Star, MessageSquare, MoreVertical } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useState } from "react";
import { getStatusColor } from "@/lib/utils";
import { NotificationSection } from "@/components/notifications/NotificationSection";
import { useQuery } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import { CreateChannelDialog } from "./CreateChannelDialog";
import { JoinChannelDialog } from "./JoinChannelDialog";
import { CreateDMDialog } from "./CreateDMDialog";

interface ChannelListProps {
  selectedChannel: string | null;
  onChannelSelect: (channelId: string) => void;
}

// Type for channel from API
interface Channel {
  id: number;
  name: string;
  type: string;
  topic: string | null;
  isPrivate: boolean;
  isDm: boolean;
  settings: Record<string, any>;
  lastMessage: any | null;
  createdAt: string;
}

export default function ChannelList({ selectedChannel, onChannelSelect }: ChannelListProps) {
  const [expandedSections, setExpandedSections] = useState({
    starred: true,
    channels: true,
    directMessages: true,
  });
  const [showLeaveDialog, setShowLeaveDialog] = useState<{show: boolean, channelId: string, channelName: string} | null>(null);

  // Fetch channels from API
  const { data: channels, isLoading, error } = useQuery<Channel[]>({
    queryKey: ['/api/workspaces/1/channels'],
  });

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  const handleContextMenu = (action: string, channelId: string) => {
    switch (action) {
      case 'leave':
        const channel = channels?.find(c => c.id.toString() === channelId);
        if (channel) {
          setShowLeaveDialog({
            show: true,
            channelId,
            channelName: channel.name,
          });
        }
        break;
    }
  };

  const handleLeaveChannel = () => {
    if (showLeaveDialog) {
      console.log(`Left ${showLeaveDialog.channelName} channel`);
      setShowLeaveDialog(null);
    }
  };

  const ChannelItem = ({ 
    channel,
    icon: Icon,
    showContextMenu = true,
    isDm = false,
  }: { 
    channel: Channel, 
    icon: any,
    showContextMenu?: boolean,
    isDm?: boolean,
  }) => (
    <div
      className={cn(
        "group w-full flex items-center justify-between px-2 py-1 rounded hover:bg-sidebar-accent text-sidebar-foreground",
        selectedChannel === channel.id.toString() && "bg-sidebar-accent text-sidebar-accent-foreground"
      )}
    >
      <button
        onClick={() => onChannelSelect(channel.id.toString())}
        className="flex-1 flex items-center gap-2 text-left"
      >
        <Icon className="w-4 h-4" />
        <span>{channel.name}</span>
      </button>
      {showContextMenu && (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="w-6 h-6 opacity-0 group-hover:opacity-100"
            >
              <MoreVertical className="w-4 h-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem 
              onClick={() => handleContextMenu('leave', channel.id.toString())}
              className="text-destructive"
            >
              Leave channel
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )}
    </div>
  );

  // Handle loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  // Handle error state
  if (error) {
    return (
      <div className="p-4 text-sm text-destructive">
        Failed to load channels. Please try again.
      </div>
    );
  }

  // Group channels
  const groupedChannels = channels?.reduce((acc, channel) => {
    if (channel.isDm) {
      acc.directMessages.push(channel);
    } else {
      acc.channels.push(channel);
    }
    return acc;
  }, { channels: [] as Channel[], directMessages: [] as Channel[] });

  return (
    <>
      <div className="p-2 space-y-4">
        {/* Notifications Section */}
        <NotificationSection />

        {/* Regular Channels */}
        <div className="space-y-1">
          <div className="flex items-center justify-between p-2 text-sidebar-foreground">
            <button 
              onClick={() => toggleSection('channels')}
              className="flex items-center gap-1 font-semibold hover:text-sidebar-accent-foreground transition-colors"
            >
              <ChevronDown className={cn(
                "w-4 h-4 transition-transform duration-200",
                !expandedSections.channels && "transform -rotate-90"
              )} />
              Channels
            </button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="w-6 h-6">
                  <Plus className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem asChild>
                  <CreateChannelDialog />
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <JoinChannelDialog />
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          {expandedSections.channels && groupedChannels?.channels.map((channel) => (
            <ChannelItem 
              key={channel.id} 
              channel={channel} 
              icon={channel.isPrivate ? Lock : Hash}
            />
          ))}
        </div>

        {/* Direct Messages */}
        <div className="space-y-1">
          <div className="flex items-center justify-between p-2 text-sidebar-foreground">
            <button 
              onClick={() => toggleSection('directMessages')}
              className="flex items-center gap-1 font-semibold hover:text-sidebar-accent-foreground transition-colors"
            >
              <ChevronDown className={cn(
                "w-4 h-4 transition-transform duration-200",
                !expandedSections.directMessages && "transform -rotate-90"
              )} />
              Direct Messages
            </button>
            <CreateDMDialog
              trigger={
                <Button variant="ghost" size="icon" className="w-6 h-6">
                  <Plus className="w-4 h-4" />
                </Button>
              }
            />
          </div>
          {expandedSections.directMessages && groupedChannels?.directMessages.map((channel) => (
            <ChannelItem 
              key={channel.id} 
              channel={channel} 
              icon={MessageSquare}
              showContextMenu={false}
              isDm={true}
            />
          ))}
        </div>
      </div>

      <AlertDialog open={showLeaveDialog?.show} onOpenChange={() => setShowLeaveDialog(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Leave Channel</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to leave #{showLeaveDialog?.channelName}? You won't be able to see any new messages in this channel until you're re-added.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex justify-center gap-2 sm:justify-center">
            <AlertDialogCancel className="mt-0">Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleLeaveChannel} 
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90 min-w-[100px] px-4"
            >
              Leave Channel
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}