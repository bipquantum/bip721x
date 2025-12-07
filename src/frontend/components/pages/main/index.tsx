import { Link, useNavigate } from "react-router-dom";
import { v4 as uuidv4 } from "uuid";

import { useChatHistory } from "../../layout/ChatHistoryContext";
import { useAuth } from "@nfid/identitykit/react";

const Main = () => {

  const { user } = useAuth();

  const { addChat } = useChatHistory();

  const navigate = useNavigate();

  const newChat = (name: string) => {
    const newChatId = uuidv4();
    addChat({id: newChatId, name});
    navigate(`/chat/${newChatId}`);
  };

  if (!user) {
    return <div>User not logged</div>;
  }

  return (
    <div className="flex h-full w-full flex-col items-center justify-center self-center overflow-auto bg-background text-lg text-black dark:bg-background-dark dark:text-white">
      <div className="text-primary-text flex flex-col items-center justify-center gap-6 rounded-[40px] border border-primary bg-white/20 px-[38px] py-[25px] shadow-lg shadow-secondary/20 backdrop-blur-[10px] sm:px-[72px] sm:py-[55px]">
        <p className="font-momentum text-center text-xl font-extrabold uppercase">
          Create New IP
        </p>
        <div className="flex flex-col gap-[10px]">
          <button
            className="w-full text-nowrap rounded-full bg-gradient-to-t from-primary to-secondary px-4 py-3 text-center text-base uppercase text-white hover:cursor-pointer hover:bg-blue-800"
            onClick={() => newChat("New chat")}
          >
            AI-Assisted IP Creation
          </button>
          <Link
            to={"/new"}
            className="w-full text-nowrap rounded-full bg-gradient-to-t from-primary to-secondary px-4 py-3 text-center text-base uppercase text-white hover:cursor-pointer hover:bg-blue-800"
          >
            Manual IP Creation
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Main;
