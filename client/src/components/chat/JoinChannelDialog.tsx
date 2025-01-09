import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Hash, Lock } from "lucide-react";
import { useState } from "react";

interface JoinChannelDialogProps {
  trigger?: React.ReactNode;
}

// Temporary mock data for UI development
const MOCK_CHANNELS = [
  { id: 1, name: "general", memberCount: 45, isPrivate: false },
  { id: 2, name: "design", memberCount: 12, isPrivate: false },
  { id: 3, name: "engineering", memberCount: 28, isPrivate: true },
  { id: 4, name: "marketing", memberCount: 8, isPrivate: false },
];

export function JoinChannelDialog({ trigger }: JoinChannelDialogProps) {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredChannels = MOCK_CHANNELS.filter((channel) =>
    channel.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <Dialog>
      <DialogTrigger asChild>
        {trigger || <Button variant="outline">Browse channels</Button>}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Browse channels</DialogTitle>
          <DialogDescription>
            Join existing channels in this workspace
          </DialogDescription>
        </DialogHeader>
        <div className="py-4">
          <Input
            placeholder="Search channels"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="mb-4"
          />
          <ScrollArea className="h-[300px] pr-4">
            <div className="space-y-2">
              {filteredChannels.map((channel) => (
                <div
                  key={channel.id}
                  className="flex items-center justify-between p-2 rounded-md hover:bg-muted cursor-pointer group"
                >
                  <div className="flex items-center gap-2">
                    {channel.isPrivate ? (
                      <Lock className="w-4 h-4 text-muted-foreground" />
                    ) : (
                      <Hash className="w-4 h-4 text-muted-foreground" />
                    )}
                    <span className="font-medium">{channel.name}</span>
                    <span className="text-sm text-muted-foreground">
                      {channel.memberCount} members
                    </span>
                  </div>
                  <Button
                    variant="ghost"
                    className="opacity-0 group-hover:opacity-100"
                    disabled={channel.isPrivate}
                  >
                    Join
                  </Button>
                </div>
              ))}
            </div>
          </ScrollArea>
        </div>
      </DialogContent>
    </Dialog>
  );
}
