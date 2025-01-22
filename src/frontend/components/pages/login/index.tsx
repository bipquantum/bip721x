import { Navigate, redirect, useNavigate } from "react-router-dom";

import LogoSvg from "../../../assets/logo.png";
import DfinitySvg from "../../../assets/dfinity.svg";
import NfidSvg from "../../../assets/nfid-logo.svg";
import LoginSvg from "../../../assets/login.svg";

import "@nfid/identitykit/react/styles.css"
import { ConnectWallet, useAgent, useIdentity } from "@nfid/identitykit/react"
import { useEffect, useMemo, useState } from "react";
import { Actor, ActorSubclass, HttpAgent } from "@dfinity/agent";
import { idlFactory as backendIdlFactory, canisterId as backendId } from "../../../../declarations/backend/index.js";
import { _SERVICE as BackendService, SupportedStandard } from "../../../../declarations/backend/backend.did.js";

const APP_NAME = "BIP QUANTUM";
const APP_LOGO = "https://nfid.one/icons/favicon-96x96.png";
const CONFIG_QUERY = `?applicationName=${APP_NAME}&applicationLogo=${APP_LOGO}`;

const Login = () => {
  
  //const authenticated2 = useAgent();
  //if (authenticated || authenticated2 ) return <Navigate to="/" />;

  const navigate = useNavigate();

  const isLocal = false;
  const customHost = isLocal ? 'http://localhost:4943' : 'https://icp-api.io';
  const authenticatedAgent = useAgent({
    host: customHost,
    retryTimes: 10,
  });

  useEffect(() => {
    if (authenticatedAgent) {
      console.log("Navigating to /");
      navigate("/");
    }
  }, [authenticatedAgent]);

//  const backendActor : ActorSubclass<BackendService> | undefined = useMemo(() => {
//    return (
//      authenticatedAgent &&
//      // or nonTargetIdlFactory
//      Actor.createActor(backendIdlFactory, {
//        agent: authenticatedAgent,
//        canisterId: backendId, // or NON_TARGET_CANISTER_ID_TO_CALL
//      })
//    )
//  }, [authenticatedAgent, backendIdlFactory])
//
//  const [standards, setStandars] = useState<SupportedStandard[]>([]);
//
//  useEffect(() => {
//    if (!backendActor) return;
//    backendActor.icrc10_supported_standards().then((standards) => {
//      setStandars(standards);
//    });
//  }, [backendActor]);

  return (
    <div className="flex h-full w-full flex-col items-center justify-center overflow-auto bg-primary px-4">
      <div className="absolute top-0 w-full">
        <div className="flex items-center justify-center p-16 text-white sm:justify-between">
          <img src={LogoSvg} className="h-22 invert sm:h-14" alt="Logo" />
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
            <ConnectWallet/>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
