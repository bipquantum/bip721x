import Types          "Types";
import MigrationTypes "../Types";

import Map            "mo:map/Map";
import Set            "mo:map/Set";

import Debug          "mo:base/Debug";

module {

  type State         = MigrationTypes.State;
  type User          = Types.User;
  type ChatHistory   = Types.ChatHistory;
  type InitArgs      = Types.InitArgs;
  type UpgradeArgs   = Types.UpgradeArgs;
  type DowngradeArgs = Types.DowngradeArgs;

    public func init(args: InitArgs) : State {
        #v0_1_0({
            users = Map.new<Principal, User>();
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
                histories = Map.new<Text, ChatHistory>();
                byPrincipal = Map.new<Principal, Set.Set<Text>>();
            };
            e8sTransferFee = args.e8sTransferFee;
        });
    };

    // From nothing to 0.1.0
    public func upgrade(_: State, _: UpgradeArgs): State {
        Debug.trap("Cannot upgrade to initial version");
    };

    // From 0.1.0 to nothing
    public func downgrade(_: State, _: DowngradeArgs): State {
        Debug.trap("Cannot downgrade from initial version");
    };

};