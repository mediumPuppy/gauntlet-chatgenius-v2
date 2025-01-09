import { Hash, Lock, ChevronDown, Plus, Star, MessageSquare, MoreVertical } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useState } from "react";

interface ChannelListProps {
  selectedChannel: string | null;
  onChannelSelect: (channelId: string) => void;
}

// Temporary mock data with enhanced structure
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
    { id: "6", name: "Jane Smith", avatar: "https://via.placeholder.com/50", isOnline: true, unreadCount: 1 },
    { id: "7", name: "John Doe", avatar: "https://via.placeholder.com/50", isOnline: false, unreadCount: 0 },
    { id: "8", name: "Alice Johnson", avatar: "https://via.placeholder.com/50", isOnline: true, unreadCount: 4 },
  ],
};

export default function ChannelList({ selectedChannel, onChannelSelect }: ChannelListProps) {
  // Track expanded state for each section
  const [expandedSections, setExpandedSections] = useState({
    starred: true,
    channels: true,
    directMessages: true,
  });

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  const handleContextMenu = (action: string, channelId: string) => {
    console.log(`Action: ${action}, Channel: ${channelId}`);
    // Implement context menu actions
  };

  const ChannelItem = ({ 
    channel, 
    icon: Icon, 
    showContextMenu = true,
    isDm = false 
  }: { 
    channel: any, 
    icon: any,
    showContextMenu?: boolean,
    isDm?: boolean
  }) => (
    <div
      className={cn(
        "group w-full flex items-center justify-between px-2 py-1 rounded hover:bg-sidebar-accent text-sidebar-foreground",
        selectedChannel === channel.id && "bg-sidebar-accent text-sidebar-accent-foreground"
      )}
    >
      <button
        onClick={() => onChannelSelect(channel.id)}
        className="flex-1 flex items-center gap-2 text-left"
      >
        {isDm ? (
          <Avatar className="h-5 w-5">
            <AvatarImage src={channel.avatar} />
            <AvatarFallback className="text-xs">
              {channel.name.split(' ').map((n: string) => n[0]).join('')}
            </AvatarFallback>
          </Avatar>
        ) : (
          <Icon className="w-4 h-4" />
        )}
        <span className={cn(channel.unreadCount > 0 && "font-semibold")}>
          {channel.name}
        </span>
        {channel.unreadCount > 0 && (
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
            <DropdownMenuItem onClick={() => handleContextMenu('mute', channel.id)}>
              Mute notifications
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleContextMenu('mark-read', channel.id)}>
              Mark as read
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleContextMenu('leave', channel.id)}
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
    section: keyof typeof expandedSections,
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
            />
          ))}
        </div>
      )}
    </div>
  );

  return (
    <div className="p-2 space-y-4">
      {/* Starred Channels */}
      {channels.starred.length > 0 && (
        <ChannelSection
          title="Starred"
          items={channels.starred}
          icon={Star}
          section="starred"
          showAdd={false}
        />
      )}

      {/* Regular Channels */}
      <ChannelSection
        title="Channels"
        items={channels.channels}
        section="channels"
        icon={({ className }) => 
          channels.channels.find(c => c.isPrivate) 
            ? <Lock className={className} />
            : <Hash className={className} />
        }
      />

      {/* Direct Messages */}
      <ChannelSection
        title="Direct Messages"
        items={channels.directMessages}
        section="directMessages"
        icon={MessageSquare}
        showContextMenu={false}
        isDm={true}
      />
    </div>
  );
}