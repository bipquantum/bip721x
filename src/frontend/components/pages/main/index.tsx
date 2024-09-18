import { useEffect } from "react";
import { toast } from "react-toastify";
import { useAuth } from "@ic-reactor/react";
import { Link, useNavigate } from "react-router-dom";

import LogoSvg from "../../../assets/logo.png";
import MenuSvg from "../../../assets/menu.svg";
import ProfileSvg from "../../../assets/profile.png";
import { backendActor } from "../../actors/BackendActor";

const Main = () => {
  const navigate = useNavigate();

  const { authenticated, identity } = useAuth({});

  if (!authenticated || !identity) {
    return <></>;
  }

  const { data: queriedUser } = backendActor.useQueryCall({
    functionName: "get_user",
    args: [identity?.getPrincipal()],
  });

  useEffect(() => {
    if (queriedUser?.length === 0) {
      navigate("/profile");
      toast.warn("Please add user");
    }
  }, [queriedUser]);

  return (
    <div className="flex h-full w-full items-center justify-center overflow-auto bg-primary text-lg text-white">
      <div className="absolute top-0 w-full">
        <div className="flex items-center justify-between py-8 pr-4 sm:p-16">
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
            Bessie Cooper
            <img src={ProfileSvg} className="h-10 rounded-full" alt="Logo" />
          </Link>
        </div>
      </div>
      <div className="mx-4 flex h-[188px] w-full flex-col items-center justify-center rounded-2xl bg-white px-8 font-bold text-white sm:w-[414px]">
        <button className="w-full rounded-2xl bg-secondary py-2 text-center">
          AI Assisted
        </button>
        <Link to={"/dashboard"} className="w-full">
          <button className="mt-6 w-full rounded-2xl border-[2px] border-secondary bg-white py-2 text-center text-secondary">
            Manual
          </button>
        </Link>
      </div>
    </div>
  );
};

export default Main;
