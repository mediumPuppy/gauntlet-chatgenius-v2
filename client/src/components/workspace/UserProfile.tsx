import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Settings } from "lucide-react";

export default function UserProfile() {
  return (
    <div className="p-4 flex items-center justify-between">
      <div className="flex items-center gap-2">
        <Avatar className="h-8 w-8">
          <AvatarImage src="" />
          <AvatarFallback>U</AvatarFallback>
        </Avatar>
        <div className="flex flex-col">
          <span className="text-sm font-medium text-sidebar-foreground">User Name</span>
          <span className="text-xs text-sidebar-foreground/60">Online</span>
        </div>
      </div>
      <Button variant="ghost" size="icon" className="text-sidebar-foreground">
        <Settings className="h-5 w-5" />
      </Button>
    </div>
  );
}
