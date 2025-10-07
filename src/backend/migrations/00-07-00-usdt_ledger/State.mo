import Map "mo:map/Map";
import Set "mo:map/Set";
import Debug "mo:base/Debug";
import Time "mo:base/Time";
import Int "mo:base/Int";
import Float "mo:base/Float";
import Nat64 "mo:base/Nat64";

import V0_7_0 "./Types";
import MigrationTypes "../Types";

module {

  // do not forget to change these types when you add a new migration
  type State = V0_7_0.State;
  type Args = V0_7_0.Args;
  type InitArgs = V0_7_0.InitArgs;
  type UpgradeArgs = V0_7_0.UpgradeArgs;
  type DowngradeArgs = V0_7_0.DowngradeArgs;

  public func init(args: InitArgs): MigrationTypes.State {
    #v0_7_0({
      users = Map.new<Principal, V0_7_0.User>();
      airdrop = {
        var allowed_per_user = args.airdrop_per_user;
        var total_distributed = 0;
        map_distributed = Map.new<Principal, Nat>();
      };
      intProps = {
        var index = 0;
        e6sUsdtPrices = Map.new<Nat, Nat>();
      };
      chatHistories = {
        histories = Map.new<Text, V0_7_0.ChatHistory>();
        byPrincipal = Map.new<Principal, Set.Set<Text>>();
      };
      e6sTransferFee = args.ckusdt_transfer_fee;
      accessControl = {
        var admin = args.admin;
        moderators = Set.new<Principal>();
        bannedIps = Set.new<Nat>();
      };
      chatbot_api_key = args.chatbot_api_key;
      notifications = {
        var nextId = 0;
        byPrincipal = Map.new<Principal, [V0_7_0.Notification]>();
      };
      ckusdtRate = {
        var usd_price = args.ckusdt_usd_price;
        var last_update = Time.now();
      };
    });
  };

  public func upgrade(migration_state: MigrationTypes.State, args: UpgradeArgs): MigrationTypes.State {
    // Access current state
    let state = switch(migration_state) {
      case (#v0_6_0(state)) state;
      case (_) Debug.trap("Unexpected migration state (v0_6_0 expected)") 
    };

    let ckbtcE8sUsdRate = Nat64.toNat(state.ckbtcRate.usd_price);

    #v0_7_0({ state with 
      e6sTransferFee = args.ckusdt_transfer_fee;
      ckusdtRate = {
        var usd_price = args.ckusdt_usd_price;
        var last_update = Time.now();
      };
      intProps = {
        var index = state.intProps.index;
        e6sUsdtPrices = Map.map<Nat, Nat, Nat>(state.intProps.e8sBtcPrices, Map.nhash, func(key: Nat, btcE8sIpPrice: Nat): Nat {
          Int.abs(Float.toInt(Float.fromInt(btcE8sIpPrice * ckbtcE8sUsdRate * 100)));
        });
      };
    });
  };

  public func downgrade(migration_state: MigrationTypes.State, args: DowngradeArgs): MigrationTypes.State {
    // Access current state
    let state = switch (migration_state) {
      case (#v0_7_0(state)) state;
      case (_) Debug.trap("Unexpected migration state (v0_7_0 expected)") 
    };

    let ckusdtE6sUsdRate = Nat64.toNat(state.ckusdtRate.usd_price);

    #v0_6_0({ state with 
      e8sTransferFee = args.ckbtc_transfer_fee;
      ckbtcRate = {
        var usd_price = args.ckbtc_usd_price;
        var last_update = Time.now();
      };
      intProps = {
        var index = state.intProps.index;
        e8sBtcPrices = Map.map<Nat, Nat, Nat>(state.intProps.e6sUsdtPrices, Map.nhash, func(key: Nat, usdtE6sIpPrice: Nat): Nat {
          Int.abs(Float.toInt(Float.fromInt(usdtE6sIpPrice * ckusdtE6sUsdRate / 100)));
        });
      };
    });
  };

};