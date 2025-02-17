import { Link, useLocation, useNavigate } from "react-router-dom";

import HomeSvg from "../../assets/home.svg";
import EditSvg from "../../assets/edit.svg";
import WindowSvg from "../../assets/window.svg";
import MarketSvg from "../../assets/market.svg";
import ProfileSvg from "../../assets/profile.png";
import LogoutSvg from "../../assets/logout.svg";

import { useAuth } from "@ic-reactor/react";
import { useContext, useEffect, useState } from "react";
import { User } from "../../../declarations/backend/backend.did";
import { backendActor } from "../actors/BackendActor";
import { fromNullable } from "@dfinity/utils";
import FilePreview from "../common/FilePreview";
import { NEW_USER_NICKNAME } from "../constants";

import { ThemeContext } from "../App";
import dashDark from "../../assets/navIcons/dash-dark.svg";
import dashLight from "../../assets/navIcons/dash-light.svg";
import newDark from "../../assets/navIcons/new-dark.svg";
import newLight from "../../assets/navIcons/new-light.svg";
import bipsDark from "../../assets/navIcons/bips-dark.svg";
import bipsLight from "../../assets/navIcons/bips-light.svg";
import marketDark from "../../assets/navIcons/market-dark.svg";
import marketLight from "../../assets/navIcons/market-light.svg";

const MobileNavBar = () => {
  const location = useLocation();
  const { pathname } = location;

  const { identity, authenticated, logout } = useAuth({});

  if (!identity || !authenticated) {
    return <></>;
  }

  const [user, setUser] = useState<User | undefined>(undefined);

  const { data: queriedUser } = backendActor.useQueryCall({
    functionName: "get_user",
    args: [identity?.getPrincipal()],
  });

  useEffect(() => {
    if (queriedUser !== undefined) {
      setUser(fromNullable(queriedUser));
    } else {
      setUser(undefined);
    }
  }, [queriedUser]);

  const MobileNavBarItems = [
    {
      darkSvg: dashDark,
      lightSvg: dashLight,
      label: "Dashboard",
      link: "dashboard",
    },
    {
      darkSvg: newDark,
      lightSvg: newLight,
      label: "Create New IP",
      link: "new",
    },
    {
      darkSvg: bipsDark,
      lightSvg: bipsLight,
      label: "bIPs",
      link: "bips",
    },
    {
      darkSvg: marketDark,
      lightSvg: marketLight,
      label: "Market place",
      link: "marketplace",
    },
    {
      darkSvg: user?.imageUri,
      lightSvg: user?.imageUri,
      label:
        user === undefined || user.nickName.length === 0
          ? NEW_USER_NICKNAME
          : user.nickName,
      link: "profile",
    },
  ];

  const { theme, setTheme } = useContext(ThemeContext);

  return (
    !pathname.includes("certificate") && (
      <div className="sticky flex min-h-16 w-full items-center justify-between space-x-2 border-t bg-background px-4 dark:bg-background-dark sm:hidden">
        {MobileNavBarItems.map((item, index) => (
          <Link
            className={`rounded-full size-[40px] flex items-center justify-center ${pathname === "/" + item.link ? "  bg-background-dark dark:bg-white ": ""}`}
            to={item.link}
            key={index}
          >
            {item.link === "profile" ? (
              user !== undefined && user.imageUri !== "" ? (
                <FilePreview
                  dataUri={user.imageUri}
                  className={"h-[28px] rounded-full object-cover"}
                />
              ) : (
                <img
                  src={ProfileSvg}
                  className="h-[28px] rounded-full object-cover"
                />
              )
            ) : (
              <img src={item.lightSvg} 
                className="h-[28px]"
              />
            )}
          </Link>
        ))}
        <button
          onClick={() => logout()}
          className="flex flex-col items-center justify-center size=[32px]"
        >
          <img src={LogoutSvg} alt="" className="h-[28px] w-[28px] cursor-pointer dark:invert" />
        </button>
      </div>
    )
  );
};

export default MobileNavBar;
