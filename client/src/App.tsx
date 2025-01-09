import { Switch, Route } from "wouter";
import Chat from "@/pages/Chat";
import Login from "@/pages/Login";
import WorkspaceOverview from "@/pages/WorkspaceOverview";

function App() {
  return (
    <Switch>
      {/* Temporarily making Login the default route to test new components */}
      <Route path="/" component={Login} />
      <Route path="/chat" component={Chat} />
      <Route path="/workspace/:workspaceId" component={WorkspaceOverview} />
      <Route path="/workspace/:workspaceId/chat" component={Chat} />
      <Route path="/workspace/:workspaceId/chat/:channelId" component={Chat} />
    </Switch>
  );
}

export default App;