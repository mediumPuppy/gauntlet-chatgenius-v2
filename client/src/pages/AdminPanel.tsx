import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import { Users, Settings, AppWindow, History } from "lucide-react";

export default function AdminPanel() {
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
              <div className="space-y-4">
                <div className="border rounded-lg p-4">
                  <h3 className="text-lg font-medium mb-2">Invite Members</h3>
                  {/* Member management UI will go here */}
                </div>
                <div className="border rounded-lg p-4">
                  <h3 className="text-lg font-medium mb-2">Current Members</h3>
                  {/* Member list will go here */}
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
                  {/* Channel permissions UI will go here */}
                </div>
                <div className="border rounded-lg p-4">
                  <h3 className="text-lg font-medium mb-2">Retention Policies</h3>
                  {/* Retention settings UI will go here */}
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
                  {/* Connected apps list will go here */}
                </div>
                <div className="border rounded-lg p-4">
                  <h3 className="text-lg font-medium mb-2">Webhook Configuration</h3>
                  {/* Webhook settings UI will go here */}
                </div>
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="audit">
            <Card className="p-6">
              <h2 className="text-2xl font-semibold mb-4">Audit Log</h2>
              <div className="border rounded-lg p-4">
                <h3 className="text-lg font-medium mb-2">System Changes</h3>
                {/* Audit log table will go here */}
              </div>
            </Card>
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
}
