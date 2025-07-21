export enum ChatAnswerState {
  Unselectable,
  Selectable,
  Selected,
}

export type ChatAnswer = {
  text: string;
  state: ChatAnswerState;
};

export type ChatElem = {
  key: string;
  question: string;
  answers: ChatAnswer[];
};

export const createChatElem = (
  key: string,
  question: string,
  answers: string[],
): ChatElem => {
  return {
    key,
    question,
    answers: answers.map((answer) => ({
      text: answer,
      state: ChatAnswerState.Selectable,
    })),
  };
};

export interface AiPrompt {
  question: string;
  answer: string | undefined;
}
