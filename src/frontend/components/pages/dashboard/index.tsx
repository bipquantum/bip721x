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
    <div className="flex h-full flex-col items-center justify-center bg-white px-4 text-primary-text sm:px-16">
      <div className="flex flex-col items-center gap-2 py-4 text-center text-2xl font-bold tracking-wider sm:py-16 sm:text-start sm:text-[32px]">
        Meet bIPQuantum Your Intellectual Property Guardian.
      </div>
      <div className="grid grid-cols-2 items-start justify-start gap-6 text-center text-lg font-bold leading-6 text-white">
        {
          CALL_TO_ACTIONS.map((action, index) => (
            <button 
              key={index} 
              className="flex h-32 max-w-60 items-center justify-center rounded-2xl bg-secondary px-4 hover:cursor-pointer hover:bg-blue-800" 
              onClick={() => newChat(action)}>
              {action}
            </button>
          ))
        }
      </div>
    </div>
  );
}

export default Dashboard;
