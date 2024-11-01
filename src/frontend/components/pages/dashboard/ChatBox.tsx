import SpinnerSvg from "../../../assets/spinner.svg";
import { ChatElem, ChatAnswerState, AiPrompt} from "./types";
import NewIP from "../new-ip/NewIp";
import ProfileSvg from "../../../assets/profile.png";
import AIBotImg from "../../../assets/ai-bot.png";

import { useEffect, useRef, useState } from "react";
import { Principal } from "@dfinity/principal";
import { AnyEventObject } from "xstate";
import Markdown from "react-markdown";
import remarkGfm from 'remark-gfm';

interface ChatBoxProps {
  principal: Principal | undefined;
  chats: ChatElem[];
  aiPrompts: Map<number, AiPrompt[]>;
  sendEvent: (event: AnyEventObject) => void;
}

const ChatBox: React.FC<ChatBoxProps> = ({ principal, chats, aiPrompts, sendEvent }) => {
  
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
  }

  const transition = (pickIndex: number, intPropId?: string) => {
    
    if (pendingPick === undefined) {
      throw new Error("No pending pick");
    }
    
    sendEvent({ type: chats[pendingPick].answers[pickIndex].text, intPropId });

    setPendingPick(undefined);
  }

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
      className="flex h-full w-full flex-col gap-2 overflow-y-auto bg-white px-4 py-2 text-lg"
      ref={messagesContainerRef}
    >
      {chats.map((chat, elem_index) => (
        <div key={elem_index} className="flex flex-col">
          {
            aiPrompts.get(elem_index)?.map((prompt, prompt_index) => (
              <div key={prompt_index} className="flex flex-col gap-2 pt-2">
                <div className="flex flex-row gap-2 justify-end">
                  <span className="flex flex-col px-5"> { /* spacer */ } </span>
                  <div className="rounded-xl px-4 py-2 bg-slate-300 text-black markdown-link">
                    {prompt.question}
                  </div>
                  <img src={ProfileSvg} className={`h-10 rounded-full`} />
                </div>
                <div className="flex flex-row gap-2">
                  <img src={AIBotImg} className={`h-10 rounded-full`} />
                  <div className="rounded-xl px-4 py-2 bg-slate-300 text-black markdown-link">
                    {prompt.answer === undefined ? (
                      <img src={SpinnerSvg} alt="Loading..." />
                    ) : (
                      <Markdown>{prompt.answer}</Markdown>
                    )}
                  </div>
                  <span className="flex flex-col px-5"> { /* spacer */ } </span>
                </div>
              </div>
            ))
          }
          <div className="flex flex-row gap-2 py-2">
            <img src={AIBotImg} className={`h-10 rounded-full`} />
            <div className="flex flex-col rounded-xl bg-slate-300 px-4 py-2 text-black markdown-link">
              <Markdown remarkPlugins={[remarkGfm]}>
                {chat.question}
              </Markdown>
            </div>
            <span className="flex flex-col px-5"> { /* spacer */ } </span>
          </div>
          <div className="flex flex-row py-2 gap-2 justify-start flex-wrap flex-row-reverse">
            { chat.answers.length > 0 && <img src={ProfileSvg} className="h-10 rounded-full" alt="Profile" />}
            {
            chat.answers.map((answer, answer_index) => (
              <button
                className={`rounded-xl px-4 py-2 bg-blue-600 text-white 
                  ${answer.state === ChatAnswerState.Unselectable || answer.text === "US Copyright Certificate" && "bg-gray-400"}
                  ${answer.state === ChatAnswerState.Selectable && answer.text !== "US Copyright Certificate" && "hover:bg-blue-800"}
                  ${answer.state === ChatAnswerState.Selected && answer.text !== "US Copyright Certificate" && "bg-blue-800"}
                `}
                // TODO: temporary solution to prevent the user from selecting the "US Copyright Certificate"
                disabled={answer.state !== ChatAnswerState.Selectable || answer.text === "US Copyright Certificate"}
                key={answer_index}
                // TODO: have guards in the state machine to prevent code like this
                onClick={() => { answer.text === "bIP certificate" ? setCreatingIp(answer_index) : transition(answer_index); } } 
              >
                {answer.text.split("\n").map((line, i) => (
                  <span key={i}>
                    {line}
                    <br />
                  </span>
                ))}
              </button>
            ))
            }
            <span className="flex flex-col px-5"> { /* spacer */ } </span>
          </div>
        </div>
      ))}
      <div ref={messagesEndRef}></div>
      <NewIP principal={principal} isOpen={creatingIp !== undefined} onClose={(ipId) => onIpCreated(ipId)} />
    </div>
  );
};

export default ChatBox;