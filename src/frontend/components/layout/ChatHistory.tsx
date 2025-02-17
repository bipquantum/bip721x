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
      pathname == "/" ||
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
        className={`hidden h-[80vh] mx-[20px] rounded-[40px] w-64 overflow-auto bg-white dark:bg-background-dark text-black dark:text-white transition-all duration-200 ${hideHistoryBar() ? "sm:hidden" : "sm:block"}`}
      >
        <ChatHistoryBar onChatSelected={() => {}} />
      </div>
      <ModalPopup
        onClose={() => {
          setShowChatHistory(false);
        }}
        isOpen={showChatHistory}
      >
        <ChatHistoryBar onChatSelected={() => setShowChatHistory(false)} />
      </ModalPopup>
    </div>
  );
};

export default ChatHistory;
