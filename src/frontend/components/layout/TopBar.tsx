import { useContext, useEffect, useState } from "react";
import { ThemeContext } from "../App";
import { Link, useLocation } from "react-router-dom";
import { backendActor } from "../../components/actors/BackendActor";
import { NEW_USER_NICKNAME } from "../../components/constants";
import { fromNullable } from "@dfinity/utils";
import { User } from "../../../declarations/backend/backend.did";
import { MdOutlineDarkMode } from "react-icons/md";
import { MdOutlineLightMode } from "react-icons/md";
import { MdChat } from "react-icons/md";
import { MdAccountBalanceWallet } from "react-icons/md";
import LogoDark from "../../assets/logoDark.png";
import LogoLight from "../../assets/logoLight.png";
import UserImage from "../common/UserImage";
import ChatHistoryBar from "./ChatHistoryBar";
import Modal from "../common/Modal";
import NotificationBell from "../common/NotificationBell";
import Wallet from "../common/Wallet";
import { useIdentity } from "@nfid/identitykit/react";

const TopBar = () => {
  const { theme, setTheme } = useContext(ThemeContext);
  const location = useLocation();
  const { pathname } = location;

  const identity = useIdentity();
  const [showChatHistory, setShowChatHistory] = useState(false);
  const [showWallet, setShowWallet] = useState(false);
  const [user, setUser] = useState<User | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(true);

  const { data: queriedUser } = backendActor.useQueryCall({
    functionName: "get_user",
    args: identity && [identity?.getPrincipal()],
  });

  useEffect(() => {
    if (queriedUser !== undefined) {
      setUser(fromNullable(queriedUser));
    } else {
      setUser(undefined);
    }
  }, [queriedUser]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 500);

    return () => clearTimeout(timer);
  }, []);

  if (isLoading || !identity || identity.getPrincipal().isAnonymous()) {
    return <></>;
  }

  return (
    <header className="fixed left-0 right-0 top-0 z-40 flex min-h-16 w-full items-center justify-between overflow-visible bg-background px-3 text-white dark:bg-background-dark sm:relative sm:z-auto sm:min-h-20 sm:px-4">
      <div className="flex min-w-0 flex-shrink flex-row space-x-3 text-black dark:text-white">
        <Link to={"/"} className="size-[48px] shrink-0">
          <img
            src={theme === "dark" ? LogoLight : LogoDark}
            alt=""
            className={`h-full w-full`}
          />
        </Link>
        <div className="flex min-w-0 flex-col items-start justify-center">
          <p className="text-base font-bold md:text-xl">Hello,</p>
          <p className="w-full truncate text-sm md:text-base">
            {user === undefined ? NEW_USER_NICKNAME : user.nickName}
          </p>
        </div>
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
        <Link to="/profile" className="h-10 w-10">
          <UserImage
            principal={identity.getPrincipal()}
            className="h-10 w-10 rounded-full border-2 border-gray-300 object-cover dark:border-gray-700"
          />
        </Link>
        {/* Wallet Button */}
        <button
          className="h-10 w-10 rounded-md bg-white p-2 text-xl text-black dark:bg-white/10 dark:text-white"
          onClick={() => setShowWallet(true)}
        >
          <MdAccountBalanceWallet size={22} />
        </button>
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
        principal={identity.getPrincipal()}
      />
    </header>
  );
};

export default TopBar;
