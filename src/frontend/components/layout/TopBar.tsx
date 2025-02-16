import { useContext } from "react";
import { ThemeContext } from "../App";
import { useAuth } from "@ic-reactor/react";
import { Link, useLocation } from "react-router-dom";

import ProfileSvg from "../../assets/profile.png";
import { backendActor } from "../../components/actors/BackendActor";
import { NEW_USER_NICKNAME } from "../../components/constants";

const TopBar = () => {
  const { theme, setTheme } = useContext(ThemeContext);
  const { pathname } = useLocation();
  const { authenticated, identity } = useAuth({});

  const { data: queriedUser } = backendActor.useQueryCall({
    functionName: "get_user",
    args: [identity?.getPrincipal()],
  });

  return (
    <div className="flex w-full items-center justify-between bg-background dark:bg-background-dark p-4 text-white">
      <div className="text-black dark:text-white" >
        <p className="text-xl font-bold">Hello,</p>
        <p>Bruce Warren</p>
      </div>
      {pathname === "/" && (
        <div className="hidden items-center justify-center gap-x-16 sm:flex text-black dark:text-white">
          <Link to={"/about"}>About</Link>
          <Link to={"/new"}>Add your Intellectual Property</Link>
          <Link to={"/marketplace"}>Market place</Link>
        </div>
      )}
      <div className="flex items-center gap-4">
        {/* Theme Toggle */}
        <button
          className="rounded-lg bg-primary p-2 text-sm"
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
        >
          {theme === "dark" ? "🌞 Light Mode" : "🌙 Dark Mode"}
        </button>

        <Link to={"profile"} className="hidden items-center gap-2 sm:flex">
          <img src={ProfileSvg} className="h-10 rounded-full" alt="Profile" />
          <p className="text-black dark:text-white">
          { queriedUser?.length === 0 ? NEW_USER_NICKNAME : queriedUser?.[0]?.nickName }
          </p>
        </Link>
      </div>
    </div>
  );
};

export default TopBar;
