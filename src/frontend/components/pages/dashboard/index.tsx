import { useEffect, useRef, useState, KeyboardEvent } from "react";

import SearchSvg from "../../../assets/search.svg";
import SendMessageSvg from "../../../assets/send-message.svg";
import SpinnerSvg from "../../../assets/spinner.svg";
import { backendActor } from "../../actors/BackendActor";
import { arrayOfNumberToUint8Array } from "@dfinity/utils";

const initialText =
  "Hello! I am the IP Assistant, a chatbot trained on extensive legal and technical information related to intellectual property (IP). I am here to assist you with any questions or concerns you may have about IP protection, copyright laws, patent filing, trademark registration, and any other related topics. How can I assist you today?";

const generatedText = "Hello! How can I assist you today?";

interface ChatBoxProps {
  chats: string[];
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
      {chats.map((chat, index) => (
        <p
          className={`rounded-xl px-4 py-2 ${index % 2 ? "bg-blue-600 text-white" : "bg-slate-300 text-black"}`}
          key={index}
        >
          {chat.split("\n").map((line, i) => (
            <span key={i}>
              {line}
              <br />
            </span>
          ))}
        </p>
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

function Dashboard() {
  const [isChatting, setIsChatting] = useState(false);
  const [chats, setChats] = useState([initialText]);
  const [prompt, setPrompt] = useState("");
  const [shiftPressed, setShiftPressed] = useState(false);
  const [isCalling, setIsCalling] = useState(false);
  const textAreaRef = useRef<HTMLTextAreaElement>(null);

  const questionBody = {
    model: "gpt-3.5-turbo",
    messages: [
      {
        role: "user",
        content: prompt,
      },
    ],
  };

  // Step 1: Convert the dictionary to a JSON string
  const jsonString = JSON.stringify(questionBody);

  // Step 2: Create a Blob from the JSON string
  const blob = new Blob([jsonString], { type: "application/json" });

  // Convert Blob to ArrayBuffer using FileReader
  function blobToArrayBuffer(blob: Blob): Promise<ArrayBuffer> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result instanceof ArrayBuffer) {
          resolve(event.target.result);
        } else {
          reject(new Error("Failed to read Blob as ArrayBuffer"));
        }
      };
      reader.onerror = (error) => reject(error);
      reader.readAsArrayBuffer(blob);
    });
  }

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
    setChats((prevChats) => [...prevChats, prompt]);
    await blobToArrayBuffer(blob)
      .then((arrayBuffer) => {
        console.log("Trigger getResponse");
        const uint8Array = new Uint8Array(arrayBuffer);
        getResponse([{ body: uint8Array }])
          .then((response) => {
            console.log(response);
            var ui8array = undefined;
            if (response?.body as Uint8Array) {
              ui8array = response?.body as Uint8Array;
            } else if (response?.body as number[]) {
              ui8array = arrayOfNumberToUint8Array(response?.body as number[]);
            }

            if (ui8array) {
              const decoder = new TextDecoder("utf-8");
              const jsonString = decoder.decode(ui8array);
              const jsonObject = JSON.parse(jsonString);
              let newChat = "";
              setChats((prevChats) => [...prevChats, newChat]);
              let i = 0;
              let intervalId = setInterval(() => {
                if (i < jsonObject["choices"][0]["message"]["content"].length) {
                  newChat +=
                    jsonObject["choices"][0]["message"]["content"].charAt(i);
                  setChats((prevChats) => {
                    const updatedChats = [...prevChats];
                    updatedChats[updatedChats.length - 1] = newChat;
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
        <ChatBox chats={chats} isCalling={isCalling} />
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
