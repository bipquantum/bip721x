
export enum ChatType {
    Question,
    Answers
};

export enum ChatAnswerState {
    Unselectable,
    Selectable,
    Selected,
}

export type ChatAnswer = {
    text: string;
    state: ChatAnswerState
}
  
export type ChatElem = 
| { 
    case: ChatType.Question; 
    content: string; 
  }
| {
    case: ChatType.Answers;
    content: ChatAnswer[]; 
};

export const createQuestion = (text: string): ChatElem => ({
    case: ChatType.Question,
    content: text,
});

export const createAnswers = (text: string[], state?: ChatAnswerState): ChatElem => ({
    case: ChatType.Answers,
    content: text.map((answer) => ({ text: answer, state: state ?? ChatAnswerState.Selectable })),
});