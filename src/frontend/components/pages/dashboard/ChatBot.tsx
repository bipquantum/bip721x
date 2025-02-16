import { useRef, useState, KeyboardEvent, useEffect } from "react";

import SearchSvg from "../../../assets/search.svg";
import SendMessageSvg from "../../../assets/send-message.svg";
import { AiPrompt, ChatElem } from "./types";
import ChatBox from "./ChatBox";
import { Principal } from "@dfinity/principal";
import { AnyEventObject } from "xstate";
import { AUTOMATIC_CHATBOT_TRANSITION } from "../../constants";
import { BiMicrophone } from "react-icons/bi";
import { IoArrowUp } from "react-icons/io5";

interface ChatBotProps {
  principal: Principal | undefined;
  chats: ChatElem[];
  sendEvent: (event: AnyEventObject) => void;
  aiPrompts: Map<number, AiPrompt[]>;
  askAI: (question: string) => Promise<void>;
}

const ChatBot = ({
  principal,
  chats,
  sendEvent,
  aiPrompts,
  askAI,
}: ChatBotProps) => {
  const [userInput, setUserInput] = useState("");
  const [shiftPressed, setShiftPressed] = useState(false);
  const [isCalling, setIsCalling] = useState(false);
  const textAreaRef = useRef<HTMLTextAreaElement>(null);

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
  };

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
    <div className="flex overflow-y-auto h-[85vh] w-full flex-1 flex-col justify-between overflow-auto pb-[15px] relative">
      <div>
        <p className="w-full pt-2 text-center text-3xl font-extrabold uppercase dark:text-white text-black">
          What can I help with?
        </p>
        <ChatBox
          chats={chats}
          sendEvent={sendEvent}
          aiPrompts={aiPrompts}
          principal={principal}
        />
      </div>
      <div className="flex w-full flex-row items-center gap-4 px-4">
        <div className="flex flex-1 items-center justify-between gap-2 overflow-hidden rounded-2xl border px-3 bg-white">
          <textarea
            className="w-full resize-none border-none outline-none"
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
          <div className="flex h-[36px] w-[36px] items-center justify-center rounded-full bg-gray-200 px-1 text-black">
            <BiMicrophone size={34} />
          </div>
        </div>
          <button
            onClick={() => {
              if (userInput) submitUserInput();
            }}
            className="flex h-[48px] w-[48px] items-center justify-center rounded-full bg-gray-200"
          >
            <IoArrowUp size={40} className="text-black" />
          </button>
        {/* <div className="flex justify-end self-end text-sm">
          bIPQuantum AI is here to assist, but always consult an IP lawyer to
          ensure accuracy.
        </div> */}
      </div>
    </div>
  );
};

export default ChatBot;
