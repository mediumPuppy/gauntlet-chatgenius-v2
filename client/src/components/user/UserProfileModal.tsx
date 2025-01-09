import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Pencil } from "lucide-react";

interface UserProfileModalProps {
  user?: {
    displayName: string;
    email: string;
    avatar: string;
    status: {
      text: string;
      emoji: string;
    };
  };
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export function UserProfileModal({
  user,
  open,
  onOpenChange,
}: UserProfileModalProps) {
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({
    displayName: user?.displayName || "",
    status: {
      text: user?.status?.text || "",
      emoji: user?.status?.emoji || "",
    },
  });

  const handleSave = () => {
    // TODO: Implement save functionality
    console.log("Saving profile:", formData);
    setEditMode(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Profile Settings</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="relative mx-auto">
            <Avatar className="h-24 w-24">
              <AvatarImage src={user?.avatar} />
              <AvatarFallback>
                {user?.displayName?.charAt(0) || "U"}
              </AvatarFallback>
            </Avatar>
            <Button
              size="icon"
              variant="outline"
              className="absolute bottom-0 right-0 h-8 w-8 rounded-full"
            >
              <Pencil className="h-4 w-4" />
            </Button>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="displayName">Display Name</Label>
            {editMode ? (
              <Input
                id="displayName"
                value={formData.displayName}
                onChange={(e) =>
                  setFormData({ ...formData, displayName: e.target.value })
                }
              />
            ) : (
              <div className="flex items-center justify-between py-2">
                <span>{user?.displayName}</span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setEditMode(true)}
                >
                  <Pencil className="h-4 w-4" />
                </Button>
              </div>
            )}
          </div>

          <div className="grid gap-2">
            <Label htmlFor="email">Email</Label>
            <div className="py-2 text-muted-foreground">{user?.email}</div>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="status">Status</Label>
            {editMode ? (
              <div className="flex gap-2">
                <Input
                  id="status"
                  value={formData.status.text}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      status: { ...formData.status, text: e.target.value },
                    })
                  }
                  placeholder="What's your status?"
                />
              </div>
            ) : (
              <div className="flex items-center justify-between py-2">
                <span>
                  {user?.status?.emoji} {user?.status?.text}
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setEditMode(true)}
                >
                  <Pencil className="h-4 w-4" />
                </Button>
              </div>
            )}
          </div>

          {editMode && (
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setEditMode(false)}>
                Cancel
              </Button>
              <Button onClick={handleSave}>Save Changes</Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
