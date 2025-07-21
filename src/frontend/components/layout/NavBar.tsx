import { Link, useLocation } from "react-router-dom";
import LogoutSvg from "../../assets/logout.svg";
import LoginSvg from "../../assets/login.svg";

import { useAuth } from "@ic-reactor/react";

import BipsIcon from "../icons/BipsIcon";
import DashIcon from "../icons/DashIcon";
import MarketIcon from "../icons/MarketIcon";
import NewIPIcon from "../icons/NewIPIcon";
import SupportIcon from "../icons/SupportIcon";

const NavBar = () => {
  const { pathname } = useLocation();

  const { authenticated, logout, login } = useAuth({});

  const NavBarItems = [
    {
      icon: DashIcon,
      label: "Dashboard",
      link: "dashboard",
    },
    {
      icon: NewIPIcon,
      label: "Create New IP",
      link: "new",
    },
    {
      icon: BipsIcon,
      label: "BIPs",
      link: "bips",
    },
    {
      icon: MarketIcon,
      label: "Market place",
      link: "marketplace",
    },
    {
      icon: SupportIcon,
      label: "Support",
      link: "https://www.bipquantum.com/help-support.html",
      target: "_blank",
      rel: "noopener noreferrer",
    },
  ];

  return (
    <div className="fixed left-0 top-0 flex hidden h-full w-fit min-w-20 flex-col items-center justify-between border-r border-black/30 font-bold text-black shadow shadow-black/30 dark:border-white/30 dark:text-white dark:shadow-white/30 sm:flex">
      <div>{/*spacer*/}</div>
      <div className="flex flex-col items-center space-y-2 pr-2">
        {NavBarItems.map((item, index) => (
          <Link
            className={`relative z-50 flex h-full w-full flex-col items-center justify-center text-black dark:text-white ${!authenticated && "hidden"} ${pathname === "/" + item.link ? "active-link" : ""}`}
            to={item.link}
            key={index}
            target={item.target}
            rel={item.rel}
          >
            <div
              className={`flex flex-col items-center p-2 pl-4 ${pathname !== "/" + item.link ? "text-primary dark:text-secondary" : "rounded-r-full bg-primary text-primary dark:bg-secondary dark:text-secondary"}`}
            >
              <div
                className={`flex size-[48px] items-center justify-center rounded-full ${pathname !== "/" + item.link ? "" : "bg-white"}`}
              >
                {item.icon()}
              </div>
            </div>

            {/* Label */}
            <div className="-mt-2 h-[10px] pl-2">
              {pathname !== "/" + item.link && (
                <p className={`text-[10px] font-bold`}>{item.label}</p>
              )}
            </div>
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
        <p className={`text-[10px] font-bold`}>
          {authenticated ? "Logout" : "Login"}
        </p>
      </button>
    </div>
  );
};

export default NavBar;
