import { useAuth } from "@ic-reactor/react";
import { Link } from "react-router-dom";

import LogoSvg from "../../../assets/logo.png";
import MenuSvg from "../../../assets/menu.svg";
import ProfileSvg from "../../../assets/profile.png";
import { backendActor } from "../../actors/BackendActor";
import { NEW_USER_NICKNAME } from "../../constants";

const Main = () => {

  const { authenticated, identity } = useAuth({});

  if (!authenticated || !identity) {
    return <></>;
  }

  const { data: queriedUser } = backendActor.useQueryCall({
    functionName: "get_user",
    args: [identity?.getPrincipal()],
  });

  return (
    <div className="flex h-full w-full flex-col items-center justify-start overflow-auto border-l bg-primary text-lg text-white">
      <div className="flex w-full items-center justify-between py-8 pr-4 sm:p-16">
        <img src={LogoSvg} className="h-14 dark:invert" alt="Logo" />
        <img
          src={MenuSvg}
          className="block h-8 dark:invert sm:hidden"
          alt="Logo"
        />
        <div className="hidden items-center justify-center gap-x-16 sm:flex">
          <Link to={"/about"}>About</Link>
          <Link to={"/new"}>Add your Intellectual Property</Link>
          <Link to={"/store"}>Store</Link>
        </div>
        <Link to={"profile"} className="hidden items-center gap-4 sm:flex">
          { queriedUser?.length === 0 ? NEW_USER_NICKNAME : queriedUser?.[0]?.nickName }
          <img src={ProfileSvg} className="h-10 rounded-full" alt="Logo" />
        </Link>
      </div>
      <div className="flex h-full flex-col items-center justify-center">
        <div className="mx-4 flex w-full flex-col items-center justify-center gap-6 rounded-2xl bg-white p-12 py-8 text-center font-bold text-secondary sm:w-[440px]">
          <p className="w-full px-4 text-start">IP Creation Option</p>
          <Link to={"/dashboard"} className="w-full rounded-2xl border-[2px] border-secondary bg-white py-2">
            AI-Assisted IP Creation
          </Link>
          <Link to={"/new"} className="w-full rounded-2xl border-[2px] border-secondary bg-white py-2">
            Manual IP Creation
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Main;
