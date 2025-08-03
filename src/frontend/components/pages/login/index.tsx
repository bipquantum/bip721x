import { useNavigate } from "react-router-dom";

import DfinitySvg from "../../../assets/dfinity.svg";
import LoginSvg from "../../../assets/login.svg";

import "@nfid/identitykit/react/styles.css"
import { ConnectWallet, useAgent, useIdentity } from "@nfid/identitykit/react"
import { useEffect, useMemo } from "react";
import { useInternetIdentity } from "ic-use-internet-identity";

import { ReactNode } from "react";
import {
  ActorContextType,
  ActorProvider,
  createActorContext,
  createUseActorHook,
} from "ic-use-actor";
import {
  canisterId,
  idlFactory,
} from "../../../../declarations/backend";
import { _SERVICE } from "../../../../declarations/backend/backend.did";

const actorBackendContext = createActorContext<_SERVICE>();
export const useBackendActor : () => ActorContextType<_SERVICE> = createUseActorHook<_SERVICE>(actorBackendContext);

export function BackendActor({ children }: { children: ReactNode }) {

  const isLocal = process.env.DFX_NETWORK === "local";
  const localIdentity = useInternetIdentity().identity;
  const mainnetIdentity = useIdentity();
  const identity = useMemo(() => {
    return isLocal ? localIdentity : mainnetIdentity;
  }, [isLocal, localIdentity, mainnetIdentity]);

  return (
    <ActorProvider<_SERVICE>
      canisterId={canisterId}
      context={actorBackendContext}
      identity={identity}
      idlFactory={idlFactory}
    >
      {children}
    </ActorProvider>
  );
}

const LocalLoginButton = () => {
  
  const { identity, login, loginStatus, clear } = useInternetIdentity();

  const disabled = loginStatus === "logging-in";
  const authenticated = identity !== undefined && !identity.getPrincipal().isAnonymous();

  // use https://www.npmjs.com/package/ic-use-internet-identity to create actors

  return (
    <button onClick={() => { authenticated ? clear() : login() }} disabled={disabled}>
      {authenticated ? "Logout" : "Login"}
    </button>
  );
}

const Login = () => {

  const navigate = useNavigate();

  const isLocal = process.env.DFX_NETWORK === "local";
  console.log("isLocal:", isLocal);
  const localIdentity = useInternetIdentity().identity;
  const mainnetIdentity = useIdentity();
  const identity = useMemo(() => {
    return isLocal ? localIdentity : mainnetIdentity;
  }, [isLocal, localIdentity, mainnetIdentity]);

  useEffect(() => {
    if (identity && !identity.getPrincipal().isAnonymous()) {
      console.log("Navigating to /");
      navigate("/");
    }
  }, [identity]);

  return (
    <div className="flex h-full w-full flex-col items-center justify-center overflow-auto bg-primary px-4">
      <div className="absolute top-0 w-full">
        <div className="flex items-center justify-center p-16 text-white sm:justify-between">
          <button className="hidden h-14 w-40 cursor-pointer rounded-xl border border-white text-lg font-bold leading-6 sm:block">
            Learn Home
          </button>
        </div>
      </div>
      <div className="flex h-[329px] w-full flex-col justify-center gap-6 rounded-2xl bg-white text-center text-xl text-secondary sm:w-[564px]">
        <p className="hidden text-2xl font-bold sm:block">
          100% on-chain governance
        </p>
        <p className="hidden px-8 sm:block">
          Manage your IPs, within the BipQuantum, hosted 100% on the Internet
          Computer blockchain.
        </p>
        <img
          src={LoginSvg}
          className="block h-16 sm:hidden sm:h-14"
          alt="Logo"
        />
        <p className="block text-2xl font-semibold leading-8 sm:hidden">
          Login To Your Account
        </p>
        <div className="flex w-full flex-col items-center justify-center gap-y-3">
          <button
            className="flex w-11/12 items-center justify-center gap-x-2 rounded-2xl border-[2px] border-primary py-2 font-medium sm:w-[350px]"
            onClick={() => {}}
          >
            Connect with
            <img src={DfinitySvg} className="h-4" alt="Logo" />
          </button>
          <div className="relative group flex w-full items-center justify-center rounded-2xl border-[2px] border-primary py-2 font-medium sm:w-[350px]">
            { isLocal ? <LocalLoginButton /> : <ConnectWallet /> }
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;