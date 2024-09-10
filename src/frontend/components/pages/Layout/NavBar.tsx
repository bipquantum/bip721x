import { Link, Navigate, useLocation } from "react-router-dom";

import MenuSvg from "../../../assets/menu.svg";
import HomeSvg from "../../../assets/home.svg";
import EditSvg from "../../../assets/edit.svg";
import CopyRightSvg from "../../../assets/copyright.svg";
import WindowSvg from "../../../assets/window.svg";
import ProfileSvg from "../../../assets/profile.png";
import HelpCenterSvg from "../../../assets/help-center.svg";
import LogoutSvg from "../../../assets/logout.svg";
import SideBar from "./SideBar";
import { useAuth } from "@ic-reactor/react";

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
          <div className="flex w-32 flex-col items-center border-r-2 border-white bg-blue-400 p-5">
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
        </>
      )}
    </>
  );
}

export default NavBar;
