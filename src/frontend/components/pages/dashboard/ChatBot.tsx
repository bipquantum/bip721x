import { useRef, useState, KeyboardEvent } from "react";

import SearchSvg from "../../../assets/search.svg";
import SendMessageSvg from "../../../assets/send-message.svg";
import { AiPrompt, ChatElem } from "./types";
import ChatBox from "./ChatBox";
import { Principal } from "@dfinity/principal";
import { AnyEventObject } from "xstate";

interface ChatBotProps {
  principal: Principal | undefined;
  chats: ChatElem[];
  sendEvent: (event: AnyEventObject) => void;
  aiPrompts: Map<number, AiPrompt[]>;
  askAI: (question: string) => Promise<void>;
};

const ChatBot = ({ principal, chats, sendEvent, aiPrompts, askAI }: ChatBotProps) => {

  const [userInput,    setUserInput   ] = useState("");
  const [shiftPressed, setShiftPressed] = useState(false);
  const [isCalling,    setIsCalling   ] = useState(false);
  const textAreaRef                     = useRef<HTMLTextAreaElement>(null);

  const handleEnterPress = async (
    event: KeyboardEvent<HTMLTextAreaElement>,
  ) => {
    if (shiftPressed) {
      setUserInput((prevPrompt) => prevPrompt + "\n");
    } else if (userInput) {
      submitUserInput();
    }
    event.preventDefault();
  };

  const submitUserInput = () => {
    if (userInput) {
      setIsCalling(true);
      askAI(userInput).then(() => {
        setIsCalling(false);
      });
      setUserInput("");
    }
  }

  return (
    <div className="flex h-full w-full flex-1 flex-col justify-between overflow-auto">
      <ChatBox chats={chats} sendEvent={sendEvent} aiPrompts={aiPrompts} principal={principal} />
      <div className="w-full bg-gray-300 p-6 sm:px-8 sm:py-10">
        <div className="flex h-full w-full items-center justify-between gap-4 rounded-md bg-white px-4">
          <textarea
            className="w-full text-lg outline-none sm:px-4"
            placeholder="What do you want to protect?"
            value={userInput}
            onChange={(e) => {
              setUserInput(e.target.value);
            }}
            onKeyDown={(event) =>
              event.key === "Shift" && setShiftPressed(true)
            }
            onKeyUp={(event) => event.key === "Shift" && setShiftPressed(false)}
            onKeyPress={async (event) => {
              event.key === "Enter" && (await handleEnterPress(event));
            }}
            ref={textAreaRef}
            disabled={isCalling}
          />
          <button
            onClick={() => {
              if (userInput) submitUserInput();
            }}
          >
            <img src={userInput ? SendMessageSvg : SearchSvg} className="h-10" />
          </button>
        </div>
      </div>
    </div>
  );
}

export default ChatBot;
