import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

type UserStatus = {
  text?: string;
  emoji?: string;
  expiresAt?: string;
  lastActive?: string;
}

// Get status color based on user's status and last active time
export function getStatusColor(status: UserStatus | null | undefined, isOnline: boolean): string {
  if (!status) return "bg-gray-500"; // Offline/Unknown

  // If user is explicitly offline
  if (!isOnline) return "bg-gray-500";

  // Check status text for specific states
  const statusText = status.text?.toLowerCase();
  if (statusText?.includes("do not disturb") || statusText?.includes("meeting")) {
    return "bg-red-500";
  }
  if (statusText?.includes("away") || statusText?.includes("idle")) {
    return "bg-yellow-500";
  }

  // Check if status is expired
  if (status.expiresAt && new Date(status.expiresAt) < new Date()) {
    return "bg-gray-500";
  }

  // Check last active time
  if (status.lastActive) {
    const lastActive = new Date(status.lastActive);
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
    if (lastActive < fiveMinutesAgo) {
      return "bg-yellow-500"; // Away after 5 minutes of inactivity
    }
  }

  // Default online state
  return "bg-green-500";
}

// Format status text with emoji
export function formatStatus(status: UserStatus | null | undefined): string {
  if (!status?.text) return "";
  return status.emoji ? `${status.text} ${status.emoji}` : status.text;
}