import { useContext } from "react";
import { ThemeContext } from "../App";
import { useAuth } from "@ic-reactor/react";
import { Link, useLocation } from "react-router-dom";

import ProfileSvg from "../../assets/profile.png";
import { backendActor } from "../../components/actors/BackendActor";
import { NEW_USER_NICKNAME } from "../../components/constants";
import { TbBell, TbSearch } from "react-icons/tb";

const TopBar = () => {
  const { theme, setTheme } = useContext(ThemeContext);
  const { pathname } = useLocation();
  const { authenticated, identity } = useAuth({});

  const { data: queriedUser } = backendActor.useQueryCall({
    functionName: "get_user",
    args: [identity?.getPrincipal()],
  });

  return (
    <div className="flex w-full items-center justify-between bg-background p-4 text-white dark:bg-background-dark">
      <div className="text-black dark:text-white">
        <p className="text-base md:text-xl font-bold">Hello,</p>
        <p className="text-sm md:text-base">Bruce Warren</p>
      </div>
      {pathname === "/" && (
        <div className="hidden items-center justify-between gap-4 text-black dark:text-white lg:flex">
          <Link className="text-base" to={"/about"}>About</Link>
          <Link className="text-base" to={"/new"}>Add your Intellectual Property</Link>
          <Link className="text-base" to={"/marketplace"}>Market place</Link>
        </div>
      )}
      <div className="flex items-center gap-4">
        <div className="hidden md:flex flex-row rounded-xl bg-white items-center p-2 gap-1">
          <TbSearch className="text-gray-500" />
          <input
            type="text"
            className="ring-none border-none bg-transparent text-gray-500 text-[16px]"
            placeholder="Search"
          />
        </div>
        <button className="relative flex h-[40px] w-[40px] items-center justify-center rounded-full border-2 border-black bg-transparent text-gray-800 dark:border-gray-400 dark:text-gray-400">
          <TbBell size={32} />
          <span className="absolute right-0 top-0 size-3 rounded-full bg-red-500">
            {" "}
          </span>
        </button>
        {/* Theme Toggle */}
        <button
          className="rounded-full bg-white p-2 text-xl dark:bg-white/10"
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
        >
          {theme === "dark" ? "🌞" : "🌙"}
        </button>

        <Link to={"view"} className="hidden items-center gap-2 sm:flex">
          <img
            src={ProfileSvg}
            className="h-[48px] rounded-full"
            alt="Profile"
          />
          {/* <p className="text-black dark:text-white">
          { queriedUser?.length === 0 ? NEW_USER_NICKNAME : queriedUser?.[0]?.nickName }
          </p> */}
        </Link>
      </div>
    </div>
  );
};

export default TopBar;
