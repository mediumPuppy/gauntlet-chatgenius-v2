import { Button } from "@/components/ui/button";
import { Bell } from "lucide-react";
import { cn } from "@/lib/utils";

// Mock data for now
const mockNotifications = [
  { id: 1, unread: true, message: "New message in #general" },
  { id: 2, unread: false, message: "Jane Smith mentioned you" },
];

export function NotificationSection() {
  return (
    <div className="py-2">
      <div className="flex items-center justify-between px-2 mb-2">
        <h2 className="text-sm font-semibold text-sidebar-foreground opacity-70">Notifications</h2>
        <Bell className="h-4 w-4 text-sidebar-foreground opacity-50" />
      </div>
      <div className="space-y-[2px]">
        {mockNotifications.map((notification) => (
          <Button
            key={notification.id}
            variant="ghost"
            className={cn(
              "w-full justify-start px-2 h-8",
              notification.unread ? "font-medium text-sidebar-foreground" : "text-sidebar-foreground/60"
            )}
          >
            <Bell className="h-4 w-4 mr-2 shrink-0" />
            <span className="truncate">{notification.message}</span>
          </Button>
        ))}
      </div>
    </div>
  );
}