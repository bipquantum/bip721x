import { Link,  useLocation } from "react-router-dom";

import HomeSvg from "../../assets/home.svg";
import EditSvg from "../../assets/edit.svg";
import WindowSvg from "../../assets/window.svg";
import MarketSvg from "../../assets/market.svg";
import ProfileSvg from "../../assets/profile.png";
import LogoutSvg from "../../assets/logout.svg";

import { useAuth } from "@ic-reactor/react";
import { useEffect, useState } from "react";
import { User } from "../../../declarations/backend/backend.did";
import { backendActor } from "../actors/BackendActor";
import { fromNullable } from "@dfinity/utils";
import FilePreview from "../common/FilePreview";

const MobileNavBarItems = [
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
    label: "",
    link: "profile",
  },
];

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
    if (queriedUser !== undefined){
      setUser(fromNullable(queriedUser));
    } else {
      setUser(undefined);
    }
  }
  ,[queriedUser]);

  return (
    <div className="flex w-full items-center justify-between bg-secondary px-4 h-20 sticky space-x-2 sm:hidden">
      {MobileNavBarItems.map((item, index) => (
        <Link
          className={`rounded-xl ${pathname !== "/" + item.link && "profile" !== item.link && "opacity-40"} ${pathname === "/" + item.link && "profile" !== item.link && "bg-white bg-opacity-25"}`}
          to={item.link}
          key={index}
        >
          { item.link === "profile" ? 
            (user !== undefined && user.imageUri !== "") ? 
              FilePreview({ dataUri: user.imageUri, className:"h-8 w-8 rounded-full object-cover"}) : 
              <img src={ProfileSvg} className="h-8 w-8 rounded-full object-cover" />
            :
          <img
            src={item.svg}
            className={`${item.link === "profile" ? "h-9 rounded-full" : 
              item.link === "bips" ? "h-8 invert" :
              item.link === "marketplace" ? "h-10 invert -my-1" : "h-7 invert"
            }`}
          />
          }
        </Link>
      ))}
      <button
        onClick={() => logout()}
        className="flex flex-col items-center justify-center"
      >
        <img
          src={LogoutSvg}
          alt=""
          className="h-8 cursor-pointer invert"
        />
      </button>
    </div>
  );
};

export default MobileNavBar;
