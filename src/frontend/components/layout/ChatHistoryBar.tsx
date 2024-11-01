import { useState } from "react";
import EditSvg from "../../assets/edit.svg";
import TrashSvg from "../../assets/trash.svg";
import AddPlusSvg from "../../assets/add-plus.svg";
import AIBotImg from "../../assets/ai-bot.png";
import { Link, useLocation, useNavigate } from "react-router-dom";
import Modal from "../common/Modal";
import { useChatHistory } from "./ChatHistoryContext";
import { formatDateTime, timeToDate } from "../../utils/conversions";

interface ChatHistoryBarProps {
  onChatSelected: (chatId: string) => void;
}

const ChatHistoryBar: React.FC<ChatHistoryBarProps> = ({ onChatSelected }) => {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const { chatHistories, addChat, deleteChat } = useChatHistory();
  const [deleteCandidate, setDeleteCandidate] = useState<string | undefined>();

  const deleteHistory = () => {
    if (deleteCandidate === undefined) return;
    deleteChat(deleteCandidate);
    setDeleteCandidate(undefined);
  };

  const newChat = () => {
    let chatId = addChat();
    navigate(`/chat/${chatId}`);
    onChatSelected(chatId);
  };

  const isCurrentChat = (chatId: string) => {
    return pathname.includes("/chat/" + chatId);
  }

  return (
    <div className="flex flex-col justify-between bg-primary text-white">
      <div className="h-[90vh] overflow-auto px-2 py-4">
        <div className="flex flex-row space-x-2 cursor-pointer items-center justify-center text-lg font-bold">
          <img src={AIBotImg} className={`h-10 rounded-full`} />
        </div>
        {chatHistories.map((chat) => (
          <div
            className={`mt-4 flex items-center justify-between px-4 ${isCurrentChat(chat.id) ? "font-bold" : ""}`}
            key={chat.id}
          >
            <Link to={"/chat/" + chat.id} onClick={(e) => onChatSelected(chat.id)}>{ formatDateTime(timeToDate(chat.date))}</Link>
            <div className="flex items-center gap-x-2">
              <img src={EditSvg} className={`cursor-pointer invert ${isCurrentChat(chat.id) ? "h-6" : "h-5"}`} alt="Edit" />
              <img
                src={TrashSvg}
                className={`cursor-pointer invert ${isCurrentChat(chat.id) ? "h-6" : "h-5"}`}
                alt="Trash"
                onClick={() => setDeleteCandidate(chat.id)}
              />
            </div>
          </div>
        ))}
        <Modal
          isVisible={deleteCandidate !== undefined}
          onClose={() => { setDeleteCandidate(undefined); }}
        >
          <p className="pb-5">Remove chatbot history?</p>
          <div className="flex w-full justify-center gap-4">
            <button
              className="w-1/3 rounded-xl bg-gray-600 text-white"
              onClick={() => { setDeleteCandidate(undefined); }}
            >
              No
            </button>
            <button
              className="w-1/3 rounded-xl bg-secondary text-white"
              onClick={deleteHistory}
            >
              Yes
            </button>
          </div>
        </Modal>
      </div>
      <button
        className="flex h-[10vh] w-full cursor-pointer items-center justify-center gap-4"
        onClick={newChat}
      >
        <img src={AddPlusSvg} className="h-5 cursor-pointer invert" alt="Edit" />
        Add new
      </button>
    </div>
  );
};

export default ChatHistoryBar;
