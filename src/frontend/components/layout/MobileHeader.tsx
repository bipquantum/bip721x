import LogoSvg from "../../assets/logo_beta.png";
import MessagesSvg from "../../assets/messages.svg";

import ChatHistoryBar from "./ChatHistoryBar";
import { ModalPopup } from "../common/ModalPopup";
import { useState } from "react";
import { useLocation } from "react-router-dom";

const MobileHeader = () => {

  const location = useLocation();
  const { pathname } = location;

  const [showChatHistory, setShowChatHistory] = useState(false);

  return (
    !pathname.includes("certificate") && <>
      <div className="flex h-16 min-h-16 w-full items-center justify-between bg-secondary pl-4 pr-8 sm:hidden">
          <img src={LogoSvg} className="h-14" alt="Logo" />
          <img src={MessagesSvg} className="h-8" alt="Messages" onClick={() => {}} />
      </div>
      <ModalPopup onClose={() => {setShowChatHistory(false)}} isOpen={showChatHistory}>
        <ChatHistoryBar onChatSelected={() => setShowChatHistory(false)}/>
      </ModalPopup>
    </>
  );
};

export default MobileHeader;
