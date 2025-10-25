import { Actor, ActorSubclass, Agent, HttpAgent }                         from "@dfinity/agent";
import { useAgent, useAuth, useSigner }                                   from "@nfid/identitykit/react";
import React, { createContext, useContext, useEffect, useMemo, useRef, useState } from "react";

import { idlFactory as backendIdlFactory,      canisterId as backendId      } from "../../../declarations/backend/index";
import { idlFactory as bqcLedgerIdlFactory,    canisterId as bqcLedgerId    } from "../../../declarations/bqc_ledger/index";
import { idlFactory as ckusdtLedgerIdlFactory,  canisterId as ckusdtLedgerId  } from "../../../declarations/ckusdt_ledger/index";
import { idlFactory as bip721LedgerIdlFactory, canisterId as bip721LedgerId } from "../../../declarations/bip721_ledger/index";
import { idlFactory as faucetIdlFactory,       canisterId as faucetId   } from "../../../declarations/faucet/index";
import { _SERVICE as BackendService      } from "../../../declarations/backend/backend.did";
import { _SERVICE as BqcLedgerService    } from "../../../declarations/bqc_ledger/bqc_ledger.did";
import { _SERVICE as CkUsdtLedgerService  } from "../../../declarations/ckusdt_ledger/ckusdt_ledger.did";
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

const createCkUsdtLedgerActor = (agent: Agent) => {
  return Actor.createActor<CkUsdtLedgerService>(ckusdtLedgerIdlFactory, {
    agent,
    canisterId: ckusdtLedgerId,
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
    ckusdtLedger: ActorSubclass<CkUsdtLedgerService>;
    bip721Ledger: ActorSubclass<Bip721LedgerService>;
    faucet: ActorSubclass<Faucet>;
  };
  authenticated?: {
    backend: ActorSubclass<BackendService>;
    bqcLedger: ActorSubclass<BqcLedgerService>;
    ckusdtLedger: ActorSubclass<CkUsdtLedgerService>;
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
  const signer = useSigner();

  // Track login state for Mixpanel
  const hasTrackedLoginRef = useRef(false);

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

  // Mixpanel tracking for user login
  useEffect(() => {
    if (user && signer && window.mixpanel && !hasTrackedLoginRef.current) {
      // User is logged in, track the login event
      const authMethod = signer.label || 'Unknown';
      const principal = user.principal;

      // Identify the user by their principal
      window.mixpanel.identify(principal.toText());

      // Track the login event with authentication method
      window.mixpanel.track('User Login', {
        auth_method: authMethod,
        principal: principal,
        timestamp: new Date().toISOString()
      });

      // Set user properties
      window.mixpanel.people.set({
        principal: principal,
        last_login: new Date().toISOString(),
        auth_method: authMethod
      });

      console.log(`Mixpanel: Tracked login for principal ${principal} using ${authMethod}`);
      hasTrackedLoginRef.current = true;
    } else if (!user && hasTrackedLoginRef.current) {
      // User logged out, reset the tracking flag
      hasTrackedLoginRef.current = false;
      if (window.mixpanel) {
        window.mixpanel.reset();
      }
    }
  }, [user, signer]);

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
          ckusdtLedger: createCkUsdtLedgerActor(unauthenticatedAgent),
          bip721Ledger: createBip721LedgerActor(unauthenticatedAgent),
          faucet: createFaucetActor(unauthenticatedAgent),
        }
      : undefined;

    const authenticatedActors = authenticatedAgent
      ? {
          backend: createBackendActor(authenticatedAgent),
          bqcLedger: createBqcLedgerActor(authenticatedAgent),
          ckusdtLedger: createCkUsdtLedgerActor(authenticatedAgent),
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