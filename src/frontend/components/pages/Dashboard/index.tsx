import { useEffect, useRef, useState, KeyboardEvent } from "react";
import SearchSvg from "../../../assets/search.svg";
import SendMessageSvg from "../../../assets/send-message.svg";

const initialText =
  "Hello! I am the IP Assistant, a chatbot trained on extensive legal and technical information related to intellectual property (IP). I am here to assist you with any questions or concerns you may have about IP protection, copyright laws, patent filing, trademark registration, and any other related topics. How can I assist you today?";

const generatedText = "Hello! How can I assist you today?";

interface ChatBoxProps {
  chats: string[];
}

const ChatBox: React.FC<ChatBoxProps> = ({ chats }) => {
  const messagesContainerRef = useRef<HTMLDivElement | null>(null);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [chats]);

  return (
    <div
      className="flex w-full flex-col gap-2 overflow-y-auto px-4 py-2 text-lg"
      ref={messagesContainerRef}
    >
      {chats.map((chat, index) => (
        <p
          className={`rounded-xl px-4 py-2 ${index % 2 ? "bg-blue-600 text-white" : "bg-slate-300 text-black"}`}
        >
          {chat.split("\n").map((line, i) => (
            <span key={i}>
              {line}
              <br />
            </span>
          ))}
        </p>
      ))}
      <div ref={messagesEndRef}></div>
    </div>
  );
};

function Dashboard() {
  const [isChatting, setIsChatting] = useState(false);
  const [chats, setChats] = useState([initialText]);
  const [prompt, setPrompt] = useState("");
  const [shiftPressed, setShiftPressed] = useState(false);
  const textAreaRef = useRef<HTMLTextAreaElement>(null);

  const handleEnterPress = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if (shiftPressed) {
      setPrompt((prevPrompt) => prevPrompt + "\n");
    } else if (prompt) {
      setChats((prevChats) => [...prevChats, prompt, generatedText]);
      setPrompt("");
    }
    event.preventDefault();
  };

  const handleSendButtonClick = () => {
    setChats([...chats, prompt, generatedText]);
    setPrompt("");
  };

  useEffect(() => {
    if (chats.length <= 1) setIsChatting(false);
    else setIsChatting(true);
  }, [chats]);

  return (
    <div className="flex h-full w-full flex-1 flex-col justify-between overflow-auto">
      {isChatting ? (
        <ChatBox chats={chats} />
      ) : (
        <div className="flex h-full flex-col items-start justify-center px-16 text-blue-900">
          <div className="flex flex-col items-center gap-8 py-16 text-3xl font-bold uppercase tracking-wider">
            Meet ArtizBot, Your Intellectual Property Guardian.
            <div className="h-1 w-96 bg-blue-900"></div>
          </div>
          <div className="flex flex-col items-start justify-start gap-16 text-xl">
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
          </div>
        </div>
      )}
      <div className="w-full bg-gray-400 px-10 py-6">
        <div className="flex w-full items-center justify-between gap-4 rounded-md bg-white p-2">
          <textarea
            className="w-full text-lg text-blue-900 outline-none"
            placeholder="What do want to protect?"
            value={prompt}
            onChange={(e) => {
              setPrompt(e.target.value);
            }}
            onKeyDown={(event) =>
              event.key === "Shift" && setShiftPressed(true)
            }
            onKeyUp={(event) => event.key === "Shift" && setShiftPressed(false)}
            onKeyPress={(event) =>
              event.key === "Enter" && handleEnterPress(event)
            }
            ref={textAreaRef}
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
