import { Button } from "@/components/ui/button";
import { ChevronDown } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function WorkspaceSwitcher() {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className="w-full justify-between px-4 py-6 text-sidebar-foreground hover:bg-sidebar-accent"
        >
          <span className="font-semibold">ChatGenius</span>
          <ChevronDown className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-[200px]">
        <DropdownMenuItem>Create Workspace</DropdownMenuItem>
        <DropdownMenuItem>Browse Workspaces</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
