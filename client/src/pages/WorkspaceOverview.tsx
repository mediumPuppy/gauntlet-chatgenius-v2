import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  MessageSquare,
  Users,
  FileText,
  Settings,
  Puzzle,
  LineChart,
  Pin,
  ArrowLeft,
} from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useLocation } from "wouter";

// Mock data - will be replaced with real data
const workspace = {
  id: "1",
  name: "ChatGenius",
  logo: "",
  stats: {
    channels: 12,
    members: 48,
    announcements: 3,
  },
  announcements: [
    {
      id: "1",
      content: "Welcome to our new team members from the Design department!",
      author: { name: "John Doe", avatar: "" },
      timestamp: "2 hours ago",
    },
    {
      id: "2",
      content: "The new project deadline has been set to next Friday.",
      author: { name: "Jane Smith", avatar: "" },
      timestamp: "5 hours ago",
    },
  ],
};

// Update navigationLinks array
const navigationLinks = [
  { name: "Channels", icon: MessageSquare, href: (id: string) => `/workspace/${id}/channels` },
  { name: "Members", icon: Users, href: (id: string) => `/workspace/${id}/members` },
  { name: "Files", icon: FileText, href: (id: string) => `/workspace/${id}/files` },
  { name: "Integrations", icon: Puzzle, href: (id: string) => `/workspace/${id}/admin?tab=apps` },
  { name: "Analytics", icon: LineChart, href: (id: string) => `/workspace/${id}/analytics`, adminOnly: true },
];

export default function WorkspaceOverview() {
  const [, navigate] = useLocation();

  return (
    <div className="container mx-auto py-8 px-4">
      {/* Back Button */}
      <Button
        variant="ghost"
        className="mb-6"
        onClick={() => navigate(`/workspace/${workspace.id}/chat`)}
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Chat
      </Button>

      {/* Workspace Header */}
      <div className="flex items-center gap-4 mb-8">
        <Avatar className="h-16 w-16">
          <AvatarImage src={workspace.logo} />
          <AvatarFallback className="bg-primary text-primary-foreground text-xl">
            {workspace.name.slice(0, 2).toUpperCase()}
          </AvatarFallback>
        </Avatar>
        <div>
          <h1 className="text-3xl font-bold">{workspace.name}</h1>
          <p className="text-muted-foreground">
            Workspace Overview
          </p>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">
              Channels
            </CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{workspace.stats.channels}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">
              Members
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{workspace.stats.members}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">
              Announcements
            </CardTitle>
            <Pin className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{workspace.stats.announcements}</div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Navigation Links */}
        <div className="md:col-span-2">
          <h2 className="text-lg font-semibold mb-4">Quick Navigation</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {navigationLinks.map((link) => (
              <Button
                key={link.name}
                variant="outline"
                className="h-24 flex flex-col items-center justify-center gap-2"
                onClick={() => navigate(link.href(workspace.id))}
              >
                <link.icon className="h-6 w-6" />
                <span>{link.name}</span>
              </Button>
            ))}
          </div>
        </div>

        {/* Announcements Feed */}
        <Card className="md:col-span-1">
          <CardHeader>
            <CardTitle>Recent Announcements</CardTitle>
            <CardDescription>Latest updates from the workspace</CardDescription>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[300px]">
              <div className="space-y-4">
                {workspace.announcements.map((announcement) => (
                  <div key={announcement.id} className="flex gap-4">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={announcement.author.avatar} />
                      <AvatarFallback>
                        {announcement.author.name.slice(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="space-y-1">
                      <p className="text-sm">{announcement.content}</p>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <span>{announcement.author.name}</span>
                        <span>•</span>
                        <span>{announcement.timestamp}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}