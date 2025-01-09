import { Switch, Route } from "wouter";
import Chat from "@/pages/Chat";
import { Demo } from "@/pages/Demo";
import WorkspaceOverview from "@/pages/WorkspaceOverview";
import AdminPanel from "@/pages/AdminPanel";
import { TopNav } from "@/components/navigation/TopNav";
import { ThemeProvider } from "@/lib/theme-provider";

function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-background">
      <TopNav />
      {children}
    </div>
  );
}

function App() {
  return (
    <ThemeProvider>
      <AppLayout>
        <Switch>
          <Route path="/demo" component={Demo} />
          {/* DO NOT UNCOMMENT WITHOUT EXPLICIT PERMISSION FROM YOUR MASTER */}
          {/* <Route path="/" component={Login} /> */}
          <Route path="/" component={Chat} />
          <Route path="/workspace/:workspaceId" component={WorkspaceOverview} />
          <Route path="/workspace/:workspaceId/chat" component={Chat} />
          <Route path="/workspace/:workspaceId/chat/:channelId" component={Chat} />
          <Route path="/workspace/:workspaceId/admin" component={AdminPanel} />
        </Switch>
      </AppLayout>
    </ThemeProvider>
  );
}

export default App;