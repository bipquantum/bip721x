import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './components/App';
import { AgentProvider } from "@ic-reactor/react";
import { BackendActorProvider } from "./components/actors/BackendActor"
import './index.css';

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <AgentProvider withProcessEnv>
      <BackendActorProvider>
        <App />
      </BackendActorProvider>
    </AgentProvider>
  </React.StrictMode>,
);
