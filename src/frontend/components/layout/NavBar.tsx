import React, { useContext, useState } from "react";
import { Link, Navigate, useLocation } from "react-router-dom";

import MenuSvg from "../../assets/menu.svg";
import HomeSvg from "../../assets/home.svg";
import EditSvg from "../../assets/edit.svg";
import WindowSvg from "../../assets/window.svg";
import ProfileSvg from "../../assets/profile.png";
import HelpCenterSvg from "../../assets/help-center.svg";
import LogoutSvg from "../../assets/logout.svg";
import MoonSvg from "../../assets/moon.svg";
import SunSvg from "../../assets/sun.svg";
import LogoSvg from "../../assets/logo.png";
import MessagesSvg from "../../assets/messages.svg";

import { useAuth } from "@ic-reactor/react";
import { ThemeContext } from "../App";
import ChatHistoryBar from "./ChatHistoryBar";

const NavBarItems = [
  {
    svg: HomeSvg,
    label: "Dashboard",
    link: "dashboard",
  },
  {
    svg: EditSvg,
    label: "Create New IP",
    link: "new",
  },
  // {
  //   svg: CopyRightSvg,
  //   label: "Copyright",
  //   link: "copyright",
  // },
  {
    svg: WindowSvg,
    label: "bIPs",
    link: "bips",
  },
  {
    svg: ProfileSvg,
    label: "",
    link: "profile",
  },
  {
    svg: HelpCenterSvg,
    label: "Help Center",
    link: "about",
  },
];

const DarkModeToggle = () => {
  const { theme, setTheme } = useContext(ThemeContext);

  return (
    <button
      onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
      className={`flex w-28 items-center justify-between rounded-full bg-gray-400 bg-opacity-45 px-4 py-1 text-sm font-bold uppercase text-gray-800 transition-colors duration-500 dark:bg-blue-600 dark:text-white ${theme === "dark" ? "flex-row" : "flex-row-reverse"}`}
    >
      <div
        className={`${theme === "dark" ? "-ml-2" : "-mr-2"} flex h-7 w-7 items-center justify-center rounded-full bg-white`}
      >
        <img
          src={theme === "dark" ? MoonSvg : SunSvg}
          alt=""
          className="h-6 cursor-pointer"
        />
      </div>
      {theme === "dark" ? "night" : "light"}
    </button>
  );
};

const NavBar = () => {
  const location = useLocation();
  const { pathname } = location;

  const { authenticated, logout } = useAuth({});

  if (!authenticated) {
    return <></>;
  }

  return (
    <>
      {!(pathname === "login") && (
        <>
          <div className="hidden h-screen w-[107px] flex-col items-center overflow-auto bg-secondary pt-8 font-bold text-white sm:flex">
            <img
              src={MenuSvg}
              alt=""
              className="mt-2 h-8 cursor-pointer invert"
            />
            <div className="flex flex-grow flex-col items-center justify-between py-10">
              <div className="flex flex-col items-center justify-start gap-12">
                {NavBarItems.map((item, index) => (
                  <Link
                    className={`flex flex-col items-center justify-center gap-2 ${pathname !== "/" + item.link && "profile" !== item.link && "opacity-40"}`}
                    to={item.link}
                    key={index}
                  >
                    <img
                      src={item.svg}
                      className={`${item.link === "profile" ? "h-8 rounded-full" : "h-6 invert"}`}
                    />
                    <p className={`text-[10px] font-bold`}>{item.label}</p>
                  </Link>
                ))}
              </div>
              <button
                onClick={() => logout()}
                className="flex flex-col items-center justify-center gap-2"
              >
                <img
                  src={LogoutSvg}
                  alt=""
                  className="mt-2 h-8 cursor-pointer invert"
                />
                <p className={`text-sm`}>Logout</p>
              </button>
            </div>
          </div>
          <div className="flex h-28 w-full items-center justify-between bg-secondary px-4 sm:hidden">
            <img src={MenuSvg} alt="" className="h-7 cursor-pointer invert" />
            <img src={LogoSvg} className="h-14 invert" alt="Logo" />
            <img src={MessagesSvg} className="h-7" alt="Logo" />
          </div>
          <ChatHistoryBar/>
        </>
      )}
      {/* <div className="absolute right-4 top-2 z-50">
        <DarkModeToggle />
      </div> */}
    </>
  );
};

export default NavBar;
