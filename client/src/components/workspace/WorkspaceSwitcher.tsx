import { Button } from "@/components/ui/button";
import { ChevronDown, Plus, Settings, LogOut, Trash2, MoreHorizontal } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useLocation } from "wouter";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { useWorkspace } from "@/lib/workspaceContext";

interface Workspace {
  id: number;
  name: string;
  role: string;
  memberCount: number;
  isAdmin: boolean;
  settings: Record<string, any>;
  owner: {
    id: number;
    username: string;
  };
}

export default function WorkspaceSwitcher() {
  const [, navigate] = useLocation();
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [newWorkspaceName, setNewWorkspaceName] = useState("");
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { activeWorkspaceId, setActiveWorkspaceId } = useWorkspace();

  // Fetch workspaces data
  const { data: workspaces = [], isLoading } = useQuery<Workspace[]>({
    queryKey: ["/api/workspaces"],
  });

  const activeWorkspace = workspaces.find(w => w.id === activeWorkspaceId) || workspaces[0];

  const createWorkspace = useMutation({
    mutationFn: async (name: string) => {
      const res = await fetch("/api/workspaces", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name }),
        credentials: "include",
      });

      if (!res.ok) {
        const error = await res.text();
        throw new Error(error);
      }

      return res.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["/api/workspaces"] });
      toast({
        title: "Success",
        description: `Created workspace "${data.name}"`,
      });
      setIsCreateOpen(false);
      setNewWorkspaceName("");

      // Switch to the newly created workspace
      handleWorkspaceSelect(data.id);
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleWorkspaceSelect = async (workspaceId: number) => {
    try {
      const res = await fetch("/api/workspaces/switch", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ workspaceId }),
        credentials: "include",
      });

      if (!res.ok) {
        throw new Error("Failed to switch workspace");
      }

      const data = await res.json();

      // Update the global workspace context
      setActiveWorkspaceId(workspaceId);

      // Show success toast
      toast({
        title: "Switched Workspace",
        description: `Now viewing ${data.workspace.name}`,
      });

      // Refresh workspace data
      queryClient.invalidateQueries({ queryKey: ["/api/workspaces"] });
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to switch workspace",
        variant: "destructive",
      });
    }
  };

  const handleActionSelect = (action: string) => {
    switch (action) {
      case 'settings':
        navigate(`/workspace/${activeWorkspace?.id}/admin`);
        break;
      case 'overview':
        navigate(`/workspace/${activeWorkspace?.id}`);
        break;
      case 'leave':
        // TODO: Implement leave workspace functionality
        console.log('Leave workspace clicked');
        break;
      case 'delete':
        // TODO: Implement delete workspace functionality
        console.log('Delete workspace clicked');
        break;
    }
  };

  const handleCreateWorkspace = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newWorkspaceName.trim()) return;
    createWorkspace.mutate(newWorkspaceName);
  };

  if (isLoading || !activeWorkspace) {
    return (
      <div className="flex items-center justify-between px-2">
        <Button variant="ghost" className="w-full justify-start" disabled>
          Loading workspaces...
        </Button>
      </div>
    );
  }

  return (
    <>
      <div className="flex items-center justify-between px-2">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              className="flex-1 justify-between px-2 py-6 text-sidebar-foreground hover:bg-sidebar-accent group"
            >
              <div className="flex items-center gap-2">
                <Avatar className="h-6 w-6">
                  <AvatarFallback className="bg-primary text-primary-foreground">
                    {activeWorkspace.name.slice(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="flex flex-col items-start">
                  <span className="font-semibold text-sm">{activeWorkspace.name}</span>
                  <span className="text-xs text-muted-foreground">{activeWorkspace.memberCount} members</span>
                </div>
              </div>
              <ChevronDown className="h-4 w-4 text-sidebar-foreground/50 group-hover:text-sidebar-foreground" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-[300px]">
            <div className="p-2">
              <h4 className="text-sm font-semibold mb-2">Switch workspace</h4>
              {workspaces.map((workspace) => (
                <DropdownMenuItem
                  key={workspace.id}
                  className="p-2 focus:bg-sidebar-accent cursor-pointer"
                  onSelect={() => handleWorkspaceSelect(workspace.id)}
                >
                  <div className="flex items-center gap-2">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback className="bg-primary/10">
                        {workspace.name.slice(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col">
                      <span className="font-medium text-sm">{workspace.name}</span>
                      <span className="text-xs text-muted-foreground">
                        {workspace.memberCount} members
                      </span>
                    </div>
                  </div>
                </DropdownMenuItem>
              ))}
            </div>
            <DropdownMenuSeparator />
            <div className="p-2 space-y-1">
              <Button
                variant="ghost"
                size="sm"
                className="w-full justify-start text-sm"
                onClick={() => setIsCreateOpen(true)}
              >
                <Plus className="mr-2 h-4 w-4" />
                Create New Workspace
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="w-full justify-start text-sm"
              >
                Browse All Workspaces
              </Button>
            </div>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Actions Menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="h-9 w-9 text-sidebar-foreground hover:bg-sidebar-accent"
            >
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onSelect={() => handleActionSelect('overview')}>
              <Settings className="mr-2 h-4 w-4" />
              Workspace Overview
            </DropdownMenuItem>
            <DropdownMenuItem onSelect={() => handleActionSelect('settings')}>
              <Settings className="mr-2 h-4 w-4" />
              Settings
            </DropdownMenuItem>
            <DropdownMenuItem onSelect={() => handleActionSelect('leave')}>
              <LogOut className="mr-2 h-4 w-4" />
              Leave Workspace
            </DropdownMenuItem>
            {activeWorkspace.isAdmin && (
              <DropdownMenuItem 
                onSelect={() => handleActionSelect('delete')}
                className="text-destructive focus:text-destructive"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Delete Workspace
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Create Workspace Dialog */}
      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Workspace</DialogTitle>
            <DialogDescription>
              Enter a name for your new workspace. You can customize it further in settings.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleCreateWorkspace}>
            <div className="space-y-4 py-4">
              <Input
                value={newWorkspaceName}
                onChange={(e) => setNewWorkspaceName(e.target.value)}
                placeholder="Workspace name"
                disabled={createWorkspace.isPending}
              />
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setIsCreateOpen(false)}
                type="button"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={!newWorkspaceName.trim() || createWorkspace.isPending}
              >
                {createWorkspace.isPending ? "Creating..." : "Create Workspace"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}