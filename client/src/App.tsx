import { Switch, Route } from "wouter";
import Chat from "@/pages/Chat";
import Login from "@/pages/Login";

function App() {
  return (
    <Switch>
      {/* Temporarily making Chat the default route for development */}
      <Route path="/" component={Chat} />
      <Route path="/login" component={Login} />
      <Route path="/workspace/:workspaceId" component={Chat} />
      <Route path="/workspace/:workspaceId/:channelId" component={Chat} />
    </Switch>
  );
}

export default App;