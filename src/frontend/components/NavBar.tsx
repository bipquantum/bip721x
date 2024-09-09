import React, { useState } from "react";
import { Link } from "react-router-dom";

import MenuSvg from "../assets/menu.svg";
import HomeSvg from "../assets/home.svg";
import EditSvg from "../assets/edit.svg";
import CopyRightSvg from "../assets/copyright.svg";
import WindowSvg from "../assets/window.svg";
import ProfileSvg from "../assets/profile.png";
import HelpCenterSvg from "../assets/help-center.svg";

const NavBarItems = [
  {
    svg: HomeSvg,
    label: "Dashboard",
    name: "dashboard",
  },
  {
    svg: EditSvg,
    label: "New",
    name: "new",
  },
  {
    svg: CopyRightSvg,
    label: "Copyright",
    name: "copyright",
  },
  {
    svg: WindowSvg,
    label: "biPs",
    name: "bips",
  },
  {
    svg: ProfileSvg,
    label: "",
    name: "profile",
  },
  {
    svg: HelpCenterSvg,
    label: "Help Center",
    name: "help_center",
  },
];

function NavBar({
  selectedItem,
  setSelectedItem,
}: {
  selectedItem: string;
  setSelectedItem: (item: string) => void;
}) {
  return (
    <div className="flex w-32 flex-col items-center border-r-2 border-white bg-blue-400 p-5">
      <img src={MenuSvg} alt="" className="mt-2 h-6 cursor-pointer invert" />
      <div className="flex flex-grow flex-col items-center justify-center gap-12">
        {NavBarItems.map((item) => (
          <button
            className={`flex flex-col items-center justify-center gap-2 ${selectedItem !== item.name && "profile" !== item.name && "opacity-40"}`}
            onClick={() => setSelectedItem(item.name)}
          >
            <img
              src={item.svg}
              className={`h-8 w-8 ${item.name === "profile" ? "rounded-full" : "invert"}`}
            />
            <p className={`text-sm text-gray-50`}>{item.label}</p>
          </button>
        ))}
      </div>
    </div>
  );
}

export default NavBar;
