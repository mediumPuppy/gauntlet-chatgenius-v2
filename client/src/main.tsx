import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import { Toaster } from "@/components/ui/toaster";
import { WorkspaceProvider } from "./lib/workspaceContext";
import App from './App';
import "./index.css";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <WorkspaceProvider>
        <App />
        <Toaster />
      </WorkspaceProvider>
    </QueryClientProvider>
  </StrictMode>,
);