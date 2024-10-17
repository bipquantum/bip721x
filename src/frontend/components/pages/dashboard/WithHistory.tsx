import { Principal } from "@dfinity/principal";
import ChatBot from "./ChatBot";
import { backendActor } from "../../actors/BackendActor";
import { useEffect, useRef, useState } from "react";
import { AnyEventObject, createMachine, createActor } from "xstate";
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

const createStateMachine = (eventHistory: string | undefined, onNewState: (state: any) => void) => {
  const actor = createActor(machine);
  actor.subscribe((state) => {
    onNewState(state);
  });
  actor.start();
  if (eventHistory !== undefined) {
    for (const event of JSON.parse(eventHistory)) {
      // Send the transition
      console.log("Sending event:", JSON.parse(event));
      actor.send(JSON.parse(event));
    }
  }
  return actor;
}

interface WithHistoryProps {
  principal: Principal | undefined;
  chatId: string;
}

const WithHistory: React.FC<WithHistoryProps> = ({ principal, chatId }) => {

  const refId = useRef<string>(chatId);
  const eventHistory = useRef<string[]>([]);
  const chats = useRef<ChatElem[]>([]);

  const updateChat = (state: any) => {
    if (state.value !== undefined){
      const stateInfo = getCustomStateInfo(state.value);
      if (chats.current.length === 0 || chats.current[chats.current.length - 1].question !== stateInfo.description) {
        console.log("Refreshing from state subscribe:", stateInfo.description, stateInfo.transitions);
        chats.current = [...chats.current, createChatElem(stateInfo.description, stateInfo.transitions)];
      }
    }
  }

  const [actor, setActor] = useState(createStateMachine(undefined, updateChat));

  const { call: setChatHistory } = backendActor.useUpdateCall({
    functionName: "set_chat_history",
  });

  const { call: getChatHistory } = backendActor.useQueryCall({
    functionName: "get_chat_history",
    args: [{id: chatId}],
  });

  const refreshMachine = () => {
    // Stop the current state machine
    eventHistory.current = [];
    chats.current = [];
    actor.stop(); // To unsubscribe listeners

    console.log("Refreshing chat history...");
    const id = refId.current;

    getChatHistory([{id}]).then((res) => {
      if (id === refId.current && res !== undefined && 'ok' in res) {
        console.log("Set new actor");
        setActor(createStateMachine(res.ok.history, updateChat));
//        const history = JSON.parse(res.ok.history);
//        console.log("Chat history retrieved:", history);
//        eventHistory.current = history;
//        for (const event of history) {
          // Select the answer
//          for (const answer of chats.current[chats.current.length - 1].answers) {
//            if (answer.text === JSON.parse(event).type) {
//              answer.state = ChatAnswerState.Selected;
//            } else {
//              answer.state = ChatAnswerState.Unselectable;
//            }
//          }
//        }
      }
    }).catch((error) => {
      console.error("Error getting chat history:", error);
    });
  }

  useEffect(() => {
    if (refId.current !== chatId) {
      console.log("Chat id changed: new:", chatId, "old:", refId.current);
      refId.current = chatId; // Make sure to refresh only once
      refreshMachine();
    };
  }, [chatId]);

  const addToHistory = (event: AnyEventObject) => {
    // Trigger the state machine transition with the event
    actor.send(event);

    // Update the chat history with the new event
    eventHistory.current = [...eventHistory.current, JSON.stringify(event)];
    setChatHistory([{id: chatId, history: JSON.stringify([...eventHistory.current, JSON.stringify(event)])}]).then((res) => {
      console.log("Chat history updated:", res);
    })
    .catch((error) => {
      console.error("Error updating chat history:", error);
    });
  }

  return <ChatBot principal={principal} chats={chats.current} addToHistory={addToHistory}/>
}

export default WithHistory;