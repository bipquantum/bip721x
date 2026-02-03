import { useState, useEffect, useRef } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import Modal from "../common/Modal";
import { useChatHistory } from "./ChatHistoryContext";

import { HiMiniPencilSquare, HiOutlineTrash } from "react-icons/hi2";
import { TbPencil } from "react-icons/tb";
import { TbDots } from "react-icons/tb";

enum ChatAction {
  DELETE,
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

  const [settingOpen, setSettingOpen] = useState<string | undefined>();
  const settingsRef = useRef<HTMLDivElement>(null);

  const { chatHistories, deleteChat, renameChat } = useChatHistory();
  const [actionCandidate, setActionCandidate] = useState<ActionCandidate | undefined>();

  // State for inline editing
  const [editingChatId, setEditingChatId] = useState<string | undefined>();
  const [editingChatName, setEditingChatName] = useState<string>("");
  const editInputRef = useRef<HTMLInputElement>(null);

  // Auto-focus and select text when editing starts
  useEffect(() => {
    if (editingChatId && editInputRef.current) {
      editInputRef.current.focus();
      editInputRef.current.select();
    }
  }, [editingChatId]);

  const startEditing = (chatId: string, currentName: string) => {
    setEditingChatId(chatId);
    setEditingChatName(currentName);
    setSettingOpen(undefined);
  };

  const saveEdit = () => {
    if (editingChatId && editingChatName.trim()) {
      renameChat(editingChatId, editingChatName.trim());
    }
    setEditingChatId(undefined);
    setEditingChatName("");
  };

  const cancelEdit = () => {
    setEditingChatId(undefined);
    setEditingChatName("");
  };

  const handleEditKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      saveEdit();
    } else if (e.key === "Escape") {
      e.preventDefault();
      cancelEdit();
    }
  };

  const runAction = () => {
    if (actionCandidate === undefined) return;
    switch (actionCandidate.action) {
      case ChatAction.DELETE:
        deleteChat(actionCandidate.chatId);
        break;
    }
    setActionCandidate(undefined);
  };

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
              {editingChatId === chat.id ? (
                <input
                  ref={editInputRef}
                  type="text"
                  value={editingChatName}
                  onChange={(e) => setEditingChatName(e.target.value)}
                  onBlur={saveEdit}
                  onKeyDown={handleEditKeyDown}
                  className="col-span-4 flex-1 rounded-md border border-gray-300 bg-white px-2 py-1 text-[16px] text-black focus:border-secondary focus:outline-none dark:border-gray-600 dark:bg-gray-800 dark:text-white"
                />
              ) : (
                <Link
                  className="col-span-4 text-wrap break-words text-[16px]"
                  to={"/chat/" + chat.id}
                  onClick={
                    (e) => onChatSelected(chat.id)
                  }
                >
                  {chat.name}
                </Link>
              )}
              <div className="relative flex h-fit w-fit items-center justify-center" ref={settingOpen === chat.id ? settingsRef : null}>
                <button onClick={(e) => handleSetting(chat.id)}>
                  <TbDots className="h-fit w-fit p-1" />
                </button>
                <div
                  className={`absolute right-[0%] top-[80%] z-[50] h-[100px] w-[120px] flex-col justify-center gap-2 rounded-[20px] border bg-[#eee] dark:bg-[#2f2f2f] ${settingOpen === chat.id ? "flex" : "hidden"}`}
                >
                  <div
                    onClick={(e) => {
                      startEditing(chat.id, chat.name);
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
        onClick={() => navigate(`/chat`)}
      >
        <HiMiniPencilSquare className="h-5 w-5" />
        <span>New chat</span>
      </button>
    </div>
  );
};

export default ChatHistoryBar;
