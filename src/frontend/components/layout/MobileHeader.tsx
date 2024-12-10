import LogoSvg from "../../assets/logo.png";
import MessagesSvg from "../../assets/messages.svg";

import ChatHistoryBar from "./ChatHistoryBar";
import { ModalPopup } from "../common/ModalPopup";
import { useState } from "react";

const MobileHeader = () => {

  const [showChatHistory, setShowChatHistory] = useState(false);

  return (
    <>
      <div className="flex h-16 min-h-16 w-full items-center justify-between bg-secondary pl-4 pr-8 sm:hidden">
          <img src={LogoSvg} className="h-14 invert" alt="Logo" />
          <img src={MessagesSvg} className="h-8" alt="Logo" onClick={() => {}} />
      </div>
      <ModalPopup onClose={() => {setShowChatHistory(false)}} isOpen={showChatHistory}>
        <ChatHistoryBar onChatSelected={() => setShowChatHistory(false)}/>
      </ModalPopup>
    </>
  );
};

export default MobileHeader;
