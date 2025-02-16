import { useAuth } from "@ic-reactor/react";
import { Link, Navigate } from "react-router-dom";

import LogoSvg from "../../../assets/logo_beta.png";
import DfinitySvg from "../../../assets/dfinity.svg";
import NfidSvg from "../../../assets/nfid-logo.svg";
import LoginSvg from "../../../assets/login.svg";

const APP_NAME = "BIP QUANTUM";
const APP_LOGO = "https://nfid.one/icons/favicon-96x96.png";
const CONFIG_QUERY = `?applicationName=${APP_NAME}&applicationLogo=${APP_LOGO}`;

const Login = () => {
  const { login, authenticated } = useAuth({});

  if (authenticated) return <Navigate to="/" />;

  return (
    <div className="flex h-full w-full flex-col items-center justify-center overflow-auto bg-background dark:bg-background-dark px-4">
      <div className="absolute top-0 w-full">
        <div className="flex flex-col sm:flex-row space-x-1 space-y-1 items-center justify-center pt-6 sm:pt-16 px-4 sm:px-20 dark:text-white text-black sm:justify-between">
          <img src={LogoSvg} className="h-22 sm:h-14" alt="Logo" />
          <Link className="flex h-14 w-40 cursor-pointer rounded-xl border border:border-black dark:border-white text-lg font-bold leading-6 items-center justify-center dark:text-white text-black" to="/marketplace">
            Marketplace
          </Link>
        </div>
      </div>
      <div className="flex h-[329px] w-full flex-col justify-center gap-6 rounded-2xl backdrop-blur-[20px] dark:bg-white/10 bg-white text-center text-xl dark:text-white text-black sm:w-[564px]">
        <p className="hidden text-2xl font-extrabold uppercase sm:block dark:text-white text-black">
          100% on-chain governance
        </p>
        <p className="hidden px-8 sm:block dark:text-white text-black">
          Manage your IPs, within the BipQuantum, hosted 100% on the Internet
          Computer blockchain.
        </p>
        <img
          src={LoginSvg}
          className="block h-16 sm:hidden sm:h-14"
          alt="Logo"
        />
        <p className="block text-2xl font-semibold leading-8 sm:hidden dark:text-white text-black">
          Login To Your Account
        </p>
        <div className="flex w-full flex-col items-center justify-center gap-y-3">
          <button
            className="flex w-11/12 items-center justify-center gap-x-2 rounded-full text-black dark:text-white py-2 font-medium bg-gradient-to-t from-primary to-secondary sm:w-[350px]"
            onClick={() => {
              login();
            }}
          >
            Connect with
            <img src={DfinitySvg} className="h-4" alt="Logo" />
          </button>
          <div className="relative group flex w-full flex-col items-center justify-center gap-y-3">
            <button
              className="flex w-11/12 items-center justify-center gap-x-2 rounded-full text-black dark:text-white py-2 font-medium bg-gradient-to-t from-primary to-secondary sm:w-[350px]"
              onClick={() => {
                login({
                  identityProvider: `https://nfid.one/authenticate${CONFIG_QUERY}`,
                });
              }}
              disabled={true}
            >
              Connect with <img src={NfidSvg} className="h-4" alt="Logo" />
            </button>
            <span className="absolute bottom-full mb-2 hidden w-max px-2 py-1 text-sm text-white bg-black rounded opacity-75 group-hover:block items-center">
              Coming Soon!
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
