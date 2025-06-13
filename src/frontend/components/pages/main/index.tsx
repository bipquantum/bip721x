import { useAuth } from "@ic-reactor/react";
import { Link, useNavigate } from "react-router-dom";

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

  

  return (
    <div className="flex h-full w-full flex-col items-center justify-center overflow-auto bg-background dark:bg-background-dark text-lg dark:text-white text-black">
        <div className="bg-white/20 backdrop-blur-[10px] flex flex-col items-center justify-center gap-6 rounded-[40px] border border-primary  px-[38px] py-[25px] sm:px-[72px] sm:py-[55px] text-primary-text shadow-lg shadow-secondary/20">
          <p className="text-center text-xl font-momentum font-extrabold uppercase">Create New IP</p>
          <div className="flex flex-col gap-[10px]">
          <button className="w-full text-nowrap rounded-full bg-gradient-to-t from-primary to-secondary px-4 py-3 text-base text-center uppercase text-white hover:cursor-pointer hover:bg-blue-800" onClick={() => newChat("New chat")}>
            AI-Assisted IP Creation
          </button>
          <Link to={"/new"} className="w-full text-nowrap rounded-full bg-gradient-to-t from-primary to-secondary px-4 py-3 text-base text-center uppercase text-white hover:cursor-pointer hover:bg-blue-800">
            Manual IP Creation
          </Link>
          </div>
        </div>
      </div>
  );
};

export default Main;
