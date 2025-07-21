import Map "mo:map/Map";
import Set "mo:map/Set";
import Current "./Types";
import Previous "../00-04-00-chatgpt_key/Types";

module {
  
  public func upgrade(prevState: Previous.State) : Current.State {
    {
      users = prevState.users;
      airdrop = prevState.airdrop;
      intProps = prevState.intProps;
      chatHistories = prevState.chatHistories;
      e8sTransferFee = prevState.e8sTransferFee;
      accessControl = prevState.accessControl;
      chatbot_api_key = prevState.chatbot_api_key;
      notifications = {
        var nextId = 0;
        byPrincipal = Map.new<Principal, [Current.Notification]>();
      };
    };
  };

  public func downgrade(currentState: Current.State) : Previous.State {
    {
      users = currentState.users;
      airdrop = currentState.airdrop;
      intProps = currentState.intProps;
      chatHistories = currentState.chatHistories;
      e8sTransferFee = currentState.e8sTransferFee;
      accessControl = currentState.accessControl;
      chatbot_api_key = currentState.chatbot_api_key;
    };
  };

};