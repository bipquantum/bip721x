import { useNavigate } from "react-router-dom";
import { useChatHistory } from "../../layout/ChatHistoryContext";
import { CALL_TO_ACTIONS } from "../../constants";

const Dashboard = () => {
  const { addChat } = useChatHistory();

  const navigate = useNavigate();

  const newChat = (name: string) => {
    const newChatId = addChat(name);
    navigate(`/chat/${newChatId}`);
  };

  return (
    <div className="text-primary-text flex flex-grow w-full flex-col items-center justify-between">
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
    </div>
  );
};

export default Dashboard;
