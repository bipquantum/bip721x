import { Link, useLocation } from "react-router-dom";

import HomeSvg from "../../assets/home.svg";
import EditSvg from "../../assets/edit.svg";
import WindowSvg from "../../assets/window.svg";
import MarketSvg from "../../assets/market.svg";
import ProfileSvg from "../../assets/profile.png";
import LogoutSvg from "../../assets/logout.svg";
import LogoSvg from "../../assets/logo.png";
import MessagesSvg from "../../assets/messages.svg";

import { useAuth } from "@ic-reactor/react";
import ChatHistoryBar from "./ChatHistoryBar";
import { backendActor } from "../actors/BackendActor";
import { NEW_USER_NICKNAME } from "../constants";
import { ModalPopup } from "../common/ModalPopup";
import { useEffect, useState } from "react";
import { fromNullable } from "@dfinity/utils";
import { User } from "../../../declarations/backend/backend.did";
import FilePreview from "../common/FilePreview";

const NavBar = () => {

  const location = useLocation();
  const { pathname } = location;

  const { identity, authenticated, logout } = useAuth({});

  if (!identity || !authenticated) {
    return <></>;
  }

  const [showChatHistory, setShowChatHistory] = useState(false);
  const [user, setUser] = useState<User | undefined>(undefined);

  const { data: queriedUser } = backendActor.useQueryCall({
    functionName: "get_user",
    args: [identity?.getPrincipal()],
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

  const hideHistoryBar = () => {
    return pathname == "/" || 
           pathname.includes("/marketplace")|| 
           pathname.includes("/bip/") ||
           pathname.includes("/poll") ||
           pathname.includes("/about");
  }

  return (
    <>
      {!(pathname === "login") && (
        <div className="flex flex-row static">
          <div className="hidden h-screen w-[107px] flex-col items-center overflow-auto bg-secondary pt-8 font-bold text-white sm:flex">
            <div className="flex flex-grow flex-col items-center justify-between py-10">
              <div className="flex flex-col items-center justify-start gap-12">
                {NavBarItems.map((item, index) => (
                  <Link
                    className={`flex flex-col items-center justify-center gap-2 ${pathname !== "/" + item.link && "opacity-40"}`}
                    to={item.link}
                    key={index}
                  >
                    { item.link === "profile" ? 
                      (user !== undefined && user.imageUri !== "") ? 
                        FilePreview({ dataUri: user.imageUri, className:"h-9 w-9 rounded-full object-cover"}) : 
                        <img src={ProfileSvg} className="h-9 w-9 rounded-full object-cover" />
                      :
                      <img
                        src={item.svg}
                        className={`${item.link === "bips" ? "h-8 invert" : item.link === "marketplace" ? "h-11 invert -my-1" : "h-7 invert"}`}
                      />
                    }
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
          <div
            className={`hidden h-full w-64 overflow-auto bg-primary text-white transition-all duration-200 ${hideHistoryBar() ? "sm:hidden" : "sm:block"}`}
          >
            <ChatHistoryBar onChatSelected={() => {}}/>
          </div>
        </div>
      )}
      <ModalPopup onClose={() => {setShowChatHistory(false)}} isOpen={showChatHistory}>
        <ChatHistoryBar onChatSelected={() => setShowChatHistory(false)}/>
      </ModalPopup>
    </>
  );
};

export default NavBar;
