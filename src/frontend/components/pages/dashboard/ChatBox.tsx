import SpinnerSvg from "../../../assets/spinner.svg";
import { ChatType, ChatElem, ChatAnswerState} from "./types";
import NewIP from "../new-ip/NewIp";

import { useEffect, useRef, useState } from "react";
import { Principal } from "@dfinity/principal";
import { AnyEventObject } from "xstate";
import Markdown from "react-markdown";
import remarkGfm from 'remark-gfm';

interface ChatBoxProps {
  principal: Principal | undefined;
  chats: ChatElem[];
  isCalling: boolean;
  sendEvent: (event: AnyEventObject) => void;
}

const ChatBox: React.FC<ChatBoxProps> = ({ principal, chats, isCalling, sendEvent }) => {
  
  const messagesContainerRef = useRef<HTMLDivElement | null>(null);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  const [pendingPick, setPendingPick] = useState<number | undefined>(undefined);
  const [creatingIp, setCreatingIp] = useState<number | undefined>(undefined);
  const [ipId, setIpId] = useState<bigint | undefined>(undefined);

  const onIpCreated = (ipId: bigint | undefined) => {
    if (creatingIp === undefined) {
      throw new Error("No IP creation in progress");
    }
    if (ipId) {
      setIpId(ipId);
      transition(creatingIp);
    }
    setCreatingIp(undefined);
  }

  const transition = (pickIndex: number) => {
    
    if (!pendingPick) {
      throw new Error("No pending pick");
    }
    if (chats[pendingPick].case !== ChatType.Answers) {
      throw new Error("Pending pick is not an answer");
    }
    
    const answers = chats[pendingPick];
    sendEvent({ type: answers.content[pickIndex].text });
    
    // Update the selected state of each answer
    for (let i = 0; i < answers.content.length; i++) {
      if (i === pickIndex) {
        answers.content[i].state = ChatAnswerState.Selected;
      } else {
        answers.content[i].state = ChatAnswerState.Unselectable;
      }
    }

    setPendingPick(undefined);
  }

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [chats]);

  useEffect(() => {
    const lastChatIndex = chats.length - 1;
    if (chats[lastChatIndex].case === ChatType.Answers) {
      setPendingPick(lastChatIndex);
    }
  }, [chats]);

  return (
    <div
      className="flex h-full w-full flex-col gap-2 overflow-y-auto bg-white px-4 py-2 text-lg"
      ref={messagesContainerRef}
    >
      {chats.map((chat, elem_index) => (
        chat.case === ChatType.Question ?
        <div className="flex flex-col rounded-xl px-4 py-2 bg-slate-300 text-black">
          <Markdown key={elem_index} remarkPlugins={[remarkGfm]}>
            {chat.content}
          </Markdown>
          { 
            // TODO: this is a temporary solution to show the bIP certificate link
            (elem_index === chats.length - 2) && ipId !== undefined ?
            <a href={`/bip/${ipId}`} className="font-bold text-blue-500">View your bIP</a> : <></>
          }
        </div> : 
        <div key={elem_index} className="flex flex-row gap-2">
          {
          chat.content.map((answer, answer_index) => (
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
        </div>
      ))}
      {isCalling && (
        <div className="flex w-full items-center justify-center gap-2 rounded-2xl bg-slate-300 py-2 text-lg text-black">
          <img src={SpinnerSvg} alt="" />
        </div>
      )}
      <div ref={messagesEndRef}></div>
      <NewIP principal={principal} isOpen={creatingIp !== undefined} onClose={(ipId) => onIpCreated(ipId)} />
    </div>
  );
};

export default ChatBox;