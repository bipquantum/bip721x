import Map "mo:map/Map";
import Set "mo:map/Set";

import Current "./Types";
import Migration "./Migration";
import MigrationTypes "../Types";

module {

  // do not forget to change these types when you add a new migration
  type State = Current.State;
  type Args = Current.Args;
  type InitArgs = Current.InitArgs;
  type UpgradeArgs = Current.UpgradeArgs;
  type DowngradeArgs = Current.DowngradeArgs;

  public func init(args: InitArgs): MigrationTypes.State {
    #v0_5_0({
      users = Map.new<Principal, Current.User>();
      airdrop = {
        var allowed_per_user = args.airdrop_per_user;
        var total_distributed = 0;
        map_distributed = Map.new<Principal, Nat>();
      };
      intProps = {
        var index = 0;
        e8sIcpPrices = Map.new<Nat, Nat>();
      };
      chatHistories = {
        histories = Map.new<Text, Current.ChatHistory>();
        byPrincipal = Map.new<Principal, Set.Set<Text>>();
      };
      e8sTransferFee = args.e8sTransferFee;
      accessControl = {
        var admin = args.admin;
        moderators = Set.new<Principal>();
        bannedIps = Set.new<Nat>();
      };
      chatbot_api_key = args.chatbot_api_key;
      notifications = {
        var nextId = 0;
        byPrincipal = Map.new<Principal, [Current.Notification]>();
      };
    });
  };

  public func upgrade(prevState: MigrationTypes.State, args: UpgradeArgs): MigrationTypes.State {
    switch (prevState) {
      case (#v0_4_0(v0_4_0_state)) {
        #v0_5_0(Migration.upgrade(v0_4_0_state));
      };
      case (_) {
        prevState;
      };
    };
  };

  public func downgrade(prevState: MigrationTypes.State, args: DowngradeArgs): MigrationTypes.State {
    switch (prevState) {
      case (#v0_5_0(v0_5_0_state)) {
        #v0_4_0(Migration.downgrade(v0_5_0_state));
      };
      case (_) {
        prevState;
      };
    };
  };

};