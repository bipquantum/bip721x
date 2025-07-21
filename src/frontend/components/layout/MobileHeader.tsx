import { useState } from "react";
import { useLocation } from "react-router-dom";

const MobileHeader = () => {
  const location = useLocation();
  const { pathname } = location;

  const [showChatHistory, setShowChatHistory] = useState(false);

  return !pathname.includes("certificate") && <></>;
};

export default MobileHeader;
