import { Link, useLocation } from "react-router-dom";

import MenuSvg from "../../assets/menu.svg";
import HomeSvg from "../../assets/home.svg";
import EditSvg from "../../assets/edit.svg";
import WindowSvg from "../../assets/window.svg";
import ProfileSvg from "../../assets/profile.png";
import LogoutSvg from "../../assets/logout.svg";
import LogoSvg from "../../assets/logo.png";
import MessagesSvg from "../../assets/messages.svg";

import { useAuth } from "@ic-reactor/react";
import ChatHistoryBar from "./ChatHistoryBar";
import { backendActor } from "../actors/BackendActor";
import { NEW_USER_NICKNAME } from "../constants";

const NavBar = () => {

  const location = useLocation();
  const { pathname } = location;

  const { identity, authenticated, logout } = useAuth({});

  if (!identity || !authenticated) {
    return <></>;
  }

  const { data: queriedUser } = backendActor.useQueryCall({
    functionName: "get_user",
    args: [identity?.getPrincipal()],
  });

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
    {
      svg: WindowSvg,
      label: "bIPs",
      link: "bips",
    },
    {
      svg: WindowSvg, // TODO: replace with marketplace icon
      label: "Market place",
      link: "marketplace",
    },
    {
      svg: ProfileSvg,
      label: queriedUser?.length === 0 ? NEW_USER_NICKNAME : queriedUser?.[0]?.nickName,
      link: "profile",
    },
  ];

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
                      className={`${item.link === "profile" ? "h-9 rounded-full" : "h-7 invert"}`}
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
