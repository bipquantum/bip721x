import { useContext, useEffect, useState } from "react";
import { ThemeContext } from "../App";
import { Link, useLocation } from "react-router-dom";
import { MdOutlineDarkMode } from "react-icons/md";
import { MdOutlineLightMode } from "react-icons/md";
import { MdChat } from "react-icons/md";
import { MdOutlineAccountBalanceWallet } from "react-icons/md";
import LogoDark from "../../assets/logoDark.png";
import LogoLight from "../../assets/logoLight.png";
import UserImage from "../common/UserImage";
import ChatHistoryBar from "./ChatHistoryBar";
import Modal from "../common/Modal";
import NotificationBell from "../common/NotificationBell";
import Wallet from "../common/Wallet";
import { useAuth } from "@nfid/identitykit/react";
import BipquantumBetaWhite from "../../assets/bipquantum_beta_white.png";
import BipquantumBetaBlack from "../../assets/bipquantum_beta_black.png";
import { FiLogIn } from "react-icons/fi";

const TopBar = () => {
  const { theme, setTheme } = useContext(ThemeContext);
  const location = useLocation();
  const { pathname } = location;
  const { connect, user } = useAuth();

  const [showChatHistory, setShowChatHistory] = useState(false);
  const [showWallet, setShowWallet] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 500);

    return () => clearTimeout(timer);
  }, []);

  if (isLoading || !user) {
    return (
      <header className="fixed left-0 right-0 top-0 z-40 flex min-h-16 space-x-2 w-full items-center justify-between overflow-visible bg-background px-3 text-white dark:bg-background-dark sm:relative sm:z-auto sm:min-h-20 sm:px-4">
        <Link to={"/login"}>
           <div className="flex flex-row items-center justify-center gap-2">
            <img
              src={theme === "dark" ? LogoLight : LogoDark}
              className="h-10"
              alt=""
            />
            <img
              src={theme === "dark" ? BipquantumBetaWhite : BipquantumBetaBlack}
              className="h-10 hidden sm:block"
              alt="BIPQUANTUM BETA"
            />
          </div>
        </Link>
        <div className="flex-grow" />
        <button
          className="h-10 w-10 rounded-full bg-white p-2 text-xl text-black dark:bg-white/10 dark:text-white"
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
        >
          {theme === "dark" ? (
            <MdOutlineDarkMode size={22} />
          ) : (
            <MdOutlineLightMode size={22} />
          )}
        </button>
        <button
          className="flex items-center justify-center rounded-full p-2 text-black dark:text-white"
          onClick={() => { connect(); }}
          title="Connect"
        >
          <FiLogIn size={20} color="currentColor"/>
        </button>
      </header>
    );
  }

  return (
    <header className="fixed left-0 right-0 top-0 z-40 flex min-h-16 w-full items-center justify-between overflow-visible bg-background px-3 text-white dark:bg-background-dark sm:relative sm:z-auto sm:min-h-20 sm:px-4">
      <div className="flex min-w-0 flex-shrink flex-row space-x-3 text-black dark:text-white">
        <Link to={"/"}>
           <div className="flex flex-row items-center justify-center gap-2">
            <img
              src={theme === "dark" ? LogoLight : LogoDark}
              className="h-10"
              alt=""
            />
            <img
              src={theme === "dark" ? BipquantumBetaWhite : BipquantumBetaBlack}
              className="h-10 hidden sm:block"
              alt="BIPQUANTUM BETA"
            />
          </div>
        </Link>
      </div>
      {pathname === "/" && (
        <div className="hidden items-center justify-between gap-4 text-black dark:text-white lg:flex">
          <Link
            className="text-base"
            to={"https://www.bipquantum.com/about.html"}
            target="_blank"
            rel="noopener noreferrer"
          >
            About
          </Link>
          <Link className="text-base" to={"/new"}>
            Add your Intellectual Property
          </Link>
          <Link className="text-base" to={"/marketplace"}>
            Market place
          </Link>
        </div>
      )}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Theme Toggle */}
        <button
          className="h-10 w-10 rounded-full bg-white p-2 text-xl text-black dark:bg-white/10 dark:text-white"
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
        >
          {theme === "dark" ? (
            <MdOutlineDarkMode size={22} />
          ) : (
            <MdOutlineLightMode size={22} />
          )}
        </button>
        {/* Notification Bell */}
        <NotificationBell />
        <button
          className="h-10 w-10 rounded-full bg-white p-2 text-xl text-black dark:bg-white/10 dark:text-white sm:hidden"
          onClick={() => {
            setShowChatHistory(true);
          }}
        >
          <MdChat size={22} />
        </button>
        {/* Wallet Button */}
        <button
          className="h-10 w-10 rounded-full bg-white p-2 text-xl text-black dark:bg-white/10 dark:text-white"
          onClick={() => setShowWallet(true)}
        >
          <MdOutlineAccountBalanceWallet size={22} />
        </button>
        <Link to="/profile" className="h-10 w-10">
          <UserImage
            className="h-10 w-10 rounded-full border-2 border-gray-300 object-cover dark:border-gray-700"
          />
        </Link>
      </div>
      <Modal
        isVisible={showChatHistory}
        onClose={() => setShowChatHistory(false)}
      >
        <ChatHistoryBar
          onChatSelected={() => setShowChatHistory(false)}
          className="flex w-full flex-col justify-between text-black dark:text-white"
        />
      </Modal>
      <Wallet
        isOpen={showWallet}
        onClose={() => setShowWallet(false)}
      />
    </header>
  );
};

export default TopBar;
