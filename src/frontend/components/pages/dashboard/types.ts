
export enum ChatAnswerState {
    Unselectable,
    Selectable,
    Selected,
}

export type ChatAnswer = {
    text: string;
    state: ChatAnswerState
}
  
export type ChatElem = {
    question: string;
    answers: ChatAnswer[];
};

export const createChatElem = (question: string, answers: string[]): ChatElem => {
    return {
        question,
        answers: answers.map((answer) => ({ text: answer, state: ChatAnswerState.Selectable })),
    };
};