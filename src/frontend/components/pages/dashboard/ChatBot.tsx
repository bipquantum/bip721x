import { useRef, useState, KeyboardEvent, useEffect } from "react";

import SearchSvg from "../../../assets/search.svg";
import SendMessageSvg from "../../../assets/send-message.svg";
import { AiPrompt, ChatElem } from "./types";
import ChatBox from "./ChatBox";
import { Principal } from "@dfinity/principal";
import { AnyEventObject } from "xstate";
import { AUTOMATIC_CHATBOT_TRANSITION } from "../../constants";

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

  useEffect(() => {
    // TODO: fix very ugly way to automatically transition to the next chat
    if (Array.isArray(chats) && chats.length > 0) {
      const lastChat = chats[chats.length - 1]?.answers;
      if (Array.isArray(lastChat) && lastChat.length > 0) {
        const answer = lastChat[0];
        if (answer?.text === AUTOMATIC_CHATBOT_TRANSITION) {
          sendEvent({ type: answer.text });
        }
      }
    }
  }, [chats]);

  return (
    <div className="flex h-full w-full flex-1 flex-col justify-between overflow-auto">
      <ChatBox chats={chats} sendEvent={sendEvent} aiPrompts={aiPrompts} principal={principal} />
      <div className="w-full flex flex-col bg-gray-300 p-2 sm:px-8 sm:py-4">
        <div className="flex h-full w-full items-center justify-between gap-4 rounded-md bg-white px-4">
          <textarea
            className="w-full text-lg outline-none sm:px-4 min-h-20"
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
        <div className="flex self-end justify-end text-sm">
          bIPQuantum AI is here to assist, but always consult an IP lawyer to ensure accuracy.
        </div>
      </div>
    </div>
  );
}

export default ChatBot;
