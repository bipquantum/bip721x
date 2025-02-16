import { Link, useLocation} from "react-router-dom";

import HomeSvg from "../../assets/home.svg";
import EditSvg from "../../assets/edit.svg";
import WindowSvg from "../../assets/window.svg";
import MarketSvg from "../../assets/market.svg";
import ProfileSvg from "../../assets/profile.png";
import LogoutSvg from "../../assets/logout.svg";
import LoginSvg from "../../assets/login.svg";
import Logo from "../../assets/logoWhite.svg"

import { useAuth } from "@ic-reactor/react";
import { backendActor } from "../actors/BackendActor";
import { NEW_USER_NICKNAME } from "../constants";
import { useEffect, useState } from "react";
import { fromNullable } from "@dfinity/utils";
import { User } from "../../../declarations/backend/backend.did";
import FilePreview from "../common/FilePreview";
import { ThemeContext } from "../App";

const NavBar = () => {
  const { pathname } = useLocation();

  const { identity, authenticated, logout, login } = useAuth({});


  const [user, setUser] = useState<User | undefined>(undefined);

  const { data: queriedUser } = backendActor.useQueryCall({
    functionName: "get_user",
    args: identity ? [identity?.getPrincipal()] : undefined,
  });

  useEffect(() => {
    if (queriedUser !== undefined){
      setUser(fromNullable(queriedUser));
    } else {
      setUser(undefined);
    }
  }
  ,[queriedUser]);

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
      svg: MarketSvg,
      label: "Market place",
      link: "marketplace",
    },
    {
      svg: ProfileSvg,
      label: (user === undefined || user.nickName.length === 0) ? NEW_USER_NICKNAME : user.nickName,
      link: "profile",
    },
  ];

  

  return (
    <>
      {!(pathname.includes("login") || pathname.includes("certificate")) && (
        <div className="flex flex-row static border-r border-black/30 dark:border-white/30 shadow-black/30 dark:shadow-white/30 shadow z-[999]">
          <div className="hidden h-screen w-fit flex-col items-center overflow-auto bg-background dark:bg-background-dark pt-8 font-bold text-black dark:text-white sm:flex">
            <div className="flex flex-grow flex-col items-center justify-between">
              <div className="flex flex-col items-center justify-start">
                <Link to={"/"} className="size-[48px] mb-[40px]">
                  <img src={Logo} alt="" className={`size-[46px] `} />
                </Link>
                {NavBarItems.map((item, index) => (
                  <Link
                    className={`flex h-full w-full flex-col items-center justify-center p-2 gap-2 text-black dark:text-white ${pathname !== "/" + item.link && "opacity-40"} 
                      ${(item.link !== "marketplace" && !authenticated) && "hidden"}`}
                    to={item.link}
                    key={index}
                  >
                    { item.link === "profile" ? 
                      (user !== undefined && user.imageUri !== "") ? 
                        <FilePreview dataUri={user.imageUri} className={"size-[48px] rounded-full object-cover"}/> : 
                        <img src={ProfileSvg} className="size-[28px] rounded-full object-cover" />
                      :
                      <div className="size-[48px] flex items-center justify-center ">
                      <img
                        src={item.svg}
                        className={`${item.link === "bips" ? "size-[28px] invert" : item.link === "marketplace" ? "h-11 invert -my-1" : "h-7 invert"}`}
                        />
                        </div>
                    }
                    <p className={`text-[10px] font-bold`}>{item.label}</p>
                  </Link>
                ))}
              </div>
              <button
                onClick={() => { authenticated ? logout() : login() } }
                className="flex flex-col items-center justify-center gap-2"
              >
                <img
                  src={authenticated ? LogoutSvg : LoginSvg}
                  alt=""
                  className="mt-2 h-8 cursor-pointer invert"
                />
                <p className={`text-sm`}>{authenticated ? "Logout" : "Login"}</p>
              </button>
            </div>
          </div>
          
        </div>
      )}
      
    </>
  );
};

export default NavBar;
