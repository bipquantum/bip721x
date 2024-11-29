import { useState } from "react";
import EditSvg from "../../assets/edit.svg";
import TrashSvg from "../../assets/trash.svg";
import AddPlusSvg from "../../assets/add-plus.svg";
import AIBotImg from "../../assets/ai-bot.png";
import { Link, useLocation, useNavigate } from "react-router-dom";
import Modal from "../common/Modal";
import { useChatHistory } from "./ChatHistoryContext";

enum ChatAction {
  DELETE,
  RENAME,
}

type ActionCandidate = {
  chatId: string;
  action: ChatAction;
}

interface ChatHistoryBarProps {
  onChatSelected: (chatId: string) => void;
}

const ChatHistoryBar: React.FC<ChatHistoryBarProps> = ({ onChatSelected }) => {
  
  const { pathname } = useLocation();
  const navigate = useNavigate();
  
  const { chatHistories, addChat, deleteChat, renameChat } = useChatHistory();
  const [ actionCandidate, setActionCandidate ] = useState<ActionCandidate | undefined>();
  const [ chatName, setChatName ] = useState<string>("");

  const runAction = () => {
    if (actionCandidate === undefined) return;
    switch (actionCandidate.action) {
      case ChatAction.DELETE:
        deleteChat(actionCandidate.chatId);
        break;
      case ChatAction.RENAME:
        renameChat(actionCandidate.chatId, chatName);
        break;
    }
    setActionCandidate(undefined);
  };

  const newChat = () => {
    let chatId = addChat("New chat");
    navigate(`/chat/${chatId}`);
    onChatSelected(chatId);
  };

  const isCurrentChat = (chatId: string) => {
    return pathname.includes("/chat/" + chatId);
  }

  return (
    <div className="flex flex-col justify-between bg-primary text-white w-full">
      <div className="h-[70vh] sm:h-[90vh] overflow-auto px-2 py-4 w-full">
        <div className="flex flex-row space-x-2 cursor-pointer items-center justify-center text-lg font-bold w-full">
          <img src={AIBotImg} className={`h-10 rounded-full`} />
        </div>
        {chatHistories.map((chat) => (
          <div
            className={`mt-4 grid grid-cols-5 items-center justify-between w-full px-4 ${isCurrentChat(chat.id) ? "font-bold" : ""}`}
            key={chat.id}
          >
            <Link className="break-words text-wrap col-span-4" to={"/chat/" + chat.id} onClick={(e) => onChatSelected(chat.id)}>{ chat.name }</Link>
            <div className="flex items-center gap-x-2 col-span-1">
              <img 
                src={EditSvg}
                className={`cursor-pointer invert ${isCurrentChat(chat.id) ? "h-6" : "h-5"}`} 
                alt="Edit" 
                onClick={(e) => { setChatName(chat.name); setActionCandidate( { chatId: chat.id, action: ChatAction.RENAME } ); }}
              />
              <img
                src={TrashSvg}
                className={`cursor-pointer invert ${isCurrentChat(chat.id) ? "h-6" : "h-5"}`}
                alt="Trash"
                onClick={() => setActionCandidate( { chatId: chat.id, action: ChatAction.DELETE } )}
              />
            </div>
          </div>
        ))}
        <Modal
          isVisible={actionCandidate !== undefined}
          onClose={() => { setActionCandidate(undefined); }}
        >
          {
            actionCandidate?.action === ChatAction.RENAME &&
            <div>
              <p className="pb-5">Rename chatbot history?</p>
              <textarea
                className="w-full rounded-xl p-2 bg-gray-200"
                onMouseDown={(e) => e.stopPropagation()}
                value={chatName}
                onChange={(e) => setChatName(e.target.value)}
              />
            </div>
          }
          {
            actionCandidate?.action === ChatAction.DELETE &&
            <div>
              <p className="pb-5">Remove chatbot history?</p>
            </div>
          }
          <div className="flex w-full justify-center gap-4">
            <button
              className="w-1/3 rounded-xl bg-gray-600 text-white"
              onClick={() => { setActionCandidate(undefined); }}
            >
              No
            </button>
            <button
              className="w-1/3 rounded-xl bg-secondary text-white"
              onClick={ runAction }
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
