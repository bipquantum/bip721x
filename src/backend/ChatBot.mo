import IdempotentProxy "canister:idempotent_proxy_canister";

import Cycles          "mo:base/ExperimentalCycles";
import Text            "mo:base/Text";

module {

  public type HttpResponse = IdempotentProxy.HttpResponse;

  public class ChatBot({
    chatbot_api_key: Text;
  }) {

    public func get_completion(body: Blob) : async* HttpResponse {

      // TODO: Temporary disabled
      {
        status = 403; // "Forbidden"
        body = Text.encodeUtf8("Request refused");
        headers = [
          { name = "Content-Type"; value = "text/plain; charset=UTF-8" }
        ];
      };

//      Cycles.add<system>(1_000_000_000); // TODO: sardariuss 2024-09-26: Find out precise cycles cost
//
//      await IdempotentProxy.proxy_http_request({
//        url = "https://api.openai.com/v1/chat/completions";
//        method = #post;
//        max_response_bytes = null;
//        body = ?body;
//        transform = null;
//        headers= [
//          { name = "idempotency-key"; value = "idempotency_key_001"       },
//          { name = "content-type"   ; value = "application/json"          },
//          { name = "Authorization"  ; value = "Bearer " # chatbot_api_key },
//        ];
//      });

    };
  };

}