import { Button } from "@/components/ui/button";
import { ChevronDown, Plus } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useLocation } from "wouter";

// Mock data - will be replaced with real data later
const workspaces = [
  { id: "1", name: "ChatGenius", logo: "", members: 12 },
  { id: "2", name: "Design Team", logo: "", members: 8 },
  { id: "3", name: "Marketing", logo: "", members: 5 },
];

interface WorkspaceSwitcherProps {
  activeWorkspaceId?: string;
  onWorkspaceSelect?: (workspaceId: string) => void;
}

export default function WorkspaceSwitcher({ 
  activeWorkspaceId = "1",
  onWorkspaceSelect 
}: WorkspaceSwitcherProps) {
  const activeWorkspace = workspaces.find(w => w.id === activeWorkspaceId) || workspaces[0];
  const [, navigate] = useLocation();

  const handleWorkspaceSelect = (workspaceId: string) => {
    onWorkspaceSelect?.(workspaceId);
    navigate(`/workspace/${workspaceId}`);
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className="w-full justify-between px-4 py-6 text-sidebar-foreground hover:bg-sidebar-accent group"
        >
          <div className="flex items-center gap-2">
            <Avatar className="h-6 w-6">
              <AvatarImage src={activeWorkspace.logo} />
              <AvatarFallback className="bg-primary text-primary-foreground">
                {activeWorkspace.name.slice(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="flex flex-col items-start">
              <span className="font-semibold text-sm">{activeWorkspace.name}</span>
              <span className="text-xs text-muted-foreground">{activeWorkspace.members} members</span>
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
                  <AvatarImage src={workspace.logo} />
                  <AvatarFallback className="bg-primary/10">
                    {workspace.name.slice(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="flex flex-col">
                  <span className="font-medium text-sm">{workspace.name}</span>
                  <span className="text-xs text-muted-foreground">
                    {workspace.members} members
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
  );
}