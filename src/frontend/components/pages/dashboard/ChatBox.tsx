import SpinnerSvg from "../../../assets/spinner.svg";
import { ChatElem, AiPrompt } from "./types";
import AiBot from "../../../assets/ai-bot.png";

import { useEffect, useRef } from "react";
import { Principal } from "@dfinity/principal";
import Markdown from "react-markdown";
import CopyIcon from "../../common/CopyIcon";
import UserImage from "../../common/UserImage";

const MARKDOWN_COMPONENTS = {
  h1: ({ node, ...props }: any) => (
    <h1 className="text-xl font-bold sm:text-2xl" {...props} />
  ),
  h2: ({ node, ...props }: any) => (
    <h2 className="text-lg font-semibold sm:text-xl" {...props} />
  ),
  h3: ({ node, ...props }: any) => (
    <h3 className="text-md font-medium sm:text-lg" {...props} />
  ),
};

interface ChatBoxProps {
  principal: Principal | undefined;
  chats: ChatElem[];
  aiPrompts: Map<number, AiPrompt[]>;
}

const ChatBox: React.FC<ChatBoxProps> = ({
  principal,
  chats,
  aiPrompts,
}) => {
  
  const messagesContainerRef = useRef<HTMLDivElement | null>(null);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [chats]);

  return (
    <div
      className="flex h-full w-full flex-col overflow-y-auto px-4 py-2 text-sm leading-normal sm:text-lg sm:leading-relaxed"
      ref={messagesContainerRef}
    >
      {chats.map((chat, elem_index) => (
        <div key={elem_index} className="flex flex-col">
          {aiPrompts.get(elem_index)?.map((prompt, prompt_index) => (
            <div key={prompt_index} className="flex flex-col">
              <div className="flex flex-row justify-end gap-2 py-2">
                <span className="flex flex-col px-5"> {/* spacer */} </span>
                <div className="markdown-link flex items-center rounded-xl bg-white px-3 py-0 text-black sm:px-4 sm:py-2">
                  {prompt.question}
                </div>
                <UserImage principal={principal} />
              </div>
              <div className="flex flex-row gap-2 py-2">
                <img src={AiBot} className={`h-10 rounded-full`} />
                <div className="items-center-xl markdown-link flex flex-col gap-3 rounded-xl bg-white px-3 py-2 text-black sm:px-4 sm:py-2">
                  {prompt.answer === undefined ? (
                    <img
                      src={SpinnerSvg}
                      className="dark:invert"
                      alt="Loading..."
                    />
                  ) : (
                    <>
                      <Markdown components={MARKDOWN_COMPONENTS}>
                        {prompt.answer}
                      </Markdown>
                      <div
                        className="mb-2 mt-1 h-5 w-5 cursor-pointer self-end sm:mb-1 sm:mt-0 sm:h-6 sm:w-6"
                        onClick={() =>
                          navigator.clipboard.writeText(chat.question)
                        }
                      >
                        <CopyIcon className="text-gray-700 hover:text-black" />
                      </div>
                    </>
                  )}
                </div>
                <span className="flex flex-col px-5"> {/* spacer */} </span>
              </div>
            </div>
          ))}
        </div>
      ))}
      <div ref={messagesEndRef}></div>
    </div>
  );
};

export default ChatBox;
