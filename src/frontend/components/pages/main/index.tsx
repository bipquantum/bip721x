import { useAuth } from "@ic-reactor/react";
import { Link, useNavigate } from "react-router-dom";

import LogoSvg from "../../../assets/logo_beta.png";
import ProfileSvg from "../../../assets/profile.png";
import { backendActor } from "../../actors/BackendActor";
import { NEW_USER_NICKNAME } from "../../constants";
import { useChatHistory } from "../../layout/ChatHistoryContext";

const Main = () => {

  const { authenticated, identity } = useAuth({});

  if (!authenticated || !identity) {
    return <></>;
  }

  const { addChat } = useChatHistory();

  const navigate = useNavigate();

  const newChat = (name: string) => {
    const newChatId = addChat(name);
    navigate(`/chat/${newChatId}`);
  };

  const { data: queriedUser } = backendActor.useQueryCall({
    functionName: "get_user",
    args: [identity?.getPrincipal()],
  });

  return (
    <div className="flex h-full w-full flex-col items-center justify-start overflow-auto bg-primary text-lg text-white">
      <div className="flex w-full items-center justify-between py-8 pr-4 sm:p-16">
        <Link to={"/"} className="hidden sm:flex">
          <img src={LogoSvg} className="h-14" alt="Logo" />
        </Link>
        <div className="hidden items-center justify-center gap-x-16 sm:flex">
          <Link to={"/about"}>About</Link>
          <Link to={"/new"}>Add your Intellectual Property</Link>
          <Link to={"/marketplace"}>Market place</Link>
        </div>
        <Link to={"profile"} className="hidden items-center gap-4 sm:flex">
          { queriedUser?.length === 0 ? NEW_USER_NICKNAME : queriedUser?.[0]?.nickName }
          <img src={ProfileSvg} className="h-10 rounded-full" alt="Profile" />
        </Link>
      </div>
      <div className="flex h-full flex-col items-center">
        <div className="mx-4 flex w-full flex-col items-center gap-6 rounded-2xl bg-white p-12 text-center font-bold text-secondary sm:w-[440px]">
          <p className="w-full px-4">IP Creation Option</p>
          <button className="w-full rounded-2xl border-[2px] border-secondary bg-white py-2" onClick={() => newChat("New chat")}>
            AI-Assisted IP Creation
          </button>
          <Link to={"/new"} className="w-full rounded-2xl border-[2px] border-secondary bg-white py-2">
            Manual IP Creation
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Main;
