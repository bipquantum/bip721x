import { HttpResponse } from "../../../../declarations/backend/backend.did";
import { arrayOfNumberToUint8Array } from "@dfinity/utils";

const chatgptCompletionBody = (content: string) => {
  return {
    model: "gpt-3.5-turbo",
    messages: [
      {
        role: "user",
        content: content,
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

export const formatRequestBody = (content: string) : Promise<Uint8Array> => {

  const jsonString = JSON.stringify(chatgptCompletionBody(content));
  const blob = new Blob([jsonString], { type: "application/json" });

  return blobToArrayBuffer(blob).then((arrayBuffer) => {
    return new Uint8Array(arrayBuffer);
  });

};

export const extractRequestResponse = (response: HttpResponse) : string | undefined => {

  var ui8array = undefined;
  if (response.body as Uint8Array) {
    ui8array = response.body as Uint8Array;
  } else if (response.body as number[]) {
    ui8array = arrayOfNumberToUint8Array(response.body as number[]);
  }

  if (ui8array) {
    const decoder = new TextDecoder("utf-8");
    const jsonString = decoder.decode(ui8array);
    const jsonObject = JSON.parse(jsonString);
    return jsonObject["choices"][0]["message"]["content"];
  }
}