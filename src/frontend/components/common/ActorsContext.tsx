import { Actor, ActorSubclass, Agent, HttpAgent }                         from "@dfinity/agent";
import { useAgent }                                                       from "@nfid/identitykit/react";
import React, { createContext, useContext, useEffect, useMemo, useState } from "react";

import { idlFactory as backendIdlFactory,      canisterId as backendId      } from "../../../declarations/backend/index";
import { idlFactory as bqcLedgerIdlFactory,    canisterId as bqcLedgerId    } from "../../../declarations/bqc_ledger/index";
import { idlFactory as bip721LedgerIdlFactory, canisterId as bip721LedgerId } from "../../../declarations/bip721_ledger/index";
import { _SERVICE as BackendService      } from "../../../declarations/backend/backend.did";
import { _SERVICE as BqcLedgerService    } from "../../../declarations/bqc_ledger/bqc_ledger.did";
import { _SERVICE as Bip721LedgerService } from "../../../declarations/bip721_ledger/bip721_ledger.did";

const createBackendActor = (agent: Agent) => {
  return Actor.createActor<BackendService>(backendIdlFactory, {
    agent,
    canisterId: backendId,
  });
}

const createBqcLedgerActor = (agent: Agent) => {
  return Actor.createActor<BqcLedgerService>(bqcLedgerIdlFactory, {
    agent,
    canisterId: bqcLedgerId,
  });
}

const createBip721LedgerActor = (agent: Agent) => {
  return Actor.createActor<Bip721LedgerService>(bip721LedgerIdlFactory, {
    agent,
    canisterId: bip721LedgerId,
  });
}

interface ActorsContextType {
  unauthenticated?: {
    backend: ActorSubclass<BackendService>;
    bcqLedger: ActorSubclass<BqcLedgerService>;
    bip721Ledger: ActorSubclass<Bip721LedgerService>;
  };
  authenticated?: {
    backend: ActorSubclass<BackendService>;
    bcqLedger: ActorSubclass<BqcLedgerService>;
    bip721Ledger: ActorSubclass<Bip721LedgerService>;
  };
}

const ActorsContext = createContext<ActorsContextType | undefined>(undefined);

export const ActorsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {

  // identitykit does not work in local environment yet
  //const host = 'https://icp-api.io';
  const host = 'http://localhost:4943';

  // UnauthenticatedAgent (aka anonymous agent)
  const [unauthenticatedAgent, setUnauthenticatedAgent] = useState<HttpAgent | undefined>()
  useEffect(() => {
    HttpAgent.create({ host })
      .then(setUnauthenticatedAgent)
      .catch((err) => console.error("Failed to create unauthenticated agent:", err));
  }, [host]);

  // Authenticated agent
  const authenticatedAgent = useAgent({ host });

  // Memoized actors
  const { unauthenticated, authenticated } = useMemo(() => {
    const unauthenticatedActors = unauthenticatedAgent
      ? {
          backend: createBackendActor(unauthenticatedAgent),
          bcqLedger: createBqcLedgerActor(unauthenticatedAgent),
          bip721Ledger: createBip721LedgerActor(unauthenticatedAgent),
        }
      : undefined;

    const authenticatedActors = authenticatedAgent
      ? {
          backend: createBackendActor(authenticatedAgent),
          bcqLedger: createBqcLedgerActor(authenticatedAgent),
          bip721Ledger: createBip721LedgerActor(authenticatedAgent),
        }
      : undefined;

    return { unauthenticated: unauthenticatedActors, authenticated: authenticatedActors };
  }, [unauthenticatedAgent, authenticatedAgent]);

  return (
    <ActorsContext.Provider value={{ unauthenticated, authenticated }}>
      {children}
    </ActorsContext.Provider>
  );
};

export const useActors = (): ActorsContextType => {
  const context = useContext(ActorsContext);
  if (context === undefined) {
    throw new Error("useActors must be used within a ActorsProvider");
  }
  return context;
};