import { HttpResponse } from "../../../../declarations/backend/backend.did";
import { arrayOfNumberToUint8Array } from "@dfinity/utils";
import { AiPrompt } from "./types";

const chatgptCompletionBody = (question: string, history: AiPrompt[]) => {
  let previousPrompts = history.flatMap((prompt) => {
    return prompt.answer !== undefined
      ? [
          { role: "user", content: prompt.question },
          { role: "assistant", content: prompt.answer },
        ]
      : [];
  });
  return {
    model: "gpt-4o",
    messages: [
      {
        role: "system", content: "You are an assistant designed to help the user answer questions on intellectual property (IP). Your are embedded in the BIPQuantum website, which is a platform that delivers digital certificate that leverages blockchain technology to provide secure and immutable proof of ownership and authenticity for intellectual properties. You will answer technical questions on IP and guide the user through the process of creating a new IP certificate. You won't answer questions that e not related to IP, blockchain, or the BIPQuantum platform.",
      },
      ...previousPrompts,
      {
        role: "user", content: question,
      },
    ],
  };
};

// Convert Blob to ArrayBuffer using FileReader
const blobToArrayBuffer = (blob: Blob) : Promise<ArrayBuffer> =>{
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result instanceof ArrayBuffer) {
        resolve(event.target.result);
      } else {
        reject(new Error("Failed to read Blob as ArrayBuffer"));
      }
    };
    reader.onerror = (error) => reject(error);
    reader.readAsArrayBuffer(blob);
  });
}

export const formatRequestBody = (question: string, history: AiPrompt[]) : Promise<Uint8Array> => {

  const jsonString = JSON.stringify(chatgptCompletionBody(question, history));
  const blob = new Blob([jsonString], { type: "application/json" });

  return blobToArrayBuffer(blob).then((arrayBuffer) => {
    return new Uint8Array(arrayBuffer);
  });

};

export const extractRequestResponse = (response: HttpResponse): string | undefined => {

  let ui8array: Uint8Array | undefined = undefined;

  if (response.body instanceof Uint8Array) {
    ui8array = response.body;
  } else if (Array.isArray(response.body)) {
    ui8array = arrayOfNumberToUint8Array(response.body as number[]);
  }

  if (ui8array) {
    const decoder = new TextDecoder("utf-8");
    const jsonString = decoder.decode(ui8array);
    const jsonObject = JSON.parse(jsonString);

    // Use optional chaining to check for the presence of necessary properties
    return jsonObject?.choices?.[0]?.message?.content;
  }

  return undefined;
};