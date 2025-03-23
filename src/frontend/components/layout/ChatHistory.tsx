import React, { useState } from "react";
import { useLocation } from "react-router-dom";
import ChatHistoryBar from "./ChatHistoryBar";
import { ModalPopup } from "../common/ModalPopup";

const ChatHistory = () => {
  const location = useLocation();
  const { pathname } = location;
  const [showChatHistory, setShowChatHistory] = useState(false);
  const hideHistoryBar = () => {
    return (
      pathname.includes("/marketplace") ||
      pathname.includes("/bips") ||
      pathname.includes("/bip/") ||
      pathname.includes("/profile") ||
      pathname.includes("/new") ||
      pathname.includes("/poll") ||
      pathname.includes("/view") ||
      pathname.includes("/login") ||
      pathname.includes("/about")
    );
  };
  return (
    <div>
      <div
        className={`mx-[20px] hidden h-[80vh] w-64 overflow-auto rounded-[40px] bg-white text-black transition-all duration-200 dark:bg-background-dark dark:text-white ${hideHistoryBar() ? "sm:hidden" : "sm:block"}`}
      >
        <ChatHistoryBar onChatSelected={() => {}} />
      </div>
      <ModalPopup
        onClose={() => {
          setShowChatHistory(false);
        }}
        isOpen={showChatHistory}
        onConfirm={() => {
          setShowChatHistory(false);
        }}
      >
        <ChatHistoryBar onChatSelected={() => setShowChatHistory(false)} />
      </ModalPopup>
    </div>
  );
};

export default ChatHistory;
