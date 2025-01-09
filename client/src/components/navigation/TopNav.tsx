import { useState } from "react";
import { SearchBar } from "@/components/search/SearchBar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Moon,
  Sun,
  Settings,
  LogOut,
  User as UserIcon,
  Circle,
  Clock,
  BellOff,
  Monitor,
} from "lucide-react";
import { UserProfileModal } from "@/components/user/UserProfileModal";
import { PreferencesModal } from "@/components/user/PreferencesModal";
import { useTheme } from "@/lib/theme-provider";

const mockUser = {
  displayName: "John Doe",
  email: "john@example.com",
  avatar: "",
  status: {
    text: "In a meeting",
    emoji: "🗣️",
  },
};

const statusOptions = [
  { icon: <Circle className="h-4 w-4 fill-green-500 text-green-500" />, label: "Active" },
  { icon: <Clock className="h-4 w-4 text-yellow-500" />, label: "Away" },
  { icon: <BellOff className="h-4 w-4 text-red-500" />, label: "Do not disturb" },
];

export function TopNav() {
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showPreferencesModal, setShowPreferencesModal] = useState(false);
  const { theme, setTheme } = useTheme();

  const toggleTheme = () => {
    setTheme(theme === "light" ? "dark" : theme === "dark" ? "system" : "light");
  };

  return (
    <>
      <div className="border-b">
        <div className="flex h-16 items-center px-4">
          <div className="flex-1 flex items-center gap-4">
            <SearchBar />
          </div>
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={toggleTheme}>
              {theme === "light" ? (
                <Sun className="h-5 w-5" />
              ) : theme === "dark" ? (
                <Moon className="h-5 w-5" />
              ) : (
                <Monitor className="h-5 w-5" />
              )}
            </Button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={mockUser.avatar} alt={mockUser.displayName} />
                    <AvatarFallback>
                      {mockUser.displayName.split(" ").map((n) => n[0]).join("")}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <div className="flex flex-col gap-1 p-2">
                  <p className="text-sm font-medium">{mockUser.displayName}</p>
                  <p className="text-xs text-muted-foreground">{mockUser.email}</p>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <span>{mockUser.status.emoji}</span>
                    <span>{mockUser.status.text}</span>
                  </div>
                </div>
                <DropdownMenuSeparator />
                {statusOptions.map((status) => (
                  <DropdownMenuItem key={status.label} className="gap-2">
                    {status.icon}
                    <span>{status.label}</span>
                  </DropdownMenuItem>
                ))}
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => setShowProfileModal(true)}>
                  <UserIcon className="mr-2 h-4 w-4" />
                  <span>Profile</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setShowPreferencesModal(true)}>
                  <Settings className="mr-2 h-4 w-4" />
                  <span>Preferences</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Log out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>

      <UserProfileModal
        user={mockUser}
        open={showProfileModal}
        onOpenChange={setShowProfileModal}
      />

      <PreferencesModal
        open={showPreferencesModal}
        onOpenChange={setShowPreferencesModal}
      />
    </>
  );
}