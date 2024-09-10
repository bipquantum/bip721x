import React, { useContext, useState } from "react";
import { Link, Navigate, useLocation } from "react-router-dom";

import MenuSvg from "../../../assets/menu.svg";
import HomeSvg from "../../../assets/home.svg";
import EditSvg from "../../../assets/edit.svg";
import CopyRightSvg from "../../../assets/copyright.svg";
import WindowSvg from "../../../assets/window.svg";
import ProfileSvg from "../../../assets/profile.png";
import HelpCenterSvg from "../../../assets/help-center.svg";
import LogoutSvg from "../../../assets/logout.svg";
import MoonSvg from "../../../assets/moon.svg";
import SunSvg from "../../../assets/sun.svg";
import SideBar from "./SideBar";
import { useAuth } from "@ic-reactor/react";
import { ThemeContext } from "../../App";

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
  {
    svg: CopyRightSvg,
    label: "Copyright",
    link: "copyright",
  },
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
      className={`flex w-32 items-center justify-between rounded-full bg-blue-900 bg-opacity-45 px-4 py-2 text-base font-bold uppercase text-white transition-colors duration-500 dark:bg-gray-200 dark:text-gray-800 ${theme === "dark" ? "flex-row-reverse" : "flex-row"}`}
    >
      <div
        className={`${theme === "dark" ? "-mr-2" : "-ml-2"} flex h-10 w-10 items-center justify-center rounded-full bg-white`}
      >
        <img
          src={theme === "dark" ? SunSvg : MoonSvg}
          alt=""
          className="h-6 cursor-pointer"
        />
      </div>
      {theme === "dark" ? "light" : "night"}
    </button>
  );
};

function NavBar() {
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
          <div className="flex h-full w-32 flex-col items-center overflow-auto border-r-2 border-white bg-blue-400 p-5">
            <img
              src={MenuSvg}
              alt=""
              className="mt-2 h-6 cursor-pointer invert"
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
                    className={`h-8 w-8 ${item.link === "profile" ? "rounded-full" : "invert"}`}
                  />
                  <p className={`text-sm text-gray-50`}>{item.label}</p>
                </Link>
              ))}
              <button
                onClick={() => logout()}
                className="flex flex-col items-center justify-center gap-2"
              >
                <img
                  src={LogoutSvg}
                  alt=""
                  className="mt-2 h-8 cursor-pointer invert"
                />
                <p className={`text-sm text-gray-50`}>Logout</p>
              </button>
            </div>
          </div>
          <SideBar />
          <div className="absolute right-4 top-2">
            <DarkModeToggle />
          </div>
        </>
      )}
    </>
  );
}

export default NavBar;
