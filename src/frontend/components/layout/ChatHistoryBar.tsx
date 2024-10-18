import { useState } from "react";
import EditSvg from "../../assets/edit.svg";
import TrashSvg from "../../assets/trash.svg";
import AddPlusSvg from "../../assets/add-plus.svg";
import LogoSvg from "../../assets/logo.png";
import { Link, useLocation, useNavigate } from "react-router-dom";
import Modal from "../common/Modal";
import { useChatHistory } from "./ChatHistoryContext";

const ChatHistoryBar = () => {
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
    navigate(`/chat/${addChat()}`);
  };

  return (
    <div
      className={`hidden h-full w-64 overflow-auto bg-primary text-white transition-all duration-200 ${pathname.includes("/bip") || pathname === "/about" ? "sm:hidden" : "sm:block"}`}
    >
      <div className="flex flex-col justify-between">
        <div className="h-[90vh] overflow-auto px-2 py-4">
          <div className="flex cursor-pointer items-center justify-center">
            <Link to={"/"}>
              <img src={LogoSvg} className="h-14 invert" alt="Logo" />
            </Link>
          </div>
          {chatHistories.map((chatId) => (
            <div
              className="mt-4 flex items-center justify-between px-4"
              key={chatId}
            >
              <Link to={"/chat/" + chatId}>{chatId.toString()}</Link>
              <div className="flex items-center gap-x-2">
                <img src={EditSvg} className="h-5 cursor-pointer invert" alt="Edit" />
                <img
                  src={TrashSvg}
                  className="h-5 cursor-pointer invert"
                  alt="Trash"
                  onClick={() => setDeleteCandidate(chatId)}
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
    </div>
  );
};

export default ChatHistoryBar;
