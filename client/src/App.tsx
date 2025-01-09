import { Switch, Route } from "wouter";
import Chat from "@/pages/Chat";
import Login from "@/pages/Login";

function App() {
  return (
    <Switch>
      <Route path="/" component={Login} />
      <Route path="/workspace" component={Chat} />
      <Route path="/workspace/:workspaceId" component={Chat} />
      <Route path="/workspace/:workspaceId/:channelId" component={Chat} />
    </Switch>
  );
}

export default App;