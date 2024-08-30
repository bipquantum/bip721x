import React from "react";
import ReactDOM from "react-dom/client";
import App from "./components/App";
import { AgentProvider } from "@ic-reactor/react";
import { BackendActorProvider } from "./components/actors/BackendActor";
import "./index.css";
import { LedgerActorProvider } from "./components/actors/LedgerActor";

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <AgentProvider withProcessEnv>
      <BackendActorProvider>
        <LedgerActorProvider>
          <App />
        </LedgerActorProvider>
      </BackendActorProvider>
    </AgentProvider>
  </React.StrictMode>
);
