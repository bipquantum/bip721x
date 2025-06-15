import { useLocation } from "react-router-dom";
import ChatHistoryBar from "./ChatHistoryBar";

const ChatHistory = () => {
  const location = useLocation();
  const { pathname } = location;
  const hideHistoryBar = () => {
    return (
      pathname.includes("/marketplace") ||
      pathname.includes("/bips") ||
      pathname.includes("/bip/") ||
      pathname.includes("/profile") ||
      pathname.includes("/new") ||
      pathname.includes("/poll") ||
      pathname.includes("/view") ||
      pathname.includes("/login")
    );
  };
  return (
    <div>
      <div
        className={`mx-[20px] hidden h-[80dvh] w-64 overflow-auto rounded-[40px] bg-white text-black transition-all duration-200 dark:bg-background-dark dark:text-white ${hideHistoryBar() ? "sm:hidden" : "sm:block"}`}
      >
        <ChatHistoryBar onChatSelected={() => {}} />
      </div>
    </div>
  );
};

export default ChatHistory;
