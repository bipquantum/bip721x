import { useNavigate } from "react-router-dom";
import { useChatHistory } from "../../layout/ChatHistoryContext";
import { CALL_TO_ACTIONS } from "../../constants";

import { BiMicrophone } from "react-icons/bi";
import { IoArrowUp } from "react-icons/io5";

const Dashboard = () => {
  const { addChat } = useChatHistory();

  const navigate = useNavigate();

  const newChat = (name: string) => {
    const newChatId = addChat(name);
    navigate(`/chat/${newChatId}`);
  };

  return (
    <div className="text-primary-text flex h-full w-full flex-col items-center justify-between bg-background px-4 pb-[15px] dark:bg-background-dark">
      <div className="mx-auto w-full">
        <div className="flex flex-col items-center gap-2 py-4 sm:py-8">
          <p className="font-momentum text-center text-lg font-extrabold uppercase text-black dark:text-white sm:text-2xl">
            Meet BIPQuantum Your Intellectual Property Guardian.
          </p>
        </div>
        <div className="mx-auto grid w-fit grid-cols-1 items-center gap-4 text-center text-white sm:grid-cols-3">
          <button
            className="w-fit text-nowrap rounded-full bg-gradient-to-t from-primary to-secondary px-4 py-3 text-xs uppercase md:text-sm"
            onClick={() => newChat(CALL_TO_ACTIONS[0])}
          >
            {CALL_TO_ACTIONS[0]}
          </button>

          <button
            className="w-fit text-nowrap rounded-full bg-gradient-to-t from-primary to-secondary px-4 py-3 text-xs uppercase md:text-sm"
            onClick={() => newChat(CALL_TO_ACTIONS[1])}
          >
            {CALL_TO_ACTIONS[1]}
          </button>

          <button
            className="w-fit text-nowrap rounded-full bg-gradient-to-t from-primary to-secondary px-4 py-3 text-xs uppercase md:text-sm"
            onClick={() => newChat(CALL_TO_ACTIONS[2])}
          >
            {CALL_TO_ACTIONS[2]}
          </button>

          <button
            className="col-span-1 mx-auto w-fit rounded-full bg-gradient-to-t from-primary to-secondary px-4 py-3 text-xs uppercase md:col-span-3 md:text-nowrap md:text-sm"
            onClick={() => newChat(CALL_TO_ACTIONS[3])}
          >
            {CALL_TO_ACTIONS[3]}
          </button>
        </div>
      </div>
      <div className="flex w-full flex-col gap-2 md:pb-[30px] pb-[60px]">
        <div className="flex w-full flex-row items-center gap-4">
          <div className="flex flex-1 items-center justify-between gap-2 overflow-hidden rounded-2xl border bg-white px-3">
            <textarea
              name=""
              id=""
              placeholder="What do you want to protect?"
              className="h-[48px] w-full resize-none border-none pt-[8px] text-xs leading-none outline-none sm:text-base"
            ></textarea>
            <div className="flex h-[36px] w-[36px] items-center justify-center rounded-full bg-gray-200 px-1">
              <BiMicrophone size={34} />
            </div>
          </div>
          <div className="flex h-[48px] w-[48px] items-center justify-center rounded-full bg-gray-200">
            <IoArrowUp size={40} />
          </div>
        </div>
        <p className="text-sm text-gray-500">
          BIPQuantum AI is here to assist, but always consult an IP lawyer to
          ensure accuracy.
        </p>
      </div>
    </div>
  );
};

export default Dashboard;
