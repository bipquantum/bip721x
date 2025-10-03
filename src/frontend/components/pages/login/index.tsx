import { Link, Navigate } from "react-router-dom";

import LogoDark from "../../../assets/logoDark.png";
import LogoLight from "../../../assets/logoLight.png";
import BipquantumBetaWhite from "../../../assets/bipquantum_beta_white.png";
import BipquantumBetaBlack from "../../../assets/bipquantum_beta_black.png";
import { useContext, useEffect } from "react";
import { ThemeContext } from "../../App";
import { useAuth } from "@nfid/identitykit/react";
import WalletButton from "../../common/WalletButton";

const Login = () => {
  const { theme } = useContext(ThemeContext);
  const { user  } = useAuth();

  useEffect(() => {
    console.log("User changed:", user);
    console.log("User principal:", user?.principal.toString());
  }, [user]);

  if (user) return <Navigate to="/" />;

  return (
    <div className="flex w-full flex-grow flex-col items-center justify-center overflow-auto bg-background px-4 dark:bg-background-dark">
      <div className="absolute top-0 w-full">
        <div className="flex flex-col items-center justify-center space-x-1 space-y-1 px-4 pt-6 text-black dark:text-white sm:flex-row sm:justify-between sm:px-20 sm:pt-16">
          <div className="flex flex-row items-center justify-center gap-2">
            <img
              src={theme === "dark" ? LogoLight : LogoDark}
              className="h-16"
              alt=""
            />
            <img
              src={theme === "dark" ? BipquantumBetaWhite : BipquantumBetaBlack}
              className="h-16"
              alt="BIPQUANTUM BETA"
            />
          </div>
          <Link
            className="border:border-black flex h-14 w-40 cursor-pointer items-center justify-center rounded-xl border text-lg font-bold leading-6 text-black dark:border-white dark:text-white"
            to="/marketplace"
          >
            Marketplace
          </Link>
        </div>
      </div>
      <div className="mt-[40px] flex w-full flex-col justify-center items-center gap-6 rounded-2xl bg-white p-6 text-center text-xl text-black backdrop-blur-[20px] dark:bg-white/10 dark:text-white sm:mt-0 sm:w-[564px]">
        <p className="hidden text-2xl font-extrabold uppercase text-black dark:text-white sm:block">
          100% on-chain governance
        </p>
        <p className="hidden px-8 text-black dark:text-white sm:block">
          Manage your IPs, within the BIPQuantum, hosted 100% on the Internet
          Computer blockchain.
        </p>
        <WalletButton />
      </div>
    </div>
  );
};

export default Login;