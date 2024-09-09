import { useAuth } from "@ic-reactor/react";
import { Navigate } from "react-router-dom";

import Logo from "../../../assets/logo.png";
import Dfinity from "../../../assets/dfinity.svg";
import Nfid from "../../../assets/nfid-logo.svg";

const APP_NAME = "BIP QUANTUM";
const APP_LOGO = "https://nfid.one/icons/favicon-96x96.png";
const CONFIG_QUERY = `?applicationName=${APP_NAME}&applicationLogo=${APP_LOGO}`;

function LoginV2() {
  const { login, authenticated } = useAuth({});

  if (authenticated) return <Navigate to="/" />;

  return (
    <div className="min-h-screen w-full bg-blue-400">
      <div className="flex items-center justify-between p-16 text-base text-white">
        <img src={Logo} className="h-10 invert" alt="Logo" />
        <div className="font-semibold underline">Learn Home</div>
      </div>
      <div className="m-auto mt-32 w-[480px] rounded-3xl bg-white p-8 text-base text-blue-600">
        <div className="font-bold">100% on-chain governance</div>
        <div className="mt-4">
          Manage your IPs, within the BipQuantum, hosted 100% on the Internet
          Computer blockchain.
        </div>
        <div className="flex flex-col items-center justify-center gap-y-3 pt-6 text-sm">
          <button
            className="flex w-72 items-center justify-center gap-x-2 rounded-xl border border-blue-600 py-2 uppercase"
            onClick={() => {
              login();
            }}
          >
            Connect with
            <img src={Dfinity} className="h-4" alt="Logo" />
          </button>
          <button
            className="flex w-72 items-center justify-center gap-x-2 rounded-xl border border-blue-600 py-2 uppercase"
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
}

export default LoginV2;
