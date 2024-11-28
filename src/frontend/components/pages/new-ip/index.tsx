import { useState } from "react";
import { Principal } from "@dfinity/principal";

import NewIP from "./NewIp";
import { useNavigate } from "react-router-dom";
import { useChatHistory } from "../../layout/ChatHistoryContext";

interface NewIPButtonProps {
  principal: Principal | undefined;
}

const NewIPButton: React.FC<NewIPButtonProps> = ({ principal }) => {

  const navigate = useNavigate();

  const { addChat } = useChatHistory();
  
  const [createIp, setCreateIp] = useState<boolean>(false);

  const newChat = (name: string) => {
    const newChatId = addChat(name);
    navigate(`/chat/${newChatId}`);
  };

  const onIpCreated = (ipId: bigint | undefined) => {
    setCreateIp(false);
    if (ipId) {
      navigate(`/bip/${ipId}`);
    }
  };

  return (
    <div
      className={`flex w-full flex-1 flex-col items-center justify-center gap-4 bg-white`}
    >
      { !createIp ? (
        <div className="flex flex-col items-center justify-center gap-6 text-primary-text">
          <p className="flex flex-col items-center gap-2 py-4 text-center text-xl font-bold tracking-wider sm:text-start sm:text-[24px]">IP Creation Option</p>
          <button
            className="w-full max-w-[400px] rounded-2xl bg-secondary py-3 text-lg font-semibold text-white transition hover:bg-secondary-dark px-4 py-2"
            onClick={() => newChat("New chat")}
          >
            AI-Assisted IP Creation
          </button>
          <button
            className="w-full max-w-[400px] rounded-2xl bg-secondary py-3 text-lg font-semibold text-white transition hover:bg-secondary-dark px-4 py-2"
            onClick={() => setCreateIp(true)}
          >
            Manual IP Creation
          </button>
        </div>
        ) : <NewIP principal={principal} isOpen={createIp} onClose={onIpCreated}/>
      }
    </div>
  );
};

export default NewIPButton;
