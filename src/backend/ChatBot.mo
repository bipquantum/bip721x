import IdempotentProxy "canister:idempotent_proxy_canister";

import Cycles          "mo:base/ExperimentalCycles";
import Text            "mo:base/Text";
import Iter            "mo:base/Iter";
import Debug           "mo:base/Debug";

import Types           "Types";

module {

  let CHAT_MODEL = "gpt-4o";
  let CHAT_INSTRUCTIONS = "You are an assistant designed to help the user answer questions on intellectual property (IP). Your are embedded in the BIPQuantum website, which is a platform that delivers digital certificate that leverages blockchain technology to provide secure and immutable proof of ownership and authenticity for intellectual properties. You will answer technical questions on IP and guide the user through the process of creating a new IP certificate. You won't answer questions that e not related to IP, blockchain, or the BIPQuantum platform.";
  let MAX_HISTORY_MESSAGES = 10; // Maximum number of history messages to include

  type ChatHistory = Types.ChatHistory;

  public class ChatBot({
    chatbot_api_key: Text;
  }) {

    public func get_completion(question: Text, aiPrompts: Text) : async* ?Text {

      // Build messages array with system prompt and history
      var messagesJson = "[{\"role\":\"system\",\"content\":\"" # escapeJSON(CHAT_INSTRUCTIONS) # "\"}";

      // Parse and add history messages (aiPrompts is a JSON string of [[index, [{question, answer}]]])
      messagesJson #= buildHistoryMessages(aiPrompts);

      // Add current question
      messagesJson #= ",{\"role\":\"user\",\"content\":\"" # escapeJSON(question) # "\"}]";

      // Build the JSON request body manually
      let requestBodyText = "{\"model\":\"" # escapeJSON(CHAT_MODEL) # "\",\"messages\":" # messagesJson # "}";

      Debug.print("Request Body: " # requestBodyText);

      Cycles.add<system>(1_000_000_000); // TODO: sardariuss 2024-09-26: Find out precise cycles cost

      let response = await IdempotentProxy.proxy_http_request({
        url = "https://api.openai.com/v1/chat/completions";
        method = #post;
        max_response_bytes = null;
        body = ?Text.encodeUtf8(requestBodyText);
        transform = null;
        headers= [
          { name = "idempotency-key"; value = "idempotency_key_001"       },
          { name = "content-type"   ; value = "application/json"          },
          { name = "Authorization"  ; value = "Bearer " # chatbot_api_key },
        ];
      });

      // Decode the response
      let ?responseText = Text.decodeUtf8(response.body) else return null;

      // Extract content from the JSON response
      extractContentFromOpenAIResponse(responseText);
    };

    // Build history messages JSON from aiPrompts string
    // Expected format: [[index, [{question: "q1", answer: "a1"}, ...]]]
    private func buildHistoryMessages(aiPrompts: Text) : Text {
      if (aiPrompts == "" or aiPrompts == "[]") {
        return "";
      };

      // Parse the aiPrompts to extract question-answer pairs
      var result = "";
      var messageCount = 0;

      let chars = Iter.toArray(aiPrompts.chars());
      var i = 0;

      while (i < chars.size() and messageCount < MAX_HISTORY_MESSAGES) {
        // Look for "question":"
        switch (findPatternFrom(chars, i, "\"question\"")) {
          case null {
            i += 1;
          };
          case (?qPos) {
            // Find the value after "question":
            switch (findValueStart(chars, qPos + 10)) {
              case null {
                i := qPos + 1;
              };
              case (?qValueStart) {
                switch (findStringEnd(chars, qValueStart)) {
                  case null {
                    i := qPos + 1;
                  };
                  case (?qValueEnd) {
                    let currentQuestion = extractString(chars, qValueStart, qValueEnd);

                    // Look for "answer": after the question
                    switch (findPatternFrom(chars, qValueEnd, "\"answer\"")) {
                      case null {
                        i := qValueEnd + 1;
                      };
                      case (?aPos) {
                        // Find the value after "answer":
                        switch (findValueStart(chars, aPos + 8)) {
                          case null {
                            i := aPos + 1;
                          };
                          case (?aValueStart) {
                            switch (findStringEnd(chars, aValueStart)) {
                              case null {
                                i := aPos + 1;
                              };
                              case (?aValueEnd) {
                                let currentAnswer = extractString(chars, aValueStart, aValueEnd);

                                // Add both question and answer to result if answer is not empty
                                if (currentAnswer != "") {
                                  result #= ",{\"role\":\"user\",\"content\":\"" # escapeJSON(currentQuestion) # "\"}";
                                  result #= ",{\"role\":\"assistant\",\"content\":\"" # escapeJSON(currentAnswer) # "\"}";
                                  messageCount += 2;
                                };

                                i := aValueEnd + 1;
                              };
                            };
                          };
                        };
                      };
                    };
                  };
                };
              };
            };
          };
        };
      };

      result;
    };

    // Find a pattern starting from position start
    private func findPatternFrom(chars: [Char], start: Nat, pattern: Text) : ?Nat {
      let patternChars = Iter.toArray(pattern.chars());
      var i = start;
      while (i <= chars.size() - patternChars.size()) {
        var match = true;
        var j = 0;
        while (j < patternChars.size()) {
          if (chars[i + j] != patternChars[j]) {
            match := false;
            j := patternChars.size();
          };
          j += 1;
        };
        if (match) {
          return ?i;
        };
        i += 1;
      };
      null;
    };

    // Find the start of a JSON string value (after : and optional whitespace)
    private func findValueStart(chars: [Char], fromPos: Nat) : ?Nat {
      var i = fromPos;
      // Skip to colon
      while (i < chars.size() and chars[i] != ':') {
        i += 1;
      };
      if (i >= chars.size()) return null;
      i += 1; // Skip colon

      // Skip whitespace
      while (i < chars.size() and (chars[i] == ' ' or chars[i] == '\t' or chars[i] == '\n' or chars[i] == '\r')) {
        i += 1;
      };
      if (i >= chars.size()) return null;

      // Should be at opening quote
      if (chars[i] == '\"') {
        return ?(i + 1);
      };
      null;
    };

    // Find the end of a JSON string value (closing quote, accounting for escapes)
    private func findStringEnd(chars: [Char], fromPos: Nat) : ?Nat {
      var i = fromPos;
      var escaped = false;
      while (i < chars.size()) {
        if (escaped) {
          escaped := false;
        } else if (chars[i] == '\\') {
          escaped := true;
        } else if (chars[i] == '\"') {
          return ?i;
        };
        i += 1;
      };
      null;
    };

    // Extract string from chars array
    private func extractString(chars: [Char], start: Nat, end: Nat) : Text {
      var result = "";
      var i = start;
      var escaped = false;
      while (i < end) {
        let c = chars[i];
        if (escaped) {
          result #= switch (c) {
            case ('n') { "\n" };
            case ('r') { "\r" };
            case ('t') { "\t" };
            case ('\"') { "\"" };
            case ('\\') { "\\" };
            case _ { Text.fromChar(c) };
          };
          escaped := false;
        } else if (c == '\\') {
          escaped := true;
        } else {
          result #= Text.fromChar(c);
        };
        i += 1;
      };
      result;
    };

  };

  // Simple JSON encoder - escapes special characters
  private func escapeJSON(text: Text) : Text {
    var result = "";
    for (char in text.chars()) {
      result #= switch (char) {
        case ('\"') { "\\\"" };
        case ('\\') { "\\\\" };
        case ('\n') { "\\n" };
        case ('\r') { "\\r" };
        case ('\t') { "\\t" };
        case _ { Text.fromChar(char) };
      };
    };
    result;
  };

  // Find pattern in text, returns index or null
  private func textIndexOf(text: Text, pattern: Text) : ?Nat {
    let textChars = Iter.toArray(text.chars());
    let patternChars = Iter.toArray(pattern.chars());

    if (patternChars.size() == 0 or patternChars.size() > textChars.size()) {
      return null;
    };

    var i = 0;
    while (i <= textChars.size() - patternChars.size()) {
      var match = true;
      var j = 0;
      while (j < patternChars.size()) {
        if (textChars[i + j] != patternChars[j]) {
          match := false;
          j := patternChars.size(); // break inner loop
        };
        j += 1;
      };
      if (match) {
        return ?i;
      };
      i += 1;
    };
    null;
  };

  // Extract substring from text
  private func textSubstring(text: Text, start: Nat, end: Nat) : Text {
    let chars = Iter.toArray(text.chars());
    if (start >= chars.size()) return "";
    let endIdx = if (end > chars.size()) chars.size() else end;
    var result = "";
    var i = start;
    while (i < endIdx) {
      result #= Text.fromChar(chars[i]);
      i += 1;
    };
    result;
  };

  // Simple JSON parser - extracts "content" from OpenAI response
  // Looks for the pattern: "content":"value"
  private func extractContentFromOpenAIResponse(json: Text) : ?Text {
    // Find "content" field
    let ?contentPos = textIndexOf(json, "\"content\"") else return null;

    // Find the colon after "content"
    let afterContent = textSubstring(json, contentPos + 9, json.size()); // 9 = length of "content"
    let ?colonPos = textIndexOf(afterContent, ":") else return null;

    // Skip whitespace and find the opening quote
    let afterColon = textSubstring(afterContent, colonPos + 1, afterContent.size());
    let afterColonChars = Iter.toArray(afterColon.chars());
    var quotePos : ?Nat = null;
    label findQuote for (i in Iter.range(0, afterColonChars.size() - 1)) {
      let c = afterColonChars[i];
      if (c != ' ' and c != '\t' and c != '\n' and c != '\r') {
        if (c == '\"') {
          quotePos := ?i;
        };
        break findQuote;
      };
    };

    let ?qPos = quotePos else return null;

    // Extract the string value until the closing quote
    var result = "";
    var escaped = false;
    var i = qPos + 1;
    while (i < afterColonChars.size()) {
      let c = afterColonChars[i];
      if (escaped) {
        result #= switch (c) {
          case ('n') { "\n" };
          case ('r') { "\r" };
          case ('t') { "\t" };
          case ('\"') { "\"" };
          case ('\\') { "\\" };
          case _ { Text.fromChar(c) };
        };
        escaped := false;
      } else if (c == '\\') {
        escaped := true;
      } else if (c == '\"') {
        return ?result;
      } else {
        result #= Text.fromChar(c);
      };
      i += 1;
    };

    null;
  };

}