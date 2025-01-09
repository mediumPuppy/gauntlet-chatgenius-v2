import { toast } from "@/hooks/use-toast"

type SystemNotificationVariant = "default" | "destructive"

export function showSystemNotification(
  message: string,
  variant: SystemNotificationVariant = "default"
) {
  return toast({
    title: "System Notification",
    description: message,
    variant,
    // System notifications should persist longer than regular toasts
    duration: 5000,
  })
}

export function showError(message: string) {
  return showSystemNotification(message, "destructive")
}

// Usage examples:
// showSystemNotification("Connected to server successfully")
// showError("Could not connect to server")
