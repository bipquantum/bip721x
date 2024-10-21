import React, { useContext, useState } from "react";
import { Link, Navigate, useLocation } from "react-router-dom";

import MenuSvg from "../../assets/menu.svg";
import HomeSvg from "../../assets/home.svg";
import EditSvg from "../../assets/edit.svg";
import WindowSvg from "../../assets/window.svg";
import ProfileSvg from "../../assets/profile.png";
import HelpCenterSvg from "../../assets/help-center.svg";
import LogoutSvg from "../../assets/logout.svg";
import ChatHistoryBar from "./ChatHistoryBar";
import LogoSvg from "../../assets/logo.png";
import MessagesSvg from "../../assets/messages.svg";

import { useAuth } from "@ic-reactor/react";

const MobileNavBarItems = [
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
  //   {
  //     svg: HelpCenterSvg,
  //     label: "Help Center",
  //     link: "about",
  //   },
];

const MobileNavBar = () => {
  const location = useLocation();
  const { pathname } = location;

  const { authenticated, logout } = useAuth({});

  if (!authenticated) {
    return <></>;
  }

  return (
    <div className="flex w-full items-center justify-between bg-secondary p-4 sm:hidden">
      {MobileNavBarItems.map((item, index) => (
        <Link
          className={`rounded-xl p-4 ${pathname !== "/" + item.link && "profile" !== item.link && "opacity-40"} ${pathname === "/" + item.link && "profile" !== item.link && "bg-white bg-opacity-25"}`}
          to={item.link}
          key={index}
        >
          <img
            src={item.svg}
            className={`${item.link === "profile" ? "h-10 rounded-full" : "h-7 invert"}`}
          />
        </Link>
      ))}
    </div>
  );
};

export default MobileNavBar;
