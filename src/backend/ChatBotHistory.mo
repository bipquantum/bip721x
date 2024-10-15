import Types "Types";

import Principal         "mo:base/Principal";
import Result            "mo:base/Result";
import Map               "mo:map/Map";

module {

  type ChatHistories       = Types.ChatHistories;
  type ChatHistory         = Types.ChatHistory;

  type Result<Ok, Err>     = Result.Result<Ok, Err>;

  public class ChatBotHistory({chatHistories: Map.Map<Principal, ChatHistories>}) {

    public func getChatHistory({
      caller: Principal;
      id: Nat;
    }) : Result<ChatHistory, Text> {

      if (Principal.isAnonymous(caller)){
        return #err("Cannot get a chat history with from anonymous principal");
      };

      let histories = switch(Map.get(chatHistories, Map.phash, caller)){
        case(null) { return #err("Chat history not found"); };
        case(?h) { h; };
      };

      switch(Map.get(histories.byIndex, Map.nhash, id)){
        case(null) { return #err("Chat history not found"); };
        case(?h) { return #ok(h); };
      };
    };

    public func createChatHistory({
      caller: Principal;
      history: Text;
    }) : Result<Nat, Text> {

      if (Principal.isAnonymous(caller)){
        return #err("Cannot create a chat history with from anonymous principal");
      };

      let histories = switch(Map.get(chatHistories, Map.phash, caller)){
        case(null) { 
          let h = { var index = 0; byIndex = Map.new<Nat, ChatHistory>(); }; 
          Map.set(chatHistories, Map.phash, caller, h);
          h;
        };
        case(?h) { h; };
      };

      let id = histories.index;
      Map.set(histories.byIndex, Map.nhash, id, { id; history; });
      histories.index += 1;

      #ok(id);
    };

    public func updateChatHistory({
      caller: Principal;
      id: Nat;
      history: Text;
    }) : Result<(), Text> {

      if (Principal.isAnonymous(caller)){
        return #err("Cannot update a chat history with from anonymous principal");
      };

      let histories = switch(Map.get(chatHistories, Map.phash, caller)){
        case(null) { return #err("Chat history not found"); };
        case(?h) { h; };
      };

      if (not Map.has(histories.byIndex, Map.nhash, id)){
        return #err("Chat history not found");
      };

      Map.set(histories.byIndex, Map.nhash, id, { id; history; });
      #ok;
    };

  };

};