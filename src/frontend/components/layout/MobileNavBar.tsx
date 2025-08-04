import { Link, useLocation } from "react-router-dom";
import LogoutSvg from "../../assets/logout.svg";
import LoginSvg from "../../assets/login.svg";

import BipsIcon from "../icons/BipsIcon";
import DashIcon from "../icons/DashIcon";
import MarketIcon from "../icons/MarketIcon";
import NewIPIcon from "../icons/NewIPIcon";
import SupportIcon from "../icons/SupportIcon";
import { useIdentity } from "@nfid/identitykit/react";
import { useMemo } from "react";

const MobileNavBar = () => {
  const { pathname } = useLocation();

  const identity = useIdentity();
  const authenticated = useMemo(
    () => identity !== undefined && !identity.getPrincipal().isAnonymous(),
    [identity],
  );

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
        <footer className="fixed bottom-0 left-0 right-0 z-50 flex h-16 min-h-16 w-full flex-row items-center bg-background px-4 pt-2 font-bold text-black shadow shadow-black/30 dark:bg-background-dark dark:text-white dark:shadow-white/30 sm:hidden">
          {NavBarItems.map((item, index) => (
            <Link
              className={`flex h-full grow flex-row items-end justify-center text-black dark:text-white ${!authenticated && "hidden"} ${pathname === "/" + item.link ? "active-link" : ""}`}
              to={item.link}
              key={index}
              target={item.target}
              rel={item.rel}
            >
              <div
                className={`flex flex-col px-1 pb-4 pt-1 ${pathname !== "/" + item.link ? "text-primary dark:text-secondary" : "rounded-t-full bg-primary text-primary dark:bg-secondary dark:text-secondary"}`}
              >
                <div
                  className={`flex h-8 w-8 items-center justify-center rounded-full ${pathname !== "/" + item.link ? "" : "bg-white"}`}
                >
                  {item.icon()}
                </div>
              </div>
            </Link>
          ))}
          <div className="flex grow flex-col items-center px-1 pb-2 pt-1">
            <img
              src={authenticated ? LogoutSvg : LoginSvg}
              alt=""
              className="flex h-7 w-7 grow cursor-pointer dark:invert"
              onClick={() => {
                if (authenticated) {
                  console.log("TODO: Logging out");
                } else {
                  console.log("TODO: Logging in");
                }
              }}
            />
          </div>
        </footer>
      )}
    </>
  );
};

export default MobileNavBar;
