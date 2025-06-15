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
    <div className="border-r border-black/30 shadow shadow-black/30 dark:border-white/30 dark:shadow-white/30 flex w-[300px]
      hidden h-full w-fit flex-col items-center justify-between font-bold text-black dark:text-white sm:flex">
      <div>{/*spacer*/}</div>
      <div className="flex flex-col items-center space-y-2 pr-2">
        {NavBarItems.map((item, index) => (
          <Link
            className={`relative z-50 flex h-full w-full flex-col items-center justify-center text-black dark:text-white ${
              item.link !== "marketplace" && !authenticated && "hidden"
            } ${pathname === "/" + item.link ? "active-link" : ""}`}
            to={item.link}
            key={index}
            target={item.target}
            rel={item.rel}
          >
            <div className={`flex flex-col items-center pl-4 p-2 ${pathname !== "/" + item.link ? "text-primary dark:text-secondary" : "bg-primary dark:bg-secondary rounded-r-full text-white dark:text-secondary"}`}>
              <div className={`flex size-[48px] items-center justify-center rounded-full ${pathname !== "/" + item.link ? "" : "bg-background-dark dark:bg-white"}`}>
                { item.icon() }
              </div>
            </div>

            {/* Label */}
            <div className="h-[10px] pl-2 -mt-2">
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
