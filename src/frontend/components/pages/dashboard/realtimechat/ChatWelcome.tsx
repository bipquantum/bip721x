import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { BiMicrophone } from "react-icons/bi";
import { IoArrowUp } from "react-icons/io5";
import AutoResizeTextarea, {
  AutoResizeTextareaHandle,
} from "../../../common/AutoResizeTextArea";
import { useChatConnection } from "./ChatConnectionContext";
import ConnectionStatusIndicator from "./ConnectionStatusIndicator";

interface ChatWelcomeProps {
  chatId: string;
}

const ChatWelcome: React.FC<ChatWelcomeProps> = ({ chatId }) => {
  const [inputMessage, setInputMessage] = useState("");
  const inputRef = useRef<AutoResizeTextareaHandle>(null);
  const bottomRef = useRef<HTMLDivElement | null>(null);
  const navigate = useNavigate();
  const { initSession, connectionState } = useChatConnection();

  // Initialize chat history and connection when component mounts
  useEffect(() => {
    const initialize = async () => {

      // Initialize connection
      if (connectionState.status === "idle") {
        initSession();
      }
    };

    initialize();
  }, [chatId]);

  const handleSendMessage = () => {
    if (!inputMessage.trim()) return;

    // Navigate to the chat conversation with the initial question
    navigate(`/chat/${chatId}`, {
      state: { initialQuestion: inputMessage }
    });
  };

  return (
    <div className="relative flex w-full flex-grow flex-col justify-between overflow-y-auto">
      <div className="flex flex-grow flex-col items-center justify-center gap-8 px-4">
        <p className="font-momentum text-center text-3xl font-extrabold uppercase text-black dark:text-white md:text-4xl">
          What can I help with?
        </p>

        {/* Chat Input - Centered */}
        <div className="w-full max-w-2xl">
          <div className="flex w-full flex-col gap-2">
            <div className="relative flex w-full flex-row items-center gap-2">
              <ConnectionStatusIndicator />
              <div className="flex flex-1 items-center justify-between gap-2 rounded-2xl border bg-white px-3 py-[6px]">
                <AutoResizeTextarea
                  ref={inputRef}
                  placeholder="What do you want to protect?"
                  onChange={(value) => {
                    if (bottomRef.current) {
                      bottomRef.current.scrollIntoView({ behavior: "instant" });
                    }
                    setInputMessage(value);
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      if (inputMessage.trim()) {
                        handleSendMessage();
                      }
                    }
                  }}
                />
              </div>
              <div className="group flex h-[36px] w-[36px] items-center justify-center self-end rounded-full bg-gray-200 px-1 text-black">
                <BiMicrophone size={35} color="gray" />
                <span className="absolute z-50 hidden w-max items-center rounded bg-black px-2 py-1 text-sm text-white opacity-75 group-hover:flex">
                  Coming Soon!
                </span>
              </div>
              <button
                onClick={() => {
                  if (inputMessage) handleSendMessage();
                }}
                disabled={!inputMessage.trim()}
                className="flex h-[36px] w-[36px] items-center justify-center self-end rounded-full bg-gray-200 disabled:opacity-50"
              >
                <IoArrowUp size={30} className="text-black" />
              </button>
            </div>
            <p ref={bottomRef} className="text-center text-sm text-gray-500">
              BIPQuantum AI is here to assist, but always consult an IP lawyer to ensure accuracy.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatWelcome;
