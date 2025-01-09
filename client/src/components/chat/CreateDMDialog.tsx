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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface CreateDMDialogProps {
  trigger?: React.ReactNode;
}

interface User {
  id: number;
  username: string;
  displayName?: string;
  avatar?: string;
  status?: {
    text: string;
    isOnline: boolean;
  };
}

export function CreateDMDialog({ trigger }: CreateDMDialogProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [open, setOpen] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Update workspace members query to ensure it only gets current workspace members
  const { data: users, isLoading } = useQuery<User[]>({
    queryKey: ['/api/workspaces/1/members'],
    select: (data) => {
      // Filter out any null/undefined users and ensure they belong to workspace 1
      return data.filter(user => user && user.id);
    }
  });

  // Create DM mutation
  const createDM = useMutation({
    mutationFn: async (targetUserId: number) => {
      const response = await fetch("/api/workspaces/1/dms", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ targetUserId }),
      });

      if (!response.ok) {
        throw new Error(await response.text());
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/workspaces/1/channels"] });
      toast({
        title: "Direct message created",
        description: "You can now start messaging",
      });
      setOpen(false);
    },
    onError: (error) => {
      toast({
        title: "Error creating direct message",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const filteredUsers = users?.filter((user) =>
    user.username.toLowerCase().includes(searchQuery.toLowerCase())
  ) ?? [];

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || <Button variant="outline">New message</Button>}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>New message</DialogTitle>
          <DialogDescription>
            Start a conversation with another member
          </DialogDescription>
        </DialogHeader>
        <div className="py-4">
          <Input
            placeholder="Search people"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="mb-4"
          />
          <ScrollArea className="h-[300px] pr-4">
            {isLoading ? (
              <div className="flex items-center justify-center h-32">
                <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
              </div>
            ) : (
              <div className="space-y-2">
                {filteredUsers.map((user) => (
                  <div
                    key={user.id}
                    className="flex items-center justify-between p-2 rounded-md hover:bg-muted cursor-pointer group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="relative">
                        <Avatar className="h-9 w-9">
                          <AvatarImage src={user.avatar} />
                          <AvatarFallback>
                            {user.username
                              .split(" ")
                              .map((n) => n[0])
                              .join("")}
                          </AvatarFallback>
                        </Avatar>
                        {user.status && (
                          <div
                            className={cn(
                              "absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full border-2 border-background",
                              user.status.isOnline
                                ? "bg-green-500"
                                : "bg-muted-foreground"
                            )}
                          />
                        )}
                      </div>
                      <div>
                        <p className="font-medium leading-none">{user.username}</p>
                        {user.status && (
                          <p className="text-sm text-muted-foreground">
                            {user.status.text}
                          </p>
                        )}
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      className="opacity-0 group-hover:opacity-100"
                      onClick={() => createDM.mutate(user.id)}
                      disabled={createDM.isPending}
                    >
                      {createDM.isPending ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        "Message"
                      )}
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </ScrollArea>
        </div>
      </DialogContent>
    </Dialog>
  );
}