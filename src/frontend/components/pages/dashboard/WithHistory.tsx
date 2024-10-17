import { Principal } from "@dfinity/principal";
import ChatBot from "./ChatBot";
import { useParams } from "react-router-dom";
import { backendActor } from "../../actors/BackendActor";
import { useEffect, useRef, useState } from "react";
import { AnyEventObject } from "xstate";
import { useMachine } from "@xstate/react";
import { machine } from "./botStateMachine";
import { ChatAnswerState, ChatElem, createChatElem } from "./types";

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

enum HistoryStateEnum {
  Unset,
  Creating,
  Defined,
}

type HistoryState =
| { state: HistoryStateEnum.Unset }
| { state: HistoryStateEnum.Creating }
| { state: HistoryStateEnum.Defined, chatId: bigint };

const WithHistory: React.FC<WithHistoryProps> = ({ principal }) => {

  let { chatId: chatId } = useParams();

  const [_, send, actor] = useMachine(machine);

  const historyState = useRef<HistoryState>(chatId !== undefined ? 
    { state: HistoryStateEnum.Defined, chatId: BigInt(chatId) } : { state: HistoryStateEnum.Unset });
  const eventHistory = useRef<string[] | undefined>(undefined);
  //const stateHistory = useRef<string[]>([]);
  const chats = useRef<ChatElem[]>([]);
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
    if (historyState.current.state ===  HistoryStateEnum.Defined && eventHistory.current !== undefined) {
      eventHistory.current = [...eventHistory.current, JSON.stringify(event)];
      updateChatHistory([{id: historyState.current.chatId, history: JSON.stringify([...eventHistory.current, JSON.stringify(event)])}]).then((res) => {
        console.log("Chat history updated:", res);
      })
      .catch((error) => {
        console.error("Error updating chat history:", error);
      });
    }
  }

  // Create a new chat history if the chatId is not defined
  useEffect(() => {
    if (historyState.current.state === HistoryStateEnum.Unset) {
      console.log("Creating chat history...");
      historyState.current = { state: HistoryStateEnum.Creating } ;
      createChatHistory([{history: JSON.stringify([])}]).then((res) => {
        if (res !== undefined && 'ok' in res) {
          historyState.current = { state: HistoryStateEnum.Defined, chatId: BigInt(res.ok) };
        }
      })
      .catch((error) => {
        console.error("Error creating chat history:", error);
      });
    } else if (historyState.current.state === HistoryStateEnum.Defined && eventHistory.current === undefined) {
      eventHistory.current = [];
      console.log("Getting chat history...");
      getChatHistory([{id: historyState.current.chatId}]).then((res) => {
        if (res !== undefined && 'ok' in res) {
          console.log("Chat history retrieved:", res.ok.history);
          eventHistory.current = (JSON.parse(res.ok.history));
          for (const event of JSON.parse(res.ok.history)) {
            for (const answer of chats.current[chats.current.length - 1].answers) {
              if (answer.text === JSON.parse(event).type) {
                answer.state = ChatAnswerState.Selected;
              } else {
                answer.state = ChatAnswerState.Unselectable;
              }
            }
            send(JSON.parse(event));
          }
        }
      })
      .catch((error) => {
        console.error("Error getting chat history:", error);
      });
    }
  }, [historyState]);

  actor.subscribe((state) => {
    // TODO: why with each transition this hook is called 6 times more every time?
    if (state.value !== undefined){
      const stateInfo = getCustomStateInfo(state.value);
      if (chats.current.length === 0 || chats.current[chats.current.length - 1].question !== stateInfo.description) {
        chats.current = [...chats.current, createChatElem(stateInfo.description, stateInfo.transitions)];
        console.log("Chats:", chats.current);
      }
    }
  });

  return <ChatBot principal={principal} chats={chats.current} addToHistory={addToHistory}/>
}

export default WithHistory;