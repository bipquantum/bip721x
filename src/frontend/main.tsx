import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './components/App';
import { AgentProvider } from "@ic-reactor/react";
import { BackendActorProvider } from "./components/actors/BackendActor"
import { IcpLedgerActorProvider} from "./components/actors/IcpLedgerActor"
import { Icrc7ActorProvider } from './components/actors/Icrc7Actor';
import './index.css';

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <AgentProvider withProcessEnv>
      <BackendActorProvider>
        <IcpLedgerActorProvider>
          <Icrc7ActorProvider>
            <App />
          </Icrc7ActorProvider>
        </IcpLedgerActorProvider>
      </BackendActorProvider>
    </AgentProvider>
  </React.StrictMode>,
);
