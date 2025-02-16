import SpinnerSvg from "../../../assets/spinner.svg";
import { ChatElem, ChatAnswerState, AiPrompt } from "./types";
import NewIP from "../new-ip/NewIp";
import ProfileSvg from "../../../assets/profile.png";
import AIBotImg from "../../../assets/ai-bot.png";
import CopySvg from "../../../assets/copy.svg";

import { useEffect, useRef, useState } from "react";
import { Principal } from "@dfinity/principal";
import { AnyEventObject } from "xstate";
import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";
import CopyIcon from "../../common/CopyIcon";
import { AUTOMATIC_CHATBOT_TRANSITION } from "../../constants";

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
  sendEvent: (event: AnyEventObject) => void;
}

const ChatBox: React.FC<ChatBoxProps> = ({
  principal,
  chats,
  aiPrompts,
  sendEvent,
}) => {
  const messagesContainerRef = useRef<HTMLDivElement | null>(null);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  const [pendingPick, setPendingPick] = useState<number | undefined>(undefined);
  const [creatingIp, setCreatingIp] = useState<number | undefined>(undefined);

  const onIpCreated = (ipId: bigint | undefined) => {
    if (creatingIp === undefined) {
      throw new Error("No IP creation in progress");
    }
    if (ipId !== undefined) {
      transition(creatingIp, ipId.toString());
    }
    setCreatingIp(undefined);
  };

  const transition = (pickIndex: number, intPropId?: string) => {
    if (pendingPick === undefined) {
      throw new Error("No pending pick");
    }

    sendEvent({ type: chats[pendingPick].answers[pickIndex].text, intPropId });

    setPendingPick(undefined);
  };

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [chats]);

  useEffect(() => {
    if (chats.length > 0) {
      setPendingPick(chats.length - 1);
    }
  }, [chats]);

  return (
    <div
      className="flex h-full w-full flex-col gap-2 overflow-y-auto px-4 py-2 text-sm leading-normal sm:text-lg sm:leading-relaxed"
      ref={messagesContainerRef}
    >
      {chats.map((chat, elem_index) => (
        <div key={elem_index} className="flex flex-col">
          <div className="flex flex-row gap-2 py-2">
            {/* <img src={AIBotImg} className={`h-10 rounded-full`} /> */}
            <div className="markdown-link flex flex-col rounded-xl bg-white px-3 py-0 text-black sm:px-4 sm:py-2">
              <Markdown
                remarkPlugins={[remarkGfm]}
                components={MARKDOWN_COMPONENTS}
              >
                {chat.question}
              </Markdown>
              {
                // Add copy button for the knowledge base questions
                (chat.key === "expertLevel" ||
                  chat.key === "intermediateLevel" ||
                  chat.key === "beginnerLevel") && (
                  <div
                    className="mb-2 mt-1 h-5 w-5 cursor-pointer self-end sm:mb-1 sm:mt-0 sm:h-6 sm:w-6"
                    onClick={() => navigator.clipboard.writeText(chat.question)}
                  >
                    <CopyIcon className="text-gray-700 hover:text-black" />
                  </div>
                )
              }
            </div>
            <span className="flex flex-col px-5"> {/* spacer */} </span>
          </div>
          {
            // TODO: fix very ugly way to hide the automatic transition
            chat.answers.length === 1 &&
            chat.answers[0].text === AUTOMATIC_CHATBOT_TRANSITION ? (
              <></>
            ) : (
              <div className="flex flex-row flex-wrap justify-start gap-2 py-2">
                {/* { chat.answers.length > 0 && <img src={ProfileSvg} className="h-10 rounded-full" alt="Profile" />} */}
                {chat.answers.map((answer, answer_index) => (
                  <button
                    className={`h-10 rounded-full border border-gray-400 px-3 text-gray-400 sm:px-4 ${answer.state === ChatAnswerState.Unselectable || (answer.text === "US Copyright Certificate" && "bg-gray-400")} ${answer.state === ChatAnswerState.Selectable && answer.text !== "US Copyright Certificate" && "hover:bg-white hover:text-black"} ${answer.state === ChatAnswerState.Selected && answer.text !== "US Copyright Certificate" && "bg-white hover:text-white"} `}
                    // TODO: temporary solution to prevent the user from selecting the "US Copyright Certificate"
                    disabled={
                      answer.state !== ChatAnswerState.Selectable ||
                      answer.text === "US Copyright Certificate"
                    }
                    key={answer_index}
                    // TODO: have guards in the state machine to prevent code like this
                    onClick={() => {
                      answer.text === "bIP certificate"
                        ? setCreatingIp(answer_index)
                        : transition(answer_index);
                    }}
                  >
                    {answer.text.split("\n").map((line, i) => (
                      <span key={i}>
                        {line}
                        <br />
                      </span>
                    ))}
                  </button>
                ))}
                <span className="flex flex-col px-5"> {/* spacer */} </span>
              </div>
            )
          }
          {aiPrompts.get(elem_index)?.map((prompt, prompt_index) => (
            <div key={prompt_index} className="flex flex-col gap-2 pt-2">
              <div className="flex flex-row justify-end gap-2">
                <span className="flex flex-col px-5"> {/* spacer */} </span>
                <div className="markdown-link flex items-center rounded-xl bg-white px-3 py-0 text-black sm:px-4 sm:py-2">
                  {prompt.question}
                </div>
                <img src={ProfileSvg} className={`h-10 rounded-full`} />
              </div>
              <div className="flex flex-row gap-2">
                {/* <img src={AIBotImg} className={`h-10 rounded-full`} /> */}
                <div className="items-center-xl markdown-link flex rounded-xl bg-white px-3 py-2 text-black sm:px-4 sm:py-2">
                  {prompt.answer === undefined ? (
                    <img src={SpinnerSvg} alt="Loading..." />
                  ) : (
                    <Markdown components={MARKDOWN_COMPONENTS}>
                      {prompt.answer}
                    </Markdown>
                  )}
                </div>
                <span className="flex flex-col px-5"> {/* spacer */} </span>
              </div>
            </div>
          ))}
        </div>
      ))}
      <div ref={messagesEndRef}></div>
      <NewIP
        principal={principal}
        isOpen={creatingIp !== undefined}
        onClose={(ipId) => onIpCreated(ipId)}
      />
    </div>
  );
};

export default ChatBox;
