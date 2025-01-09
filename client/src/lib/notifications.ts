import { toast } from "@/hooks/use-toast"

type SystemNotificationVariant = "default" | "destructive" | "success" | "warning"

export function showSystemNotification(
  message: string,
  variant: SystemNotificationVariant = "default"
) {
  return toast({
    title: variant === "destructive" ? "Error" : "System Notification",
    description: message,
    variant,
    // System notifications should persist longer than regular toasts
    duration: variant === "destructive" ? 7000 : 5000,
  })
}

export function showError(message: string) {
  return showSystemNotification(message, "destructive")
}

export function showSuccess(message: string) {
  return showSystemNotification(message, "success")
}

export function showWarning(message: string) {
  return showSystemNotification(message, "warning")
}

export function showInfo(message: string) {
  return showSystemNotification(message, "default")
}