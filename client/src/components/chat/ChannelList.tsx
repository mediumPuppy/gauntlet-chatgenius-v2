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

interface ChannelListProps {
  selectedChannel: string | null;
  onChannelSelect: (channelId: string) => void;
}

// Temporary mock data with enhanced structure matching schema
const initialChannels = {
  starred: [
    { id: "1", name: "announcements", isPrivate: false, unreadCount: 2, isMuted: false },
    { id: "2", name: "important", isPrivate: true, unreadCount: 0, isMuted: false },
  ],
  channels: [
    { id: "3", name: "general", isPrivate: false, unreadCount: 5, isMuted: false },
    { id: "4", name: "random", isPrivate: false, unreadCount: 0, isMuted: false },
    { id: "5", name: "team-only", isPrivate: true, unreadCount: 3, isMuted: false },
  ],
  directMessages: [
    { 
      id: "6", 
      name: "Jane Smith", 
      avatar: "https://via.placeholder.com/50", 
      status: { 
        text: "In a meeting",
        lastActive: new Date().toISOString()
      },
      isOnline: true, 
      unreadCount: 1,
      isMuted: false 
    },
    { 
      id: "7", 
      name: "John Doe", 
      avatar: "https://via.placeholder.com/50", 
      status: { 
        text: "Away",
        lastActive: new Date(Date.now() - 3600000).toISOString()
      },
      isOnline: false, 
      unreadCount: 0,
      isMuted: false 
    },
    { 
      id: "8", 
      name: "Alice Johnson", 
      avatar: "https://via.placeholder.com/50", 
      status: { 
        text: "Available",
        lastActive: new Date().toISOString()
      },
      isOnline: true, 
      unreadCount: 4,
      isMuted: false 
    },
  ],
};

export default function ChannelList({ selectedChannel, onChannelSelect }: ChannelListProps) {
  const [expandedSections, setExpandedSections] = useState({
    starred: true,
    channels: true,
    directMessages: true,
  });
  const [channels, setChannels] = useState(initialChannels);
  const [showLeaveDialog, setShowLeaveDialog] = useState<{show: boolean, channelId: string, channelName: string} | null>(null);

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  const sortChannels = (channelArray: any[]) => {
    return [...channelArray].sort((a, b) => {
      // Sort muted channels to the bottom
      if (a.isMuted && !b.isMuted) return 1;
      if (!a.isMuted && b.isMuted) return -1;
      return 0;
    });
  };

  const handleContextMenu = (action: string, channelId: string, section: keyof typeof channels) => {
    const updateChannelInSection = (channelList: any[]) => {
      return channelList.map(channel => {
        if (channel.id === channelId) {
          switch (action) {
            case 'mute':
              return { ...channel, isMuted: !channel.isMuted };
            case 'mark-read':
              return { ...channel, unreadCount: 0 };
            default:
              return channel;
          }
        }
        return channel;
      });
    };

    switch (action) {
      case 'mute':
      case 'mark-read':
        setChannels(prev => ({
          ...prev,
          [section]: sortChannels(updateChannelInSection(prev[section])),
        }));
        break;
      case 'leave':
        const channel = channels[section].find(c => c.id === channelId);
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
    section
  }: { 
    channel: any, 
    icon: any,
    showContextMenu?: boolean,
    isDm?: boolean,
    section: keyof typeof channels
  }) => (
    <div
      className={cn(
        "group w-full flex items-center justify-between px-2 py-1 rounded hover:bg-sidebar-accent text-sidebar-foreground",
        selectedChannel === channel.id && "bg-sidebar-accent text-sidebar-accent-foreground",
        channel.isMuted && "opacity-60"
      )}
    >
      <button
        onClick={() => onChannelSelect(channel.id)}
        className="flex-1 flex items-center gap-2 text-left"
      >
        {isDm ? (
          <div className="relative">
            <Avatar className="h-5 w-5">
              <AvatarImage src={channel.avatar} />
              <AvatarFallback className="text-xs">
                {channel.name.split(' ').map((n: string) => n[0]).join('')}
              </AvatarFallback>
            </Avatar>
            <div className={cn(
              "absolute bottom-0 right-0 w-2 h-2 rounded-full border border-background",
              getStatusColor(channel.status, channel.isOnline)
            )} />
          </div>
        ) : (
          <Icon className="w-4 h-4" />
        )}
        <span className={cn(
          channel.unreadCount > 0 && !channel.isMuted && "font-semibold",
          "transition-all duration-200"
        )}>
          {channel.name}
        </span>
        {channel.unreadCount > 0 && !channel.isMuted && (
          <Badge variant="secondary" className="ml-auto">
            {channel.unreadCount}
          </Badge>
        )}
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
            <DropdownMenuItem onClick={() => handleContextMenu('mute', channel.id, section)}>
              {channel.isMuted ? 'Unmute notifications' : 'Mute notifications'}
            </DropdownMenuItem>
            {channel.unreadCount > 0 && (
              <DropdownMenuItem onClick={() => handleContextMenu('mark-read', channel.id, section)}>
                Mark as read
              </DropdownMenuItem>
            )}
            <DropdownMenuItem 
              onClick={() => handleContextMenu('leave', channel.id, section)}
              className="text-destructive"
            >
              Leave channel
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )}
    </div>
  );

  const ChannelSection = ({ 
    title, 
    items, 
    icon, 
    section,
    showAdd = true,
    showContextMenu = true,
    isDm = false
  }: { 
    title: string, 
    items: any[], 
    icon: any,
    section: keyof typeof channels,
    showAdd?: boolean,
    showContextMenu?: boolean,
    isDm?: boolean
  }) => (
    <div className="space-y-1">
      <div className="flex items-center justify-between p-2 text-sidebar-foreground">
        <button 
          onClick={() => toggleSection(section)}
          className="flex items-center gap-1 font-semibold hover:text-sidebar-accent-foreground transition-colors"
        >
          <ChevronDown className={cn(
            "w-4 h-4 transition-transform duration-200",
            !expandedSections[section] && "transform -rotate-90"
          )} />
          {title}
        </button>
        {showAdd && (
          <Button variant="ghost" size="icon" className="w-6 h-6">
            <Plus className="w-4 h-4" />
          </Button>
        )}
      </div>
      {expandedSections[section] && (
        <div className="space-y-1">
          {items.map((item) => (
            <ChannelItem 
              key={item.id} 
              channel={item} 
              icon={icon}
              showContextMenu={showContextMenu}
              isDm={isDm}
              section={section}
            />
          ))}
        </div>
      )}
    </div>
  );

  return (
    <>
      <div className="p-2 space-y-4">
        {/* Starred Channels */}
        {channels.starred.length > 0 && (
          <ChannelSection
            title="Starred"
            items={sortChannels(channels.starred)}
            icon={Star}
            section="starred"
            showAdd={false}
          />
        )}

        {/* Regular Channels */}
        <ChannelSection
          title="Channels"
          items={sortChannels(channels.channels)}
          section="channels"
          icon={({ className }: { className?: string }) => 
            channels.channels.find(c => c.isPrivate) 
              ? <Lock className={className} />
              : <Hash className={className} />
          }
        />

        {/* Direct Messages */}
        <ChannelSection
          title="Direct Messages"
          items={sortChannels(channels.directMessages)}
          section="directMessages"
          icon={MessageSquare}
          showContextMenu={false}
          isDm={true}
        />
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