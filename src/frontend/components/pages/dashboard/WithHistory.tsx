import { Principal } from "@dfinity/principal";
import ChatBot from "./ChatBot";
import { useParams } from "react-router-dom";
import { backendActor } from "../../actors/BackendActor";
import { useEffect, useState } from "react";
import { AnyEventObject } from "xstate";
import { useMachine } from "@xstate/react";
import { machine } from "./botStateMachine";

type CustomStateInfo = {
  description: string;
  transitions: string[];
};

const getCustomStateInfo = (stateValue: any): CustomStateInfo => {
  // Convert the state value to a readable state map
  const statePath = typeof stateValue === 'string' ? [stateValue] : Object.keys(stateValue);

  // Traverse through the states object to find the description
  let currentState = machine.config.states;
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

interface WithHistoryProps {
  principal: Principal | undefined;
}

const WithHistory: React.FC<WithHistoryProps> = ({ principal }) => {

  let { chatId: paramChatId } = useParams();

  const [_, send, actor] = useMachine(machine);

  const [chatId, setChatId] = useState<bigint | undefined>(paramChatId !== undefined ? BigInt(paramChatId) : undefined);
  const [eventHistory, setEventHistory] = useState<string[]>([]);
  const [currentInfo, setCurrentInfo] = useState<CustomStateInfo | undefined>(undefined);

  const { call: createChatHistory } = backendActor.useUpdateCall({
    functionName: "create_chat_history",
  });

  const { call: updateChatHistory } = backendActor.useUpdateCall({
    functionName: "update_chat_history",
  });

  const { call: getChatHistory } = backendActor.useQueryCall({
    functionName: "get_chat_history",
  });

  const addToHistory = (event: AnyEventObject) => {
    // Trigger the state machine transition with the event
    send(event);

    // Update the chat history with the new event
    if (chatId !== undefined) {
      setEventHistory([...eventHistory, JSON.stringify(event)]);
      updateChatHistory([{id: chatId, history: JSON.stringify([...eventHistory, JSON.stringify(event)])}]).then((res) => {
        console.log("Chat history updated:", res);
      })
      .catch((error) => {
        console.error("Error updating chat history:", error);
      });
    }
  }

  // Create a new chat history if the chatId is not defined
  useEffect(() => {
    if (chatId === undefined) {
      createChatHistory([{history: JSON.stringify([])}]).then((res) => {
        if (res !== undefined && 'ok' in res) {
          setChatId(res.ok);
        }
      })
      .catch((error) => {
        console.error("Error creating chat history:", error);
      });
    } else {
      getChatHistory([{id: chatId}]).then((res) => {
        if (res !== undefined && 'ok' in res) {
          setEventHistory(JSON.parse(res.ok.history));
        }
      })
      .catch((error) => {
        console.error("Error getting chat history:", error);
      });
    }
  }, [chatId]);

  actor.subscribe((state) => {
    // TODO: why with each transition this hook is called 6 times more every time?
    console.log("State updated:", state.value);
    setCurrentInfo(getCustomStateInfo(state.value));
  });

  return <ChatBot principal={principal} currentInfo={currentInfo} addToHistory={addToHistory}/>
}

export default WithHistory;