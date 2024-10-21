import { useNavigate } from "react-router-dom";
import { useChatHistory } from "../../layout/ChatHistoryContext";

const Dashboard = () => {

  const { addChat } = useChatHistory();

  const navigate = useNavigate();

  const newChat = () => {
    const newChatId = addChat();
    navigate(`/chat/${newChatId}`);
  };

  return (
    <div className="flex h-full flex-col items-center justify-center bg-white px-4 text-primary-text sm:px-16">
      <div className="flex flex-col items-center gap-2 py-4 text-center text-2xl font-bold tracking-wider sm:py-16 sm:text-start sm:text-[32px]">
        Meet bIPQuantum Your Intellectual Property Guardian.
        <div className="h-1 w-32 bg-primary sm:w-96"></div>
      </div>
      <div className="grid grid-cols-2 items-start justify-start gap-8 text-center text-lg font-bold leading-6 text-white">
        <button className="flex h-36 w-36 items-center justify-center rounded-2xl bg-secondary px-4 hover:cursor-pointer hover:bg-blue-800" onClick={newChat}>
          IP Education/
          <br />
          Consultation
        </button>
        <button className="flex h-36 w-36 items-center justify-center rounded-2xl bg-secondary px-4 hover:cursor-pointer hover:bg-blue-800" onClick={newChat}>
          Generate a bIP Certificate
        </button>
        <button className="flex h-36 w-36 items-center justify-center rounded-2xl bg-secondary px-4 hover:cursor-pointer hover:bg-blue-800" onClick={newChat}>
          Organize IP Assets
        </button>
        <button className="flex h-36 w-36 items-center justify-center rounded-2xl bg-secondary px-4 hover:cursor-pointer hover:bg-blue-800" onClick={newChat}>
          Sell IP Assets on the bIPQuantum Store
        </button>
      </div>
    </div>
  );
}

export default Dashboard;
