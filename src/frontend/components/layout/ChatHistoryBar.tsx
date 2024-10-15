import { useState } from "react";

import EditSvg from "../../assets/edit.svg";
import TrashSvg from "../../assets/trash.svg";
import AddPlusSvg from "../../assets/add-plus.svg";
import LogoSvg from "../../assets/logo.png";

import { Link, useLocation } from "react-router-dom";
import Modal from "../common/Modal";

interface ChatHistory {
  name: string;
  history: string[];
};

const ChatHistoryBar = () => {

  const { pathname } = useLocation();

  const [chatHistories, setChatHistories] = useState<ChatHistory[]>([
    { name: "Nft ai", history: [] },
    { name: "Nft ai", history: [] },
  ]);
  const [deleteCandidate, setDeleteCandidate] = useState<number | undefined>();

  const deleteHistory = () => {
    setChatHistories(chatHistories.filter((_, index) => index !== deleteCandidate));
  };

  const addHistory = (item: ChatHistory) => {
    setChatHistories([...chatHistories, item]);
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
          {chatHistories.map((item, index) => (
            <div
              className="mt-4 flex items-center justify-between px-4"
              key={index}
            >
              <Link to={"/chat/" + index}>{item.name}</Link>
              <div className="flex items-center gap-x-2">
                <img
                  src={EditSvg}
                  className="h-5 cursor-pointer invert"
                  alt="Edit"
                />
                <img
                  src={TrashSvg}
                  className="h-5 cursor-pointer invert"
                  alt="Trash"
                  onClick={() => {
                    setDeleteCandidate(index);
                  }}
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
                onClick={() => { deleteHistory(); setDeleteCandidate(undefined); }}
              >
                Yes
              </button>
            </div>
          </Modal>
        </div>
        <div
          className="flex h-[10vh] w-full cursor-pointer items-center justify-center gap-4"
          onClick={() => {}}
        >
          <img
            src={AddPlusSvg}
            className="h-5 cursor-pointer invert"
            alt="Edit"
          />
          Add new
        </div>
      </div>
    </div>
  );
};

export default ChatHistoryBar;
