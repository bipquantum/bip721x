import { Link, useLocation } from "react-router-dom";

// import HomeSvg from "../../assets/home.svg";
// import EditSvg from "../../assets/edit.svg";
// import WindowSvg from "../../assets/window.svg";
// import MarketSvg from "../../assets/market.svg";
import ProfileSvg from "../../assets/profile.png";
import LogoutSvg from "../../assets/logout.svg";
import LoginSvg from "../../assets/login.svg";
import Logo from "../../assets/logoWhite.svg";
import LogoDark from "../../assets/LogoDark.png";

import { useAuth } from "@ic-reactor/react";
import { backendActor } from "../actors/BackendActor";
import { NEW_USER_NICKNAME } from "../constants";
import { useContext, useEffect, useState } from "react";
import { fromNullable } from "@dfinity/utils";
import { User } from "../../../declarations/backend/backend.did";
import FilePreview from "../common/FilePreview";
import { ThemeContext } from "../App";

import dashDark from "../../assets/navIcons/dash-dark.svg";
import dashLight from "../../assets/navIcons/dash-light.svg";
import newDark from "../../assets/navIcons/new-dark.svg";
import newLight from "../../assets/navIcons/new-light.svg";
import bipsDark from "../../assets/navIcons/bips-dark.svg";
import bipsLight from "../../assets/navIcons/bips-light.svg";
import marketDark from "../../assets/navIcons/market-dark.svg";
import marketLight from "../../assets/navIcons/market-light.svg";
import supportDark from "../../assets/navIcons/support-dark.svg";
import supportLight from "../../assets/navIcons/support-light.svg";
import darkBG from "../../assets/navIcons/darkBG.svg";

const NavBar = () => {
  const { pathname } = useLocation();

  const { identity, authenticated, logout, login } = useAuth({});

  const [user, setUser] = useState<User | undefined>(undefined);

  const { data: queriedUser } = backendActor.useQueryCall({
    functionName: "get_user",
    args: identity ? [identity?.getPrincipal()] : undefined,
  });

  useEffect(() => {
    if (queriedUser !== undefined) {
      setUser(fromNullable(queriedUser));
    } else {
      setUser(undefined);
    }
  }, [queriedUser]);

  const NavBarItems = [
    {
      darkSvg: dashDark,
      lightSvg: dashLight,
      label: "Dashboard",
      link: "dashboard",
    },
    {
      darkSvg: newDark,
      lightSvg: newLight,
      label: "Create New IP",
      link: "new",
    },
    {
      darkSvg: bipsDark,
      lightSvg: bipsLight,
      label: "BIPs",
      link: "bips",
    },
    {
      darkSvg: marketDark,
      lightSvg: marketLight,
      label: "Market place",
      link: "marketplace",
    },
    {
      darkSvg: user?.imageUri,
      lightSvg: user?.imageUri,
      label:
        user === undefined || user.nickName.length === 0
          ? NEW_USER_NICKNAME
          : user.nickName,
      link: "profile",
    },
    {
      darkSvg: supportDark,
      lightSvg: supportLight,
      label: "Support",
      link: "support",
    },
  ];

  const { theme, setTheme } = useContext(ThemeContext);

  return (
    <>
      {!(pathname.includes("login") || pathname.includes("certificate")) && (
        <div className="static z-[999] flex w-[90px] flex-row border-r border-black/30 shadow shadow-black/30 dark:border-white/30 dark:shadow-white/30">
          <div className="hidden h-screen w-fit flex-col items-center overflow-y-auto bg-background pt-8 font-bold text-black dark:bg-background-dark dark:text-white sm:flex">
            <div className="flex flex-grow flex-col items-center justify-between">
              <div className="flex flex-col items-center justify-start">
                <Link to={"/"} className="mb-[20px] size-[48px] xl:mb-[40px]">
                  <img
                    src={theme === "dark" ? LogoDark : LogoDark}
                    alt=""
                    className={`h-full w-full`}
                  />
                </Link>
                {NavBarItems.map((item, index) => (
                  <Link
                    className={`relative z-50 flex h-full w-full flex-col items-center justify-center gap-2 p-2 text-black dark:text-white ${
                      item.link !== "marketplace" && !authenticated && "hidden"
                    } ${pathname === "/" + item.link ? "active-link" : ""}`}
                    to={item.link}
                    key={index}
                  >
                    {pathname === "/" + item.link && (
                      <div className="absolute -top-[42.5%] left-[-5px] -z-10 h-full w-[85px] overflow-x-visible">
                        <img src={darkBG} alt="" />
                      </div>
                    )}

                    {item.link === "profile" ? (
                      user !== undefined && user.imageUri !== "" ? (
                        <FilePreview
                          dataUri={user.imageUri}
                          className={"size-[48px] rounded-full object-cover"}
                        />
                      ) : (
                        <img
                          src={ProfileSvg}
                          className="size-[48px] rounded-full object-cover"
                        />
                      )
                    ) : (
                      <div
                        className={`relative flex size-[48px] items-center justify-center rounded-full ${
                          pathname !== "/" + item.link ? "" : "bg-white"
                        }`}
                      >
                        <img
                          src={theme === "dark" ? item.darkSvg : item.lightSvg}
                        />
                      </div>
                    )}

                    {/* Label */}
                    {pathname !== "/" + item.link && (
                      <p className={`text-[10px] font-bold`}>{item.label}</p>
                    )}
                  </Link>
                ))}
              </div>
              <button
                onClick={() => {
                  authenticated ? logout() : login();
                }}
                className="flex flex-col items-center justify-center gap-2"
              >
                <img
                  src={authenticated ? LogoutSvg : LoginSvg}
                  alt=""
                  className="mt-2 h-8 cursor-pointer dark:invert"
                />
                <p className={`text-sm`}>
                  {authenticated ? "Logout" : "Login"}
                </p>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default NavBar;
