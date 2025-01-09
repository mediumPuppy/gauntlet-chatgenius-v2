import { Hash, Lock, ChevronDown, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface ChannelListProps {
  selectedChannel: string | null;
  onChannelSelect: (channelId: string) => void;
}

// Temporary mock data
const channels = [
  { id: "1", name: "general", isPrivate: false },
  { id: "2", name: "random", isPrivate: false },
  { id: "3", name: "team-only", isPrivate: true },
];

export default function ChannelList({ selectedChannel, onChannelSelect }: ChannelListProps) {
  return (
    <div className="p-2">
      <div className="flex items-center justify-between p-2 text-sidebar-foreground">
        <button className="flex items-center gap-1 font-semibold">
          <ChevronDown className="w-4 h-4" />
          Channels
        </button>
        <Button variant="ghost" size="icon" className="w-6 h-6">
          <Plus className="w-4 h-4" />
        </Button>
      </div>

      <div className="space-y-1">
        {channels.map((channel) => (
          <button
            key={channel.id}
            onClick={() => onChannelSelect(channel.id)}
            className={cn(
              "w-full flex items-center gap-2 px-2 py-1 rounded hover:bg-sidebar-accent text-sidebar-foreground",
              selectedChannel === channel.id && "bg-sidebar-accent text-sidebar-accent-foreground"
            )}
          >
            {channel.isPrivate ? (
              <Lock className="w-4 h-4" />
            ) : (
              <Hash className="w-4 h-4" />
            )}
            {channel.name}
          </button>
        ))}
      </div>
    </div>
  );
}
