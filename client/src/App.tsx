import { Switch, Route } from "wouter";
import Chat from "@/pages/Chat";
import Login from "@/pages/Login";
import WorkspaceOverview from "@/pages/WorkspaceOverview";
import AdminPanel from "@/pages/AdminPanel";

function App() {
  return (
    <Switch>
      {/* Temporarily making Login the default route to test new components */}
      <Route path="/" component={Login} />
      <Route path="/chat" component={Chat} />
      <Route path="/workspace/:workspaceId" component={WorkspaceOverview} />
      <Route path="/workspace/:workspaceId/chat" component={Chat} />
      <Route path="/workspace/:workspaceId/chat/:channelId" component={Chat} />
      <Route path="/workspace/:workspaceId/admin" component={AdminPanel} />
    </Switch>
  );
}

export default App;