import { useEffect } from "react";
import { toast } from "react-toastify";
import { useAuth } from "@ic-reactor/react";
import { Link, useNavigate } from "react-router-dom";

import Logo from "../../../assets/logo.png";
import Profile from "../../../assets/profile.png";
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
    <div className="dark:bg-primary flex h-full w-full items-center justify-center overflow-auto bg-white text-lg text-black dark:text-white">
      <div className="absolute top-0 w-full">
        <div className="flex items-center justify-between p-16">
          <img src={Logo} className="h-14 dark:invert" alt="Logo" />
          <div className="flex items-center justify-center gap-x-16">
            <Link to={"/about"}>About</Link>
            <Link to={"/new"}>Add your Intellectual Property</Link>
            <Link to={"/store"}>Store</Link>
          </div>
          <Link to={"profile"} className="flex items-center gap-4">
            Bessie Cooper
            <img src={Profile} className="h-10 rounded-full" alt="Logo" />
          </Link>
        </div>
      </div>
      <div className="flex h-[188px] w-[414px] flex-col items-center justify-center rounded-2xl bg-white px-8 font-bold text-white">
        <button className="bg-secondary w-full rounded-2xl py-2 text-center">
          AI Assisted
        </button>
        <Link to={"/dashboard"} className="w-full">
          <button className="border-secondary text-secondary mt-8 w-full rounded-2xl border-[2px] bg-white py-2 text-center">
            Manual
          </button>
        </Link>
      </div>
    </div>
  );
};

export default Main;
