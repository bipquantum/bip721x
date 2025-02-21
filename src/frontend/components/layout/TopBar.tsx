import { useContext, useEffect, useState } from "react";
import { ThemeContext } from "../App";
import { useAuth } from "@ic-reactor/react";
import { Link, useLocation } from "react-router-dom";
import ProfileSvg from "../../assets/profile.png";
import { backendActor } from "../../components/actors/BackendActor";
import { NEW_USER_NICKNAME } from "../../components/constants";
import { TbBell, TbSearch } from "react-icons/tb";
import { fromNullable } from "@dfinity/utils";
import { User } from "../../../declarations/backend/backend.did";
import FilePreview from "../common/FilePreview";
import { MdOutlineDarkMode } from "react-icons/md";
import { MdOutlineLightMode } from "react-icons/md";



const TopBar = () => {
  const { theme, setTheme } = useContext(ThemeContext);
  const location = useLocation();
  const { pathname } = location;

  const { identity, authenticated, logout } = useAuth({});

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

  console.log("user :", user);
  return (
    <div className="flex w-full items-center justify-between bg-background p-4 text-white dark:bg-background-dark">
      <div className="text-black dark:text-white">
        <p className="text-base font-bold md:text-xl">Hello,</p>
        <p className="text-sm md:text-base">
          {user === undefined ? NEW_USER_NICKNAME : user.nickName}
        </p>
      </div>
      {pathname === "/" && (
        <div className="hidden items-center justify-between gap-4 text-black dark:text-white lg:flex">
          <Link className="text-base" to={"/about"}>
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
      <div className="flex items-center gap-4">
        <div className="hidden flex-row items-center gap-1 rounded-xl bg-white p-2 md:flex">
          <TbSearch className="text-gray-500" />
          <input
            type="text"
            className="ring-none border-none bg-transparent text-[16px] text-gray-500"
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
          className="rounded-full bg-white p-2 dark:text-white text-black text-xl dark:bg-white/10"
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
        >
          {theme === "dark" ? <MdOutlineDarkMode size={22} /> : <MdOutlineLightMode size={22}/>}
        </button>

        <Link to={"view"} className="hidden items-center gap-2 sm:flex">
          {user && user.imageUri ? (
            <FilePreview dataUri={user.imageUri} className="h-[48px] rounded-full" />
          ) : (
            <img
              src={ProfileSvg}
              className="h-[48px] rounded-full"
              alt="Profile"
            />
          )}
          {/* <p className="text-black dark:text-white">
          { queriedUser?.length === 0 ? NEW_USER_NICKNAME : queriedUser?.[0]?.nickName }
          </p> */}
        </Link>
      </div>
    </div>
  );
};

export default TopBar;
