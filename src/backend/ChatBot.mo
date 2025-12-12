import IC              "ic:aaaaa-aa";

import Cycles          "mo:base/ExperimentalCycles";
import Text            "mo:base/Text";
import Iter            "mo:base/Iter";
import Debug           "mo:base/Debug";
import Nat             "mo:base/Nat";
import Int             "mo:base/Int";
import Result          "mo:base/Result";
import Principal       "mo:base/Principal";
import Time            "mo:base/Time";

import Types                 "Types";
import SubscriptionManager   "SubscriptionManager";

module {

  let CHAT_INSTRUCTIONS = "You are an assistant designed to help the user answer questions on intellectual property (IP). Your are embedded in the BIPQuantum website, which is a platform that delivers digital certificate that leverages blockchain technology to provide secure and immutable proof of ownership and authenticity for intellectual properties. You will answer technical questions on IP and guide the user through the process of creating a new IP certificate. You won't answer questions that e not related to IP, blockchain, or the BIPQuantum platform.";
  let AUTH_KEY_TTL_SECONDS = 60;

  type Result<Ok, Err> = Result.Result<Ok, Err>;

  public class ChatBot({
    chatbot_api_key: Text;
    subscriptionManager: SubscriptionManager.SubscriptionManager;
  }) {

    public func getEphemeralToken({ caller: Principal }) : async* Result<Text, Text> {

      // Prevent users without credits from getting tokens
      if (subscriptionManager.getAvailableCredits(caller) <= 0) {
        return #err("Rate limit exceeded.");
      };

      // 1.1 Setup the URL
      let url = "https://api.openai.com/v1/realtime/client_secrets";

      // 1.2 Prepare headers
      let idempotencyKey = "ephemeral_token_" # Nat.toText(Int.abs(Time.now()));
      let headers = [
          { name = "idempotency-key"; value = idempotencyKey              },
          { name = "Authorization";   value = "Bearer " # chatbot_api_key },
          { name = "Content-Type";    value = "application/json"          }
        ];

      // 1.3 Prepare body
      let bodyJson =
        "{ " #
          "\"expires_after\": " #
            "{ \"anchor\": \"created_at\", " #
            "\"seconds\": " # Nat.toText(AUTH_KEY_TTL_SECONDS) # " }, " #
          "\"session\": { " #
            "\"type\": \"realtime\", " #
            "\"model\": \"gpt-realtime\", " #
            "\"output_modalities\": [\"text\"], " #
            "\"instructions\": \"" # escapeJSON(CHAT_INSTRUCTIONS) # "\" " #
          "} " #
        "}";
      Debug.print("Ephemeral token request body: " # bodyJson);
      let body = ?Text.encodeUtf8(bodyJson);

      // 1.4 Define the HTTP request
      let http_request : IC.http_request_args = {
        url;
        max_response_bytes = null;
        is_replicated = ?false; // single replica is fine
        headers;
        body;
        method = #post;
        transform = null;
      };

      // 2. Add cycles to pay for the HTTP request
      Cycles.add<system>(20_854_438_800);

      //3. MAKE HTTPS REQUEST AND WAIT FOR RESPONSE
      let http_response : IC.http_request_result = await IC.http_request(http_request);

      //4. DECODE THE RESPONSE BODY
      let decoded_text : Text = switch (Text.decodeUtf8(http_response.body)) {
        case (null) { return #err("Failed to decode API response"); };
        case (?y) { y; };
      };

      //5. CHECK RESPONSE STATUS
      if (http_response.status != 200) {
        return #err("OpenAI API returned status " # debug_show(http_response.status) # ": " # decoded_text);
      };

      Debug.print("Ephemeral token response status: " # debug_show(http_response.status));
      Debug.print("Ephemeral token response: " # decoded_text);

      #ok(decoded_text);
    };

  };

  // Simple JSON encoder - escapes special characters
  func escapeJSON(text: Text) : Text {
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

}