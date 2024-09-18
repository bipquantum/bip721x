import { useAuth } from "@ic-reactor/react";
import { Navigate } from "react-router-dom";

import Logo from "../../../assets/logo.png";
import Dfinity from "../../../assets/dfinity.svg";
import Nfid from "../../../assets/nfid-logo.svg";

const APP_NAME = "BIP QUANTUM";
const APP_LOGO = "https://nfid.one/icons/favicon-96x96.png";
const CONFIG_QUERY = `?applicationName=${APP_NAME}&applicationLogo=${APP_LOGO}`;

const Login = () => {
  const { login, authenticated } = useAuth({});

  if (authenticated) return <Navigate to="/" />;

  return (
    <div className="bg-primary flex h-full w-full flex-col items-center justify-center overflow-auto">
      <div className="absolute top-0 w-full">
        <div className="flex items-center justify-between p-16 text-white">
          <img src={Logo} className="h-14 invert" alt="Logo" />
          <button className="h-14 w-40 cursor-pointer rounded-xl border border-white text-lg font-bold leading-6">
            Learn Home
          </button>
        </div>
      </div>
      <div className="text-primary flex h-[329px] w-[564px] flex-col justify-center gap-4 rounded-2xl bg-white px-8 text-center text-xl">
        <p className="text-2xl font-bold">100% on-chain governance</p>
        <p>
          Manage your IPs, within the BipQuantum, hosted 100% on the Internet
          Computer blockchain.
        </p>
        <div className="flex flex-col items-center justify-center gap-y-3 pt-6">
          <button
            className="border-primary flex w-[350px] items-center justify-center gap-x-2 rounded-2xl border-[2px] py-2 font-medium"
            onClick={() => {
              login();
            }}
          >
            Connect with
            <img src={Dfinity} className="h-4" alt="Logo" />
          </button>
          <button
            className="border-primary flex w-[350px] items-center justify-center gap-x-2 rounded-2xl border-[2px] py-2 font-medium"
            onClick={() => {
              login({
                identityProvider: `https://nfid.one/authenticate${CONFIG_QUERY}`,
              });
            }}
          >
            Connect with
            <img src={Nfid} className="h-4" alt="Logo" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default Login;
