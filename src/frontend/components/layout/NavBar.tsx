import React, { useContext, useState } from "react";
import { Link, Navigate, useLocation } from "react-router-dom";

import MenuSvg from "../../assets/menu.svg";
import HomeSvg from "../../assets/home.svg";
import EditSvg from "../../assets/edit.svg";
import CopyRightSvg from "../../assets/copyright.svg";
import WindowSvg from "../../assets/window.svg";
import ProfileSvg from "../../assets/profile.png";
import HelpCenterSvg from "../../assets/help-center.svg";
import LogoutSvg from "../../assets/logout.svg";
import MoonSvg from "../../assets/moon.svg";
import SunSvg from "../../assets/sun.svg";
import SideBar from "./SideBar";
import { useAuth } from "@ic-reactor/react";
import { ThemeContext } from "../App";

const NavBarItems = [
  {
    svg: HomeSvg,
    label: "Dashboard",
    link: "dashboard",
  },
  {
    svg: EditSvg,
    label: "New",
    link: "new",
  },
  // {
  //   svg: CopyRightSvg,
  //   label: "Copyright",
  //   link: "copyright",
  // },
  {
    svg: WindowSvg,
    label: "Bips",
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
      {!(pathname === "/" || pathname === "login") && (
        <>
          <div className="flex h-full w-32 flex-col items-center overflow-auto border-r-2 border-gray-300 bg-white p-5 font-bold text-black dark:border-white dark:bg-blue-400 dark:text-white">
            <img
              src={MenuSvg}
              alt=""
              className="mt-2 h-6 cursor-pointer dark:invert"
            />
            <div className="flex flex-grow flex-col items-center justify-center gap-12">
              {NavBarItems.map((item, index) => (
                <Link
                  className={`flex flex-col items-center justify-center gap-2 ${pathname !== "/" + item.link && "profile" !== item.link && "opacity-40"}`}
                  to={item.link}
                  key={index}
                >
                  <img
                    src={item.svg}
                    className={`h-8 w-8 ${item.link === "profile" ? "rounded-full" : "dark:invert"}`}
                  />
                  <p className={`text-sm`}>{item.label}</p>
                </Link>
              ))}
              <button
                onClick={() => logout()}
                className="flex flex-col items-center justify-center gap-2"
              >
                <img
                  src={LogoutSvg}
                  alt=""
                  className="mt-2 h-8 cursor-pointer dark:invert"
                />
                <p className={`text-sm`}>Logout</p>
              </button>
            </div>
          </div>
          <SideBar />
        </>
      )}
      <div className="absolute right-4 top-2">
        <DarkModeToggle />
      </div>
    </>
  );
};

export default NavBar;
