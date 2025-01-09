import { Switch, Route } from "wouter";
import Chat from "@/pages/Chat";

function App() {
  return (
    <Switch>
      <Route path="/" component={Chat} />
      <Route path="/:workspaceId" component={Chat} />
      <Route path="/:workspaceId/:channelId" component={Chat} />
    </Switch>
  );
}

export default App;
