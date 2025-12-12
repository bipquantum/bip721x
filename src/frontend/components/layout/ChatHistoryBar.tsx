import { useState, useEffect, useRef } from "react";
import AddPlusSvg from "../../assets/add-plus.svg";
import { Link, useLocation, useNavigate } from "react-router-dom";
import Modal from "../common/Modal";
import { useChatHistory } from "./ChatHistoryContext";
import { v4 as uuidv4 } from "uuid";

import { HiOutlineTrash } from "react-icons/hi2";
import { TbPencil } from "react-icons/tb";
import { TbDots } from "react-icons/tb";
import { useAuthToken } from "../pages/chatbot/AuthTokenContext";

enum ChatAction {
  DELETE,
  RENAME,
}

type ActionCandidate = {
  chatId: string;
  action: ChatAction;
};

interface ChatHistoryBarProps {
  className?: string;
  onChatSelected: (chatId: string) => void;
}

const ChatHistoryBar: React.FC<ChatHistoryBarProps> = ({
  className,
  onChatSelected,
}) => {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const { authToken, refreshAuthToken } = useAuthToken();

  const [settingOpen, setSettingOpen] = useState<string | undefined>();
  const settingsRef = useRef<HTMLDivElement>(null);

  const { chatHistories, addChat, deleteChat, renameChat } = useChatHistory();
  const [actionCandidate, setActionCandidate] = useState<ActionCandidate | undefined>();
  const [chatName, setChatName] = useState<string>("");

  useEffect(() => {
    console.log("Chat histories updated:", chatHistories.length);
  }, [chatHistories]);

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
    const chatId = uuidv4();
    addChat({id: chatId, name: new Date().toLocaleString()});
    navigate(`/chat/${chatId}`);
    onChatSelectedExtended(chatId);
  };

  const onChatSelectedExtended = (chatId: string) => {
    if (authToken === undefined) {
      refreshAuthToken();
    };
    onChatSelected(chatId);
  }

  const isCurrentChat = (chatId: string) => {
    return pathname.includes("/chat/" + chatId);
  };

  const handleSetting = (chatId: string) => {
    if (settingOpen === chatId) {
      setSettingOpen(undefined);
      return;
    }
    setSettingOpen(chatId);
  };

  // Handle click outside to close settings dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (settingsRef.current && !settingsRef.current.contains(event.target as Node)) {
        setSettingOpen(undefined);
      }
    };

    if (settingOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [settingOpen]);

  return (
    <div
      className={
        className ??
        "flex w-full flex-col justify-between bg-white/20 text-black dark:text-white"
      }
    >
      <div className="h-[70dvh] w-full overflow-auto px-4 py-6">
        <div className="flex flex-row items-center justify-between">
          <p className="text-xl font-bold">Chat History</p>
        </div>
        <div className="pt-4">
          {[...chatHistories].reverse().map((chat) => (
            <div
              className={`flex w-full flex-row items-center justify-between ${isCurrentChat(chat.id) ? "font-bold" : ""}`}
              key={chat.id}
            >
              <Link
                className="col-span-4 text-wrap break-words text-[16px]"
                to={"/chat/" + chat.id}
                onClick={
                  (e) => onChatSelectedExtended(chat.id)
                }
              >
                {chat.name}
              </Link>
              <div className="relative flex h-fit w-fit items-center justify-center" ref={settingOpen === chat.id ? settingsRef : null}>
                <button onClick={(e) => handleSetting(chat.id)}>
                  <TbDots className="h-fit w-fit p-1" />
                </button>
                <div
                  className={`absolute right-[0%] top-[80%] z-[50] h-[100px] w-[120px] flex-col justify-center gap-2 rounded-[20px] border bg-[#eee] dark:bg-[#2f2f2f] ${settingOpen === chat.id ? "flex" : "hidden"}`}
                >
                  <div
                    onClick={(e) => {
                      setChatName(chat.name);
                      setActionCandidate({
                        chatId: chat.id,
                        action: ChatAction.RENAME,
                      });
                    }}
                    className="flex cursor-pointer flex-row items-center gap-2 px-5 text-black dark:text-white"
                  >
                    <TbPencil className={`size-[18px]`} />
                    <p className="text-sm">Rename</p>
                  </div>
                  <div
                    onClick={() =>
                      setActionCandidate({
                        chatId: chat.id,
                        action: ChatAction.DELETE,
                      })
                    }
                    className="flex cursor-pointer flex-row items-center gap-2 px-5"
                  >
                    <HiOutlineTrash color="#ef4444" className={`size-[18px]`} />
                    <p className="text-sm text-red-500">Delete</p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
        <Modal
          isVisible={actionCandidate !== undefined}
          onClose={() => {
            setActionCandidate(undefined);
          }}
        >
          {actionCandidate?.action === ChatAction.RENAME && (
            <div>
              <p className="pb-5 dark:text-white">Rename chatbot history?</p>
              <textarea
                className="w-full rounded-xl bg-gray-200 p-2"
                onMouseDown={(e) => e.stopPropagation()}
                value={chatName}
                onChange={(e) => setChatName(e.target.value)}
              />
            </div>
          )}
          {actionCandidate?.action === ChatAction.DELETE && (
            <div>
              <p className="pb-5 dark:text-white">Remove chatbot history?</p>
            </div>
          )}
          <div className="flex w-full justify-center gap-4">
            <button
              className="w-1/3 rounded-xl bg-background text-black dark:bg-gray-600 dark:text-white"
              onClick={() => {
                setActionCandidate(undefined);
              }}
            >
              No
            </button>
            <button
              className="w-1/3 rounded-xl bg-secondary text-black dark:text-white"
              onClick={runAction}
            >
              Yes
            </button>
          </div>
        </Modal>
      </div>
      <button
        className="flex h-[10dvh] w-full cursor-pointer flex-row items-center justify-center gap-2 text-black dark:text-white"
        onClick={newChat}
      >
        <img
          src={AddPlusSvg}
          className="h-5 cursor-pointer dark:invert"
          alt="Add new chat"
        />
        <span>Add new</span>
      </button>
    </div>
  );
};

export default ChatHistoryBar;
