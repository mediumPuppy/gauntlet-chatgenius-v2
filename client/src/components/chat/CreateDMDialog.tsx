import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useState } from "react";
import { cn } from "@/lib/utils";

interface CreateDMDialogProps {
  trigger?: React.ReactNode;
}

// Temporary mock data for UI development
const MOCK_USERS = [
  {
    id: 1,
    name: "John Doe",
    avatar: "",
    status: { text: "Available", isOnline: true },
  },
  {
    id: 2,
    name: "Jane Smith",
    avatar: "",
    status: { text: "In a meeting", isOnline: true },
  },
  {
    id: 3,
    name: "Mike Johnson",
    avatar: "",
    status: { text: "Away", isOnline: false },
  },
];

export function CreateDMDialog({ trigger }: CreateDMDialogProps) {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredUsers = MOCK_USERS.filter((user) =>
    user.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <Dialog>
      <DialogTrigger asChild>
        {trigger || <Button variant="outline">New message</Button>}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>New message</DialogTitle>
          <DialogDescription>
            Start a conversation with another member
          </DialogDescription>
        </DialogHeader>
        <div className="py-4">
          <Input
            placeholder="Search people"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="mb-4"
          />
          <ScrollArea className="h-[300px] pr-4">
            <div className="space-y-2">
              {filteredUsers.map((user) => (
                <div
                  key={user.id}
                  className="flex items-center justify-between p-2 rounded-md hover:bg-muted cursor-pointer group"
                >
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <Avatar className="h-9 w-9">
                        <AvatarImage src={user.avatar} />
                        <AvatarFallback>
                          {user.name
                            .split(" ")
                            .map((n) => n[0])
                            .join("")}
                        </AvatarFallback>
                      </Avatar>
                      <div
                        className={cn(
                          "absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full border-2 border-background",
                          user.status.isOnline
                            ? "bg-green-500"
                            : "bg-muted-foreground"
                        )}
                      />
                    </div>
                    <div>
                      <p className="font-medium leading-none">{user.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {user.status.text}
                      </p>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    className="opacity-0 group-hover:opacity-100"
                  >
                    Message
                  </Button>
                </div>
              ))}
            </div>
          </ScrollArea>
        </div>
      </DialogContent>
    </Dialog>
  );
}
