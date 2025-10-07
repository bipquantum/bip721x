import { Actor, ActorSubclass, Agent, HttpAgent }                         from "@dfinity/agent";
import { useAgent, useAuth }                                              from "@nfid/identitykit/react";
import React, { createContext, useContext, useEffect, useMemo, useState } from "react";

import { idlFactory as backendIdlFactory,      canisterId as backendId      } from "../../../declarations/backend/index";
import { idlFactory as bqcLedgerIdlFactory,    canisterId as bqcLedgerId    } from "../../../declarations/bqc_ledger/index";
import { idlFactory as ckbtcLedgerIdlFactory,  canisterId as ckbtcLedgerId  } from "../../../declarations/ckbtc_ledger/index";
import { idlFactory as bip721LedgerIdlFactory, canisterId as bip721LedgerId } from "../../../declarations/bip721_ledger/index";
import { idlFactory as faucetIdlFactory,       canisterId as faucetId   } from "../../../declarations/faucet/index";
import { _SERVICE as BackendService      } from "../../../declarations/backend/backend.did";
import { _SERVICE as BqcLedgerService    } from "../../../declarations/bqc_ledger/bqc_ledger.did";
import { _SERVICE as CkBtcLedgerService  } from "../../../declarations/ckbtc_ledger/ckbtc_ledger.did";
import { _SERVICE as Bip721LedgerService } from "../../../declarations/bip721_ledger/bip721_ledger.did";
import { _SERVICE as Faucet              } from "../../../declarations/faucet/faucet.did";

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

const createCkBtcLedgerActor = (agent: Agent) => {
  return Actor.createActor<CkBtcLedgerService>(ckbtcLedgerIdlFactory, {
    agent,
    canisterId: ckbtcLedgerId,
  });
}

const createBip721LedgerActor = (agent: Agent) => {
  return Actor.createActor<Bip721LedgerService>(bip721LedgerIdlFactory, {
    agent,
    canisterId: bip721LedgerId,
  });
}

const createFaucetActor = (agent: Agent) => {
  return Actor.createActor<Faucet>(faucetIdlFactory, {
    agent,
    canisterId: faucetId,
  });
}

interface ActorsContextType {
  unauthenticated?: {
    backend: ActorSubclass<BackendService>;
    bqcLedger: ActorSubclass<BqcLedgerService>;
    ckbtcLedger: ActorSubclass<CkBtcLedgerService>;
    bip721Ledger: ActorSubclass<Bip721LedgerService>;
    faucet: ActorSubclass<Faucet>;
  };
  authenticated?: {
    backend: ActorSubclass<BackendService>;
    bqcLedger: ActorSubclass<BqcLedgerService>;
    ckbtcLedger: ActorSubclass<CkBtcLedgerService>;
    bip721Ledger: ActorSubclass<Bip721LedgerService>;
    faucet: ActorSubclass<Faucet>;
  };
}

const ActorsContext = createContext<ActorsContextType | undefined>(undefined);

export const ActorsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {

  // identitykit does not work in local environment yet
  const isLocal = process.env.DFX_NETWORK === "local"
  const host = isLocal ? "http://127.0.0.1:4943" : 'https://icp-api.io';

  // UnauthenticatedAgent (aka anonymous agent)
  const [unauthenticatedAgent, setUnauthenticatedAgent] = useState<HttpAgent | undefined>()
  useEffect(() => {
    HttpAgent.create({ host })
      .then((agent => {
        console.log("Unauthenticated agent created successfully:", agent);
        setUnauthenticatedAgent(agent);
        if (isLocal) {
          agent.fetchRootKey().then(() => {
            console.log("Root key fetched for unauthenticated agent");
          }).catch((err) => {
            console.error("Failed to fetch root key for unauthenticated agent:", err);
          });
        }
      }))
      .catch((err) => console.error("Failed to create unauthenticated agent:", err));
  }, [host]);

  // Authenticated agent
  const authenticatedAgent = useAgent({
    host
  });

  const { user, disconnect } = useAuth();

  // Sync check: if user thinks they're logged in but agent is anonymous, force logout
  useEffect(() => {
    const checkIdentitySync = async () => {
      if (user && authenticatedAgent) {
        const identity = await authenticatedAgent.getPrincipal();
        const isAnonymous = identity.isAnonymous();

        if (isAnonymous && user.principal) {
          console.warn("Auth state desync detected: user logged in but agent is anonymous. Forcing disconnect...");
          await disconnect();
        }
      }
    };

    checkIdentitySync();
  }, [user, authenticatedAgent, disconnect]);

  useEffect(() => {
    if (authenticatedAgent) {
      console.log("Authenticated agent created successfully:", authenticatedAgent);
      if (isLocal) {
        authenticatedAgent.fetchRootKey().then(() => {
          console.log("Root key fetched for authenticated agent");
        }).catch((err) => {
          console.error("Failed to fetch root key for authenticated agent:", err);
        });
      }
    }
  }, [authenticatedAgent, isLocal]);

  // Memoized actors
  const { unauthenticated, authenticated } = useMemo(() => {
    const unauthenticatedActors = unauthenticatedAgent
      ? {
          backend: createBackendActor(unauthenticatedAgent),
          bqcLedger: createBqcLedgerActor(unauthenticatedAgent),
          ckbtcLedger: createCkBtcLedgerActor(unauthenticatedAgent),
          bip721Ledger: createBip721LedgerActor(unauthenticatedAgent),
          faucet: createFaucetActor(unauthenticatedAgent),
        }
      : undefined;

    const authenticatedActors = authenticatedAgent
      ? {
          backend: createBackendActor(authenticatedAgent),
          bqcLedger: createBqcLedgerActor(authenticatedAgent),
          ckbtcLedger: createCkBtcLedgerActor(authenticatedAgent),
          bip721Ledger: createBip721LedgerActor(authenticatedAgent),
          faucet: createFaucetActor(authenticatedAgent),
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