import { useContext, useEffect, useState } from "react";
import { ThemeContext } from "../App";
import { useAuth } from "@ic-reactor/react";
import { Link, useLocation } from "react-router-dom";
import { backendActor } from "../../components/actors/BackendActor";
import { NEW_USER_NICKNAME } from "../../components/constants";
import { fromNullable } from "@dfinity/utils";
import { User } from "../../../declarations/backend/backend.did";
import { MdOutlineDarkMode } from "react-icons/md";
import { MdOutlineLightMode } from "react-icons/md";
import { MdChat } from "react-icons/md";
import LogoDark from "../../assets/logoDark.png";
import LogoLight from "../../assets/logoLight.png";
import UserImage from "../common/UserImage";
import ChatHistoryBar from "./ChatHistoryBar";
import Modal from "../common/Modal";

const TopBar = () => {
  const { theme, setTheme } = useContext(ThemeContext);
  const location = useLocation();
  const { pathname } = location;

  const { identity, authenticated } = useAuth({});
  const [showChatHistory, setShowChatHistory] = useState(false);

  if (!identity || !authenticated) {
    return <></>;
  }

  const [user, setUser] = useState<User | undefined>(undefined);

  const { data: queriedUser } = backendActor.useQueryCall({
    functionName: "get_user",
    args: [identity?.getPrincipal()],
  });

  useEffect(() => {
    if (queriedUser !== undefined) {
      setUser(fromNullable(queriedUser));
    } else {
      setUser(undefined);
    }
  }, [queriedUser]);

  return (
    <main className="flex w-full items-center justify-between bg-background text-white dark:bg-background-dark min-h-16 sm:min-h-20 px-3 sm:px-4 overflow-hidden">
      <div className="flex flex-row space-x-3 text-black dark:text-white flex-shrink min-w-0">
        <Link to={"/"} className="size-[48px] shrink-0">
          <img
            src={theme === "dark" ? LogoLight : LogoDark}
            alt=""
            className={`h-full w-full`}
          />
        </Link>
        <div className="flex flex-col items-start justify-center min-w-0">
          <p className="text-base font-bold md:text-xl">Hello,</p>
          <p className="text-sm md:text-base truncate w-full">
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
          className="rounded-full bg-white p-2 text-xl text-black dark:bg-white/10 dark:text-white h-10 w-10"
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
        >
          { theme === "dark" ?  <MdOutlineDarkMode size={22} /> :  <MdOutlineLightMode size={22} /> }
        </button>
        <button
          className="sm:hidden rounded-full bg-white p-2 text-xl text-black dark:bg-white/10 dark:text-white h-10 w-10"
          onClick={() => { setShowChatHistory(true); }}
        >
          <MdChat size={22} />
        </button>
        <Link to="/profile" className="h-10 w-10">
          <UserImage principal={identity.getPrincipal()} className="h-10 w-10 rounded-full object-cover border-2 border-gray-300 dark:border-gray-700"/>
        </Link>
      </div>
      <Modal
        isVisible={showChatHistory}
        onClose={() => setShowChatHistory(false)}
      >
        <ChatHistoryBar onChatSelected={() => setShowChatHistory(false)} className="flex w-full flex-col justify-between text-black dark:text-white"/>
      </Modal>
    </main>
  );
};

export default TopBar;
