import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Users, Settings, AppWindow, History, UserPlus, Shield } from "lucide-react";
import { useParams } from "wouter";

// Mock data for demonstration
const mockMembers = [
  { id: 1, name: "John Doe", email: "john@example.com", role: "Admin" },
  { id: 2, name: "Jane Smith", email: "jane@example.com", role: "Member" },
  { id: 3, name: "Alex Johnson", email: "alex@example.com", role: "Member" },
];

export default function AdminPanel() {
  const { workspaceId } = useParams();

  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-6">Workspace Administration</h1>

      <Tabs defaultValue="members" className="w-full">
        <TabsList className="grid grid-cols-4 max-w-3xl">
          <TabsTrigger value="members" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Members
          </TabsTrigger>
          <TabsTrigger value="settings" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            Settings
          </TabsTrigger>
          <TabsTrigger value="apps" className="flex items-center gap-2">
            <AppWindow className="h-4 w-4" />
            Apps & Integrations
          </TabsTrigger>
          <TabsTrigger value="audit" className="flex items-center gap-2">
            <History className="h-4 w-4" />
            Audit Log
          </TabsTrigger>
        </TabsList>

        <div className="mt-6">
          <TabsContent value="members">
            <Card className="p-6">
              <h2 className="text-2xl font-semibold mb-4">Member Management</h2>
              <div className="space-y-6">
                <div className="border rounded-lg p-4">
                  <h3 className="text-lg font-medium mb-4">Invite Members</h3>
                  <form className="space-y-4">
                    <div className="flex gap-4">
                      <Input placeholder="Email address" type="email" className="flex-1" />
                      <Button type="submit" className="flex items-center gap-2">
                        <UserPlus className="h-4 w-4" />
                        Invite
                      </Button>
                    </div>
                  </form>
                </div>

                <div className="border rounded-lg p-4">
                  <h3 className="text-lg font-medium mb-4">Current Members</h3>
                  <div className="space-y-4">
                    {mockMembers.map((member) => (
                      <div key={member.id} className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                        <div>
                          <p className="font-medium">{member.name}</p>
                          <p className="text-sm text-muted-foreground">{member.email}</p>
                        </div>
                        <div className="flex items-center gap-4">
                          <span className="flex items-center gap-1 text-sm">
                            <Shield className="h-4 w-4" />
                            {member.role}
                          </span>
                          <Button variant="outline" size="sm">
                            Manage
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="settings">
            <Card className="p-6">
              <h2 className="text-2xl font-semibold mb-4">Workspace Settings</h2>
              <div className="space-y-4">
                <div className="border rounded-lg p-4">
                  <h3 className="text-lg font-medium mb-2">Channel Permissions</h3>
                  <p className="text-sm text-muted-foreground mb-4">Configure default permissions for new channels</p>
                  {/* Channel permissions UI goes here */}
                </div>
                <div className="border rounded-lg p-4">
                  <h3 className="text-lg font-medium mb-2">Retention Policies</h3>
                  <p className="text-sm text-muted-foreground mb-4">Set message and file retention periods</p>
                  {/* Retention settings UI goes here */}
                </div>
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="apps">
            <Card className="p-6">
              <h2 className="text-2xl font-semibold mb-4">Apps & Integrations</h2>
              <div className="space-y-4">
                <div className="border rounded-lg p-4">
                  <h3 className="text-lg font-medium mb-2">Connected Apps</h3>
                  <p className="text-sm text-muted-foreground mb-4">Manage third-party application access</p>
                  {/* Connected apps list goes here */}
                </div>
                <div className="border rounded-lg p-4">
                  <h3 className="text-lg font-medium mb-2">Webhook Configuration</h3>
                  <p className="text-sm text-muted-foreground mb-4">Set up and manage webhooks</p>
                  {/* Webhook settings UI goes here */}
                </div>
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="audit">
            <Card className="p-6">
              <h2 className="text-2xl font-semibold mb-4">Audit Log</h2>
              <div className="border rounded-lg p-4">
                <h3 className="text-lg font-medium mb-2">System Changes</h3>
                <p className="text-sm text-muted-foreground mb-4">Track administrative changes and user activities</p>
                {/* Audit log table goes here */}
              </div>
            </Card>
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
}