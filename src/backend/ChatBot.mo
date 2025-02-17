import IdempotentProxy "canister:idempotent_proxy_canister";

import Cycles          "mo:base/ExperimentalCycles";

module {

  public type HttpResponse = IdempotentProxy.HttpResponse;

  public func get_completion(body: Blob) : async HttpResponse {

    Cycles.add<system>(1_000_000_000); // TODO: sardariuss 2024-09-26: Find out precise cycles cost

    // TODO: sardariuss 2024-10-31: Have the API key injected instead of hardcoding it
    await IdempotentProxy.proxy_http_request({
      url = "https://api.openai.com/v1/chat/completions";
      method = #post;
      max_response_bytes = null;
      body = ?body;
      transform = null;
      headers= [
        { name = "idempotency-key"; value = "idempotency_key_001"                                                                                                                                                         },
        { name = "content-type"   ; value = "application/json"                                                                                                                                                            },
        { name = "Authorization"  ; value = "Bearer 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" },
      ];
    });

  };

}