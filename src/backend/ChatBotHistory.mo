import Types "Types";

import Map               "mo:map/Map";
import Set               "mo:map/Set";

import Principal         "mo:base/Principal";
import Result            "mo:base/Result";
import Buffer            "mo:base/Buffer";

module {

  type Result<Ok, Err>     = Result.Result<Ok, Err>;
  type ChatHistory         = Types.ChatHistory;
  type ChatHistories       = Types.ChatHistories;

  public class ChatBotHistory({ chatHistories: ChatHistories }) {

    public func getChatHistories({
      caller: Principal;
    }) : [ChatHistory] {
      let ids = switch(Map.get(chatHistories.byPrincipal, Map.phash, caller)){
        case(null) { Set.new<Text>(); };
        case(?k) { k; };
      };

      let buffer = Buffer.Buffer<ChatHistory>(ids.size());

      for (id in Set.keys(ids)){
        switch(Map.get(chatHistories.histories, Map.thash, id)){
          case(null) { };
          case(?hist) { buffer.add(hist); };
        };
      };

      Buffer.toArray(buffer);
    };

    public func getChatHistory({
      caller: Principal;
      id: Text;
    }) : Result<ChatHistory, Text> {

      if (Principal.isAnonymous(caller)){
        return #err("Cannot get a chat history with from anonymous principal");
      };

      let ids = switch(Map.get(chatHistories.byPrincipal, Map.phash, caller)){
        case(null) { Set.new<Text>(); };
        case(?k) { k; };
      };

      if (not Set.has(ids, Set.thash, id)){
        return #err("Chat history not found");
      };

      switch(Map.get(chatHistories.histories, Map.thash, id)){
        case(null) { #err("Chat history not found"); };
        case(?h) { #ok(h); };
      };
    };

    public func deleteChatHistory({
      caller: Principal;
      id: Text;
    }) : Result<(), Text> {

      if (Principal.isAnonymous(caller)){
        return #err("Cannot get a chat history with from anonymous principal");
      };

      let ids = switch(Map.get(chatHistories.byPrincipal, Map.phash, caller)){
        case(null) { Set.new<Text>(); };
        case(?k) { k; };
      };

      if (not Set.has(ids, Set.thash, id)){
        return #err("Chat history not found");
      };

      Map.delete(chatHistories.histories, Map.thash, id);
      Set.delete(ids, Set.thash, id);
      Map.set(chatHistories.byPrincipal, Map.phash, caller, ids);
      #ok;
    };

    public func setChatHistory({
      caller: Principal;
      id: Text;
      history: Text;
    }) : Result<(), Text> {

      if (Principal.isAnonymous(caller)){
        return #err("Cannot get a chat history with from anonymous principal");
      };

      let ids = switch(Map.get(chatHistories.byPrincipal, Map.phash, caller)){
        case(null) { Set.new<Text>(); };
        case(?k) { k; };
      };

      // Add it to the user's chat history list if it's not already there
      if (not Set.has(ids, Set.thash, id)){
        Set.add(ids, Set.thash, id);
        Map.set(chatHistories.byPrincipal, Map.phash, caller, ids);
      };

      Map.set(chatHistories.histories, Map.thash, id, {id; history});
      #ok;
    };

  };

};