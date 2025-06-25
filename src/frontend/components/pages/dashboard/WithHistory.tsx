import { Principal } from "@dfinity/principal";
import ChatBot from "./ChatBot";
import { backendActor } from "../../actors/BackendActor";
import { useEffect, useRef, useState } from "react";
import { AnyEventObject } from "xstate";
import { useMachine } from "@xstate/react";
import { machine } from "./botStateMachine";
import { AiPrompt, ChatAnswerState, ChatElem, createChatElem } from "./types";
import { extractRequestResponse, formatRequestBody } from "./chatgpt";

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

  const [_, send, actor] = useMachine(machine, { input: undefined });
  
  actor.subscribe((state) => {
    if (state.value !== undefined){
      const key = state.value.toString();
      const stateInfo = getCustomStateInfo(state.value);
      if (chats.current.length === 0 || chats.current[chats.current.length - 1].key !== key) {
        const metaDescription = state.getMeta()["chat.bipCertificate"]?.description;
        const description = stateInfo.description + (metaDescription === undefined ? "" : "\n\n" + metaDescription(state.context));
        chats.current = [...chats.current, createChatElem(state.value.toString(), description, stateInfo.transitions)];
      }
    }
  });

  const [aiPrompts, setAIPrompts] = useState<Map<number, AiPrompt[]>>(new Map());

  const { call: updateChatHistory } = backendActor.useUpdateCall({
    functionName: "update_chat_history",
  });

  const { call: getChatHistory } = backendActor.useQueryCall({
    functionName: "get_chat_history",
    args: [{id: chatId}],
  });

  const { call: getResponse } = backendActor.useUpdateCall({
    functionName: "chatbot_completion",
  });

  const refreshChat = () => {

    // Reset the machine if not already in the initial state
    if (actor.getSnapshot().value !== machine.definition.initial?.target[0].key){
      chats.current = [];
      send({ type: "reset" });
    }

    // Process the chat history
    const id = refId.current;
    var events = JSON.stringify("");
    var prompts = JSON.stringify("");

    getChatHistory([{id}]).then((res) => {
      if (res !== undefined && 'ok' in res) {
        if (res.ok.version !== machine.version) {
          throw new Error("State machine version mismatch!");
        };
        events = res.ok.events;
        prompts = res.ok.aiPrompts;
      }
    }).catch(() => {
    }).finally(() => {
      if (id === refId.current) {
        eventHistory.current = JSON.parse(events);
        for (const event of eventHistory.current) {
          // Send the transition
          selectAnswer(JSON.parse(event));
        }
        setAIPrompts(new Map(JSON.parse(prompts)));
      }
    });
  }

  const selectAnswer = (event: AnyEventObject) => {
    // Watchout: chats.current is a reference to the current chats array
    // It is required to check if the selected answer is in the current answers
    // because the state subscription is triggered many times for the same state.
    let selectedAnswer = event.type;
    let currentAnswers = chats.current[chats.current.length - 1].answers;
    if (currentAnswers.map((answer) => answer.text).includes(selectedAnswer)) {
      for (const answer of currentAnswers) {
        if (answer.text === selectedAnswer) {
          answer.state = ChatAnswerState.Selected;
        } else {
          answer.state = ChatAnswerState.Unselectable;
        }
      }
    };
    // Send the event
    send(event);
  }

  const askAI = async (question: string) : Promise<void> => {
    
    const promptIndex = chats.current.length > 0 ? chats.current.length - 1 : 0;
    var aiPrompt = aiPrompts.get(promptIndex) || [];
    const innerIndex = aiPrompt.push({ question, answer: undefined });
    setAIPrompts((old) => new Map(old.set(promptIndex, aiPrompt)));
    
    await formatRequestBody(question, Array.from(aiPrompts.values()).flat()).then((body) => {
      getResponse([{ body }]).then((res) => {
        console.log("Request res:", res);
        if (res=== undefined || res.status < 200n || res.status >= 300n) {
          throw new Error(`Unexpected response: ${JSON.stringify(res)}`);
        }
        let response : string = (res && extractRequestResponse(res)) ?? "Sorry, I am experiencing techical issues. Please try again later.";
        setAIPrompts((old) => {
          const currentPrompts = old.get(promptIndex);
          if (!currentPrompts) {
            throw new Error("Expected updated prompts to exist");
          }
          currentPrompts[innerIndex - 1].answer = response;
          const newPrompts = new Map(old);
          newPrompts.set(promptIndex, currentPrompts);
          updateChatHistory([{id: chatId, events: JSON.stringify(eventHistory.current), aiPrompts: JSON.stringify(Array.from(newPrompts.entries()))}])
          return newPrompts;
        });
      })
      .catch((error) => {
        console.error("Error getting response:", error);
      })
    })
    .catch((error) => { 
      console.error("Error converting blob:", error)
    });
  };

  useEffect(() => {
    if (refId.current !== chatId) {
      refId.current = chatId; // Make sure to refresh only once
      refreshChat();
    };
  }, [chatId]);

  useEffect(() => {
    refreshChat();
  }, []);

  const sendEvent = (event: AnyEventObject) => {
    selectAnswer(event);
    // Update the chat history with the new event
    eventHistory.current = [...eventHistory.current, JSON.stringify(event)];
    updateChatHistory([{id: chatId, events: JSON.stringify([...eventHistory.current, JSON.stringify(event)]), aiPrompts: JSON.stringify(Array.from(aiPrompts.entries()))}])
    .catch((error) => {
      console.error("Error updating chat history:", error);
    });
  }

  return <ChatBot principal={principal} chats={chats.current} sendEvent={sendEvent} aiPrompts={aiPrompts} askAI={askAI}/>
}

export default WithHistory;