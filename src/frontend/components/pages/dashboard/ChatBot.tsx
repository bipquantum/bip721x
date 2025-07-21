import { useRef, useState, useEffect } from "react";

import { AiPrompt, ChatElem } from "./types";
import ChatBox from "./ChatBox";
import { Principal } from "@dfinity/principal";
import { AnyEventObject } from "xstate";
import { AUTOMATIC_CHATBOT_TRANSITION } from "../../constants";
import { BiMicrophone } from "react-icons/bi";
import { IoArrowUp } from "react-icons/io5";
import AutoResizeTextarea, {
  AutoResizeTextareaHandle,
} from "../../common/AutoResizeTextArea";

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
  const inputRef = useRef<AutoResizeTextareaHandle>(null);
  const bottomRef = useRef<HTMLDivElement | null>(null);

  const [userInput, setUserInput] = useState("");
  const [isCalling, setIsCalling] = useState(false);

  const submitUserInput = () => {
    inputRef.current?.clear();
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
    <div className="relative flex w-full flex-grow flex-col justify-between overflow-y-auto">
      <div>
        <p className="font-momentum w-full pt-2 text-center text-xl font-extrabold uppercase text-black dark:text-white md:text-3xl">
          What can I help with?
        </p>
        <ChatBox
          chats={chats}
          sendEvent={sendEvent}
          aiPrompts={aiPrompts}
          principal={principal}
        />
      </div>
      <div className="flex w-full flex-col gap-2 px-2">
        <div className="relative flex w-full flex-row items-center gap-2">
          <div className="flex flex-1 items-center justify-between gap-2 rounded-2xl border bg-white px-3 py-[6px]">
            <AutoResizeTextarea
              ref={inputRef}
              placeholder={"What do you want to protect?"}
              onChange={(value) => {
                if (bottomRef.current) {
                  bottomRef.current.scrollIntoView({ behavior: "instant" });
                }
                setUserInput(value);
              }}
              disabled={isCalling}
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
              if (userInput) submitUserInput();
            }}
            disabled={isCalling}
            className="flex h-[36px] w-[36px] items-center justify-center self-end rounded-full bg-gray-200"
          >
            <IoArrowUp size={30} className="text-black" />
          </button>
        </div>
        <p ref={bottomRef} className="text-sm text-gray-500">
          BIPQuantum AI is here to assist, but always consult an IP lawyer to
          ensure accuracy.
        </p>
      </div>
    </div>
  );
};

export default ChatBot;
