import { Link, useLocation } from "react-router-dom";

import MenuSvg from "../../../assets/menu.svg";
import HomeSvg from "../../../assets/home.svg";
import EditSvg from "../../../assets/edit.svg";
import CopyRightSvg from "../../../assets/copyright.svg";
import WindowSvg from "../../../assets/window.svg";
import ProfileSvg from "../../../assets/profile.png";
import HelpCenterSvg from "../../../assets/help-center.svg";
import SideBar from "./SideBar";

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
    name: "store",
  },
  {
    svg: ProfileSvg,
    label: "",
    name: "profile",
  },
  {
    svg: HelpCenterSvg,
    label: "Help Center",
    name: "about",
  },
];

function NavBar() {
  const location = useLocation();
  const { pathname } = location;

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
              {NavBarItems.map((item) => (
                <Link
                  className={`flex flex-col items-center justify-center gap-2 ${pathname !== "/" + item.name && "profile" !== item.name && "opacity-40"}`}
                  to={item.name}
                >
                  <img
                    src={item.svg}
                    className={`h-8 w-8 ${item.name === "profile" ? "rounded-full" : "invert"}`}
                  />
                  <p className={`text-sm text-gray-50`}>{item.label}</p>
                </Link>
              ))}
            </div>
          </div>
          <SideBar />
        </>
      )}
    </>
  );
}

export default NavBar;
