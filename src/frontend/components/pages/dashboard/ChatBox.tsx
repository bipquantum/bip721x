import { useEffect, useRef } from "react";

import SpinnerSvg from "../../../assets/spinner.svg";
import { ChatType, ChatElem, ChatAnswerState } from "./types";

interface ChatBoxProps {
  chats: ChatElem[];
  isCalling: boolean;
}

const ChatBox: React.FC<ChatBoxProps> = ({ chats, isCalling }) => {
  const messagesContainerRef = useRef<HTMLDivElement | null>(null);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [chats]);

  return (
    <div
      className="flex h-full w-full flex-col gap-2 overflow-y-auto bg-white px-4 py-2 text-lg"
      ref={messagesContainerRef}
    >
      {chats.map((chat, elem_index) => (
        chat.case === ChatType.Question ?
        <p
          className={`rounded-xl px-4 py-2 bg-slate-300 text-black`}
          key={elem_index}
        >
          {chat.content.split("\n").map((line, i) => (
            <span key={i}>
              {line}
              <br />
            </span>
          ))}
        </p> : 
        <div key={elem_index} className="flex flex-row gap-2">
          {
          chat.content.map((answer, answer_index) => (
            <button
              className={`rounded-xl px-4 py-2 bg-blue-600 text-white 
                ${answer.state === ChatAnswerState.Unselectable && "bg-gray-400 cursor-default"}
                ${answer.state === ChatAnswerState.Selectable && "cursor-pointer hover:bg-blue-800"}
                ${answer.state === ChatAnswerState.Selected && "bg-blue-800 cursor-default"}
              `}
              key={answer_index}
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
    </div>
  );
};

export default ChatBox;