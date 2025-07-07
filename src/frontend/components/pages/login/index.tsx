import { useAuth } from "@ic-reactor/react";
import { Link, Navigate } from "react-router-dom";

import LogoDark from "../../../assets/logoDark.png";
import LogoLight from "../../../assets/logoLight.png";
import BipquantumBetaWhite from "../../../assets/bipquantum_beta_white.png";
import BipquantumBetaBlack from "../../../assets/bipquantum_beta_black.png";
import DfinitySvg from "../../../assets/dfinity.svg";
import NfidSvg from "../../../assets/nfid-logo.svg";
import { useContext } from "react";
import { ThemeContext } from "../../App";

const APP_NAME = "BIP QUANTUM";
const APP_LOGO = "https://nfid.one/icons/favicon-96x96.png";
const CONFIG_QUERY = `?applicationName=${APP_NAME}&applicationLogo=${APP_LOGO}`;

const Login = () => {

  const { theme } = useContext(ThemeContext);
  const { login, authenticated } = useAuth({});

  if (authenticated) return <Navigate to="/" />;

  return (
    <div className="flex flex-col flex-grow w-full items-center justify-center overflow-auto bg-background px-4 dark:bg-background-dark">
      <div className="absolute top-0 w-full">
        <div className="flex flex-col items-center justify-center space-x-1 space-y-1 px-4 pt-6 text-black dark:text-white sm:flex-row sm:justify-between sm:px-20 sm:pt-16">
          <div className="flex flex-row items-center justify-center gap-2">
            <img src={theme === "dark" ? LogoLight : LogoDark } className="h-16" alt=""/>
            <img src={theme === "dark" ? BipquantumBetaWhite : BipquantumBetaBlack } className="h-16" alt="BIPQUANTUM BETA"/>
          </div>
          <Link
            className="border:border-black flex h-14 w-40 cursor-pointer items-center justify-center rounded-xl border text-lg font-bold leading-6 text-black dark:border-white dark:text-white"
            to="/marketplace"
          >
            Marketplace
          </Link>
        </div>
      </div>
      <div className="flex w-full flex-col justify-center gap-6 rounded-2xl bg-white text-center text-xl text-black backdrop-blur-[20px] dark:bg-white/10 dark:text-white sm:w-[564px] sm:mt-0 mt-[40px] p-6">
        <p className="hidden text-2xl font-extrabold uppercase text-black dark:text-white sm:block">
          100% on-chain governance
        </p>
        <p className="hidden px-8 text-black dark:text-white sm:block">
          Manage your IPs, within the BIPQuantum, hosted 100% on the Internet
          Computer blockchain.
        </p>

        <p className="block text-2xl font-semibold leading-8 text-black dark:text-white sm:hidden">
          Login To Your Account
        </p>
        <div className="flex w-full flex-col items-center justify-center gap-y-3">
          <button
            className="flex w-11/12 items-center justify-center gap-x-2 rounded-full bg-gradient-to-t from-primary to-secondary py-2 font-medium text-white sm:w-[350px]"
            onClick={() => {
              login();
            }}
          >
            Connect with
            <img src={DfinitySvg} className="h-4" alt="Logo" />
          </button>
          <div className="group relative flex w-full flex-col items-center justify-center gap-y-3">
            <button
              className="flex w-11/12 items-center justify-center gap-x-2 rounded-full bg-gradient-to-t from-primary to-secondary py-2 font-medium text-white sm:w-[350px]"
              onClick={() => {
                login({
                  identityProvider: `https://nfid.one/authenticate${CONFIG_QUERY}`,
                });
              }}
              disabled={true}
            >
              Connect with <img src={NfidSvg} className="h-4" alt="Logo" />
            </button>
            <span className="absolute bottom-full mb-2 hidden w-max items-center rounded bg-black px-2 py-1 text-sm text-white opacity-75 group-hover:block">
              Coming Soon!
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
