import { useEffect, useRef, useState, KeyboardEvent } from "react";

import SearchSvg from "../../../assets/search.svg";
import SendMessageSvg from "../../../assets/send-message.svg";
import { backendActor } from "../../actors/BackendActor";
import { ChatElem, createAnswers, createQuestion } from "./types";
import ChatBox from "./ChatBox";
import { extractRequestResponse, formatRequestBody } from "./chatgpt";
import { Principal } from "@dfinity/principal";
import { AnyEventObject } from "xstate";

type CustomStateInfo = {
  description: string;
  transitions: string[];
};

interface ChatBotProps {
  principal: Principal | undefined;
  currentInfo: CustomStateInfo | undefined;
  addToHistory: (event: AnyEventObject) => void;
};

const ChatBot = ({ principal, currentInfo, addToHistory }: ChatBotProps) => {

  const [chats, setChats] = useState<ChatElem[]>([]);
  const [prompt, setPrompt] = useState("");
  const [shiftPressed, setShiftPressed] = useState(false);
  const [isCalling, setIsCalling] = useState(false);
  const textAreaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (currentInfo) {
      setChats((prevChats) => [...prevChats, createQuestion(currentInfo.description), createAnswers(currentInfo.transitions)]);
    }
  }, [currentInfo]);

  const { call: getResponse } = backendActor.useUpdateCall({
    functionName: "chatbot_completion",
  });

  const handleEnterPress = async (
    event: KeyboardEvent<HTMLTextAreaElement>,
  ) => {
    if (shiftPressed) {
      setPrompt((prevPrompt) => prevPrompt + "\n");
    } else if (prompt) {
      setPrompt("");
      await handleSendButtonClick();
    }
    event.preventDefault();
  };

  const handleSendButtonClick = async () => {
    setIsCalling(true);
    setChats((prevChats) => [...prevChats, createAnswers([prompt])]);
    await formatRequestBody(prompt).then((body) => {
      getResponse([{ body }]).then((res) => {
        let response = res && extractRequestResponse(res);
        if (response) {
          let newChat = "";
          setChats((prevChats) => [...prevChats, createAnswers([prompt])]);
          let i = 0;
          let intervalId = setInterval(() => {
            if (i < response.length) {
              newChat += response.charAt(i);
              setChats((prevChats) => {
                const updatedChats = [...prevChats];
                updatedChats[updatedChats.length - 1] = createAnswers([prompt]);
                return updatedChats;
              });
              i++;
            } else {
              clearInterval(intervalId);
            }
          }, 10);
        }
        setIsCalling(false);
      })
      .catch((error) => {
        console.error("Error getting response:", error);
        setIsCalling(false);
      });
    })
    .catch((error) => console.error("Error converting blob:", error));
    setPrompt("");
  };

  return (
    <div className="flex h-full w-full flex-1 flex-col justify-between overflow-auto">
      <ChatBox chats={chats} isCalling={isCalling} sendEvent={addToHistory} principal={principal} />
      <div className="w-full bg-gray-300 p-6 sm:px-8 sm:py-10">
        <div className="flex h-full w-full items-center justify-between gap-4 rounded-md bg-white px-4">
          <textarea
            className="w-full text-lg outline-none sm:px-4"
            placeholder="What do you want to protect?"
            value={prompt}
            onChange={(e) => {
              setPrompt(e.target.value);
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
              if (prompt) handleSendButtonClick();
            }}
          >
            <img src={prompt ? SendMessageSvg : SearchSvg} className="h-10" />
          </button>
        </div>
      </div>
    </div>
  );
}

export default ChatBot;
