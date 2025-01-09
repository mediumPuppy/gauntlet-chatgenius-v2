import { Button } from "@/components/ui/button";
import { Bell } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { ScrollArea } from "@/components/ui/scroll-area";

// Mock data for now
const mockNotifications = [
  { 
    id: 1, 
    unread: true, 
    message: "New message in #general",
    time: "5m ago",
    type: "message",
    details: {
      channelId: "3",
      messageId: "123"
    }
  },
  { 
    id: 2, 
    unread: false, 
    message: "Jane Smith mentioned you",
    time: "10m ago",
    type: "mention",
    details: {
      channelId: "4",
      messageId: "456",
      userId: "user-123"
    }
  },
  {
    id: 3,
    unread: true,
    message: "New thread reply in #team-updates",
    time: "15m ago",
    type: "thread",
    details: {
      channelId: "5",
      threadId: "789"
    }
  }
];

export function NotificationSection() {
  const unreadCount = mockNotifications.filter(n => n.unread).length;

  const handleNotificationClick = (notification: typeof mockNotifications[0]) => {
    switch (notification.type) {
      case 'message':
        console.log(`Opening message ${notification.details.messageId} in channel ${notification.details.channelId}`);
        break;
      case 'mention':
        console.log(`Opening mention from user ${notification.details.userId} in message ${notification.details.messageId}`);
        break;
      case 'thread':
        console.log(`Opening thread ${notification.details.threadId} in channel ${notification.details.channelId}`);
        break;
    }
  };

  return (
    <div className="py-2 px-2">
      <Sheet>
        <SheetTrigger asChild>
          <Button
            variant="ghost"
            className={cn(
              "w-full justify-start px-2 h-8 gap-2",
              unreadCount > 0 ? "font-medium text-sidebar-foreground" : "text-sidebar-foreground/60"
            )}
          >
            <Bell className="h-4 w-4 shrink-0" />
            <span className="truncate">Notifications</span>
            {unreadCount > 0 && (
              <span className="ml-auto bg-primary/10 text-primary px-2 rounded-full text-xs">
                {unreadCount}
              </span>
            )}
          </Button>
        </SheetTrigger>
        <SheetContent>
          <SheetHeader>
            <SheetTitle className="flex justify-between items-center">
              <span>Notifications</span>
              {unreadCount > 0 && (
                <Button variant="ghost" size="sm" className="text-xs">
                  Mark all as read
                </Button>
              )}
            </SheetTitle>
          </SheetHeader>
          <ScrollArea className="h-full mt-4">
            <div className="space-y-4">
              {mockNotifications.map((notification) => (
                <button
                  key={notification.id}
                  onClick={() => handleNotificationClick(notification)}
                  className={cn(
                    "w-full text-left p-4 rounded-lg transition-colors",
                    notification.unread 
                      ? "bg-muted/50 hover:bg-muted/70" 
                      : "hover:bg-muted/30"
                  )}
                >
                  <div className="flex items-start gap-3">
                    <Bell className="h-4 w-4 mt-1 shrink-0" />
                    <div className="space-y-1 flex-1">
                      <p className={cn(
                        "text-sm",
                        notification.unread && "font-medium"
                      )}>
                        {notification.message}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {notification.time}
                      </p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </ScrollArea>
        </SheetContent>
      </Sheet>
    </div>
  );
}