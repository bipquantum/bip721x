import { Principal } from "@dfinity/principal";
import ChatBot from "./ChatBot";
import { backendActor } from "../../actors/BackendActor";
import { useEffect, useRef } from "react";
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
  chatId: string;
}

const WithHistory: React.FC<WithHistoryProps> = ({ principal, chatId }) => {

  const refId = useRef<string>(chatId);
  const eventHistory = useRef<string[]>([]);
  const chats = useRef<ChatElem[]>([]);

  const [_, send, actor] = useMachine(machine);

  actor.subscribe((state) => {
    if (state.value !== undefined){
      const stateInfo = getCustomStateInfo(state.value);
      if (chats.current.length === 0 || chats.current[chats.current.length - 1].question !== stateInfo.description) {
        chats.current = [...chats.current, createChatElem(stateInfo.description, stateInfo.transitions)];
      }
    }
  });

  const { call: setChatHistory } = backendActor.useUpdateCall({
    functionName: "set_chat_history",
  });

  const { call: getChatHistory } = backendActor.useQueryCall({
    functionName: "get_chat_history",
    args: [{id: chatId}],
  });

  const refreshMachine = () => {

    // Reset the machine
    eventHistory.current = [];
    chats.current = [];
    send({ type: "reset" });

    const id = refId.current;
    var eHistory = JSON.stringify("");

    getChatHistory([{id}]).then((res) => {
      if (res !== undefined && 'ok' in res) {
        eHistory = res.ok.history;
      }
    }).catch(() => {
    }).finally(() => {
      if (id === refId.current) {
        eventHistory.current = JSON.parse(eHistory);
        for (const event of eventHistory.current) {
          // Send the transition
          selectAnswer(JSON.parse(event).type);
        }
      }
    });
  }

  const selectAnswer = (selectedAnswer: string) => {
    // First refresh the UI
    for (const answer of chats.current[chats.current.length - 1].answers) {
      if (answer.text === selectedAnswer) {
        answer.state = ChatAnswerState.Selected;
      } else {
        answer.state = ChatAnswerState.Unselectable;
      }
    }
    // Then send the event
    send({ type: selectedAnswer });
  }

  useEffect(() => {
    if (refId.current !== chatId) {
      refId.current = chatId; // Make sure to refresh only once
      refreshMachine();
    };
  }, [chatId]);

  const addToHistory = (event: AnyEventObject) => {
    selectAnswer(event.type);
    // Update the chat history with the new event
    eventHistory.current = [...eventHistory.current, JSON.stringify(event)];
    setChatHistory([{id: chatId, history: JSON.stringify([...eventHistory.current, JSON.stringify(event)])}]).then((res) => {
    })
    .catch((error) => {
      console.error("Error updating chat history:", error);
    });
  }

  return <ChatBot principal={principal} chats={chats.current} addToHistory={addToHistory}/>
}

export default WithHistory;