import Controller "Controller";
import ChatBot "ChatBot";
import ChatBotHistory "ChatBotHistory";
import TradeManager "TradeManager";
import SubscriptionManager "SubscriptionManager";

import Types "Types";

module {

    type State = Types.State;

    public type Model = {
        controller: Controller.Controller;
        chatBotHistory: ChatBotHistory.ChatBotHistory;
        subscriptionManager: SubscriptionManager.SubscriptionManager;
    };

    public func build({ state: State; backendId: Principal; }) : Model {
        let chatBotHistory = ChatBotHistory.ChatBotHistory({
          chatHistories = state.chatHistories;
        });
        let subscriptionManager = SubscriptionManager.SubscriptionManager({ 
          register = state.subscription_register;
          backendId;
        });
        let controller = Controller.Controller({
          state with
          chatBotHistory;
          tradeManager = TradeManager.TradeManager({
            stage_account = { owner = backendId; subaccount = null; };
            fee = state.e6sTransferFee;
          });
          chatBot = ChatBot.ChatBot({
            chatbot_api_key = state.chatbot_api_key;
            subscriptionManager;
          });
        });
        
        {
          controller;
          chatBotHistory;
          subscriptionManager;
        };
    };
};