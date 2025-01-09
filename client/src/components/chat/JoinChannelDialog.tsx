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
import { Hash, Lock, Loader2 } from "lucide-react";
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";

interface Channel {
  id: number;
  name: string;
  type: string;
  topic: string | null;
  isPrivate: boolean;
  memberCount?: number;
}

interface JoinChannelDialogProps {
  trigger?: React.ReactNode;
}

export function JoinChannelDialog({ trigger }: JoinChannelDialogProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [open, setOpen] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: channels, isLoading, error } = useQuery<Channel[]>({
    queryKey: ['/api/workspaces/1/channels/available'],
    queryFn: async () => {
      const response = await fetch('/api/workspaces/1/channels/available');
      if (!response.ok) {
        throw new Error('Failed to fetch channels');
      }
      return response.json();
    },
  });

  const joinChannel = useMutation({
    mutationFn: async (channelId: number) => {
      const response = await fetch(`/api/channels/${channelId}/join`, {
        method: 'POST',
      });
      if (!response.ok) {
        throw new Error('Failed to join channel');
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/workspaces/1/channels'] });
      queryClient.invalidateQueries({ queryKey: ['/api/workspaces/1/channels/available'] });
      toast({
        title: "Channel joined",
        description: "You've successfully joined the channel.",
      });
      setOpen(false);
    },
    onError: (error) => {
      toast({
        title: "Error joining channel",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const filteredChannels = channels?.filter((channel) =>
    channel.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="ghost" size="sm" className="w-full justify-start">
            <Hash className="mr-2 h-4 w-4" />
            Browse channels
          </Button>
        )}
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
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : error ? (
            <div className="text-center py-8 text-destructive">
              Failed to load channels. Please try again.
            </div>
          ) : filteredChannels?.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No channels found
            </div>
          ) : (
            <ScrollArea className="h-[300px] pr-4">
              <div className="space-y-2">
                {filteredChannels?.map((channel) => (
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
                        {channel.memberCount || 0} members
                      </span>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="opacity-0 group-hover:opacity-100"
                      disabled={channel.isPrivate || joinChannel.isPending}
                      onClick={() => joinChannel.mutate(channel.id)}
                    >
                      {joinChannel.isPending ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        "Join"
                      )}
                    </Button>
                  </div>
                ))}
              </div>
            </ScrollArea>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}