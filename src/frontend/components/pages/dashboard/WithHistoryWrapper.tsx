import { Principal } from "@dfinity/principal";
import WithHistory from "./WithHistory";
import { useParams } from "react-router-dom";
import { backendActor } from "../../actors/BackendActor";
import { useEffect, useRef, useState } from "react";

interface WithHistoryWrapperProps {
  principal: Principal | undefined;
}

const WithHistoryWrapper: React.FC<WithHistoryWrapperProps> = ({ principal }) => {

  let { chatId } = useParams();

  //const creationRef = useRef<number>(0);
  //const [chatId, setChatId] = useState<bigint | undefined>(undefined);

//  const { call: createChatHistory } = backendActor.useUpdateCall({
//    functionName: "create_chat_history",
//  });

//  const createChat = (ref: number) => {
//    console.log("Creating chat history...");
//    createChatHistory([{history: JSON.stringify([])}]).then((res) => {
//      if (ref == creationRef.current && res !== undefined && 'ok' in res) {
//        setChatId(BigInt(res.ok));
//      }
//    })
//    .catch((error) => {
//      console.error("Error creating chat history:", error);
//    });
//  }

//  useEffect(() => {
//    console.log("set chat id")
//    setChatId(paramChatId !== undefined ? BigInt(paramChatId) : undefined);
//  }
//  , [paramChatId]);
//
//  // Create a new chat history if the chatId is not defined
//  useEffect(() => {
//    if (chatId === undefined) {
//      creationRef.current += 1;
//      createChat(creationRef.current);
//    }
//  }, [chatId]);
//
//  useEffect(() => {
//    if (chatId === undefined) {
//      console.log("Chat ID is undefined");
//    }
//  }, []);

  return (
    chatId === undefined ? 
    <div>Loading...</div> :
    <WithHistory principal={principal} chatId={chatId}/>
  );
}

export default WithHistoryWrapper;