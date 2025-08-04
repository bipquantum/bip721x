import { useNavigate } from "react-router-dom";

import LoginSvg from "../../../assets/login.svg";

import "@nfid/identitykit/react/styles.css"
import { ConnectWallet, useAgent, useIdentity } from "@nfid/identitykit/react"
import { useEffect } from "react";
import { _SERVICE } from "../../../../declarations/backend/backend.did";

const Login = () => {

  const navigate = useNavigate();

  const isLocal = process.env.DFX_NETWORK === "local"
  const host = isLocal ? "http://127.0.0.1:4943" : 'https://icp-api.io';

  const agent = useAgent({ host });

  useEffect(() => {
    if (agent !== undefined) {
      console.log("Navigating to /");
      navigate("/");
    }
  }, [agent]);

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
          <div className="relative group flex w-full items-center justify-center rounded-2xl border-[2px] border-primary py-2 font-medium sm:w-[350px]">
            <ConnectWallet/>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;