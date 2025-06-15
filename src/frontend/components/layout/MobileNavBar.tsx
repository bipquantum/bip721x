import { Link, useLocation } from "react-router-dom";
import LogoutSvg from "../../assets/logout.svg";
import LoginSvg from "../../assets/login.svg";

import { useAuth } from "@ic-reactor/react";

import BipsIcon from "../icons/BipsIcon";
import DashIcon from "../icons/DashIcon";
import MarketIcon from "../icons/MarketIcon";
import NewIPIcon from "../icons/NewIPIcon";
import SupportIcon from "../icons/SupportIcon";

const MobileNavBar = () => {
  
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
    <>
      {!(pathname.includes("login") || pathname.includes("certificate")) && (
          <div className="shadow shadow-black/30 dark:shadow-white/30 w-full 
              sm:hidden px-4 h-16 min-h-16 flex flex-row items-center bg-background font-bold text-black dark:bg-background-dark dark:text-white pt-2">
              {NavBarItems.map((item, index) => (
                <Link
                  className={`flex h-full grow flex-row items-end justify-center text-black dark:text-white ${
                    item.link !== "marketplace" && !authenticated && "hidden"
                  } ${pathname === "/" + item.link ? "active-link" : ""}`}
                  to={item.link}
                  key={index}
                  target={item.target}
                  rel={item.rel}
                >
                  <div className={`flex flex-col pb-4 pt-1 px-1 ${pathname !== "/" + item.link ? "text-primary dark:text-secondary" : "bg-background-dark dark:bg-secondary rounded-t-full text-white dark:text-secondary"}`}>
                    <div className={`flex h-8 w-8 items-center justify-center rounded-full ${pathname !== "/" + item.link ? "" : "bg-primary dark:bg-white"}`}>
                      { item.icon() }
                    </div>
                  </div>
                </Link>
              ))}
              <div className="flex flex-col items-center pb-2 pt-1 px-1 grow ">
                <img
                  src={authenticated ? LogoutSvg : LoginSvg}
                  alt=""
                  className="flex grow h-7 w-7 cursor-pointer dark:invert"
                  onClick={() => {
                    if (authenticated) {
                      logout();
                    } else {
                      login();
                    }
                  }}
                />
              </div>
          </div>
      )}
    </>
  );
};

export default MobileNavBar;
