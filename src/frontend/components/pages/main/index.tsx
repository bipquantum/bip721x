import { useAuth } from "@ic-reactor/react";
import { Link } from "react-router-dom";

import LogoSvg from "../../../assets/logo.png";
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
    <div className="flex h-full w-full flex-col items-center justify-start overflow-auto bg-primary text-lg text-white">
      <div className="flex w-full items-center justify-between py-8 pr-4 sm:p-16">
        <Link to={"/"} className="hidden sm:flex">
          <img src={LogoSvg} className="h-14 invert" alt="Logo" />
        </Link>
        <div className="hidden items-center justify-center gap-x-16 sm:flex">
          <Link to={"/about"}>About</Link>
          <Link to={"/new"}>Add your Intellectual Property</Link>
          <Link to={"/marketplace"}>Market place</Link>
        </div>
        <Link to={"profile"} className="hidden items-center gap-4 sm:flex">
          { queriedUser?.length === 0 ? NEW_USER_NICKNAME : queriedUser?.[0]?.nickName }
          <img src={ProfileSvg} className="h-10 rounded-full" alt="Logo" />
        </Link>
      </div>
      <div className="flex h-full flex-col items-center">
        <div className="mx-4 flex w-full flex-col items-center gap-6 rounded-2xl bg-white p-12 text-center font-bold text-secondary sm:w-[440px]">
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
