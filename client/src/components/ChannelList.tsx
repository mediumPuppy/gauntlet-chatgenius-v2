import { useState } from "react";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Star, Hash, MessageCircle, ChevronRight, MoreVertical, Bell, CheckCircle } from "lucide-react";
import { cn } from "@/lib/utils";

// Mock data for demonstration
const mockChannels = {
  starred: [
    { id: "1", name: "announcements", unread: 2 },
    { id: "2", name: "general", unread: 0 },
  ],
  channels: [
    { id: "3", name: "development", unread: 5 },
    { id: "4", name: "design", unread: 0 },
    { id: "5", name: "marketing", unread: 1 },
  ],
  directMessages: [
    { id: "6", name: "John Doe", unread: 3, online: true },
    { id: "7", name: "Jane Smith", unread: 0, online: false },
    { id: "8", name: "Alex Johnson", unread: 0, online: true },
  ],
};

interface ChannelItemProps {
  name: string;
  unread: number;
  icon?: React.ReactNode;
  href: string;
  isActive?: boolean;
}

const ChannelItem = ({ name, unread, icon, href, isActive }: ChannelItemProps) => {
  return (
    <div className="group relative flex items-center">
      <Link href={href}>
        <a
          className={cn(
            "flex flex-1 items-center gap-2 rounded-md px-2 py-1.5 hover:bg-accent",
            isActive && "bg-accent",
            unread > 0 && "font-medium"
          )}
        >
          {icon}
          <span className="truncate">{name}</span>
          {unread > 0 && (
            <span className="ml-auto rounded-full bg-primary px-2 py-0.5 text-xs text-primary-foreground">
              {unread}
            </span>
          )}
        </a>
      </Link>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 opacity-0 group-hover:opacity-100"
          >
            <MoreVertical className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48">
          <DropdownMenuItem>
            <Bell className="mr-2 h-4 w-4" />
            Mute notifications
          </DropdownMenuItem>
          <DropdownMenuItem>
            <CheckCircle className="mr-2 h-4 w-4" />
            Mark as read
          </DropdownMenuItem>
          <DropdownMenuItem className="text-destructive">
            Leave channel
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};

interface ChannelSectionProps {
  title: string;
  channels: any[];
  icon: React.ReactNode;
  workspaceId: string;
  type: "channel" | "dm";
}

const ChannelSection = ({ title, channels, icon, workspaceId, type }: ChannelSectionProps) => {
  const [isOpen, setIsOpen] = useState(true);
  const [location] = useLocation();

  return (
    <Collapsible defaultOpen className="space-y-2">
      <CollapsibleTrigger
        onClick={() => setIsOpen(!isOpen)}
        className="flex w-full items-center gap-1 py-1 text-sm font-medium text-muted-foreground hover:text-foreground"
      >
        <ChevronRight className={cn("h-4 w-4 transition-transform", isOpen && "rotate-90")} />
        {title}
      </CollapsibleTrigger>
      <CollapsibleContent className="space-y-1">
        {channels.map((channel) => (
          <ChannelItem
            key={channel.id}
            name={channel.name}
            unread={channel.unread}
            icon={type === "channel" ? <Hash className="h-4 w-4" /> : <MessageCircle className="h-4 w-4" />}
            href={`/workspace/${workspaceId}/${type === "channel" ? "channel" : "dm"}/${channel.id}`}
            isActive={location === `/workspace/${workspaceId}/${type === "channel" ? "channel" : "dm"}/${channel.id}`}
          />
        ))}
      </CollapsibleContent>
    </Collapsible>
  );
};

interface ChannelListProps {
  workspaceId: string;
}

export default function ChannelList({ workspaceId }: ChannelListProps) {
  return (
    <div className="flex h-full w-64 flex-col gap-4 border-r bg-background p-4">
      <div className="space-y-4">
        <div className="space-y-1">
          <h2 className="flex items-center gap-2 px-2 text-lg font-semibold">
            <Star className="h-4 w-4" />
            Starred
          </h2>
          {mockChannels.starred.map((channel) => (
            <ChannelItem
              key={channel.id}
              name={channel.name}
              unread={channel.unread}
              icon={<Hash className="h-4 w-4" />}
              href={`/workspace/${workspaceId}/channel/${channel.id}`}
            />
          ))}
        </div>

        <ChannelSection
          title="Channels"
          channels={mockChannels.channels}
          icon={<Hash className="h-4 w-4" />}
          workspaceId={workspaceId}
          type="channel"
        />

        <ChannelSection
          title="Direct Messages"
          channels={mockChannels.directMessages}
          icon={<MessageCircle className="h-4 w-4" />}
          workspaceId={workspaceId}
          type="dm"
        />
      </div>
    </div>
  );
}
