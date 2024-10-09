import { useEffect, useRef, useState, KeyboardEvent } from "react";
import { useMachine } from '@xstate/react';

import SearchSvg from "../../../assets/search.svg";
import SendMessageSvg from "../../../assets/send-message.svg";
import { backendActor } from "../../actors/BackendActor";
import { ChatElem, createAnswers, createQuestion } from "./types";
import ChatBox from "./ChatBox";
import { extractRequestResponse, formatRequestBody } from "./chatgpt";
import { botStateMachine } from "./botStateMachine";

type CustomStateInfo = {
  description: string;
  transitions: string[];
};

const getCustomStateInfo = (stateValue: any): CustomStateInfo => {
  // Convert the state value to a readable state map
  const statePath = typeof stateValue === 'string' ? [stateValue] : Object.keys(stateValue);

  // Traverse through the states object to find the description
  let currentState = botStateMachine.config.states;
  for (const path of statePath) {
    // TODO: Find why typescript complains about types that are not assignable to each other
    // @ts-ignore
    currentState = currentState?.[path];
  }

  return {
    description: currentState?.description as string,
    transitions: Object.keys(currentState?.on || {}),
  };
};

const Dashboard = () => {

  const [state, send, actor] = useMachine(botStateMachine);

  const [currentInfo, setCurrentInfo] = useState<CustomStateInfo | undefined>(undefined);
  const [isChatting, setIsChatting] = useState(false);
  const [chats, setChats] = useState<ChatElem[]>([]);
  const [prompt, setPrompt] = useState("");
  const [shiftPressed, setShiftPressed] = useState(false);
  const [isCalling, setIsCalling] = useState(false);
  const textAreaRef = useRef<HTMLTextAreaElement>(null);

  actor.subscribe((state) => {
    // TODO: why with each transition this hook is called 6 times more every time?
    console.log("State updated:", state.value);
    let info = getCustomStateInfo(state.value);
    setCurrentInfo(info);
  });

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

  useEffect(() => {
    if (chats.length <= 1) setIsChatting(false);
    else setIsChatting(true);
  }, [chats]);

  return (
    <div className="flex h-full w-full flex-1 flex-col justify-between overflow-auto">
      {isChatting ? (
        <ChatBox chats={chats} isCalling={isCalling} sendEvent={send} />
      ) : (
        <div className="flex h-full flex-col items-center justify-center bg-white px-4 text-primary-text sm:px-16">
          <div className="flex flex-col items-center gap-2 py-4 text-center text-2xl font-bold tracking-wider sm:py-16 sm:text-start sm:text-[32px]">
            Meet ArtizBot Your Intellectual Property Guardian.
            <div className="h-1 w-32 bg-primary sm:w-96"></div>
          </div>
          <div className="grid grid-cols-2 items-start justify-start gap-8 text-center text-lg font-bold leading-6 text-white">
            <div className="flex h-36 w-36 items-center justify-center rounded-2xl bg-secondary px-4">
              IP Education/
              <br />
              Consultation
            </div>
            <div className="flex h-36 w-36 items-center justify-center rounded-2xl bg-secondary px-4">
              Generate a bIP Certificate
            </div>
            <div className="flex h-36 w-36 items-center justify-center rounded-2xl bg-secondary px-4">
              Organize IP Assets
            </div>
            <div className="flex h-36 w-36 items-center justify-center rounded-2xl bg-secondary px-4">
              Sell IP Assets on the bIPQuantum Store
            </div>
          </div>
          {/* <div className="flex flex-col items-start justify-start gap-8 text-lg">
            <div>
              <div className="font-semibold">Certify Your Creations</div>
              <div className="list-disc px-2">
                <li>
                  "Secure your AI Art masterpiece with bIP certification today."
                </li>
                <li>
                  "Transform your digital asset into a certified, market-ready
                  product."
                </li>
                <li>
                  "Turn your creative concept into a protected asset, ready for
                  the market."
                </li>
              </div>
            </div>
            <div>
              <div className="font-semibold">
                Monetize Your Intellectual Assets
              </div>
              <div className="list-disc px-2">
                <li>
                  "Step into the future; tokenize your IP and open doors to
                  unprecedented profits."
                </li>
                <li>
                  "Unlock the full potential of your IP with customized
                  licensing options."
                </li>
                <li>
                  "Maximize your earnings with well-defined royalty schemes for
                  your intellectual assets."
                </li>
              </div>
            </div>
          </div> */}
        </div>
      )}
      <div className="w-full bg-gray-300 p-6 sm:px-8 sm:py-10">
        <div className="flex h-full w-full items-center justify-between gap-4 rounded-md bg-white px-4">
          <textarea
            className="w-full text-lg outline-none sm:px-4"
            placeholder="What do want to protect?"
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

export default Dashboard;
