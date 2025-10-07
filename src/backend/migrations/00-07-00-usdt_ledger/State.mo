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
        var usd_price = args.ckusdt_rate.usd_price;
        var decimals = args.ckusdt_rate.decimals;
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

    // Get ckBTC USD price from previous state (e.g., 95000_00000000 for $95k BTC)
    // IMPORTANT: In v0.6, the rate had no decimals field, so we assume 8 decimals (e8s format)
    // This means rate = USD/BTC * 10^8
    let ckbtcE8sUsdRate = Nat64.toNat(state.ckbtcRate.usd_price);

    #v0_7_0({ state with
      e6sTransferFee = args.ckusdt_transfer_fee;
      ckusdtRate = {
        var usd_price = args.ckusdt_rate.usd_price;
        var decimals = args.ckusdt_rate.decimals;
        var last_update = Time.now();
      };
      intProps = {
        var index = state.intProps.index;
        // Convert all listed prices from ckBTC e8s to ckUSDT e6s
        // Formula: (btcE8sPrice * btcUsdRate) / 10^(8 + btcDecimals - 6)
        // Since v0.6 didn't store decimals, we assume btcDecimals = 8
        // Therefore: (btcE8sPrice * btcUsdRate) / 10^10 = usdtE6sPrice
        // Breakdown:
        //   - btcE8sPrice is BTC amount in e8s (BTC * 10^8)
        //   - btcUsdRate is USD/BTC rate with 8 decimals (USD/BTC * 10^8)
        //   - Multiplying gives: (BTC * 10^8) * (USD/BTC * 10^8) = USD * 10^16
        //   - We want e6s (USD * 10^6), so divide by 10^10
        // Example: If IP cost 0.001 BTC (100_000 e8s) and BTC=$95k (9_500_000_000_000 with 8 decimals):
        //   → (100_000 * 9_500_000_000_000) / 10_000_000_000 = 95_000_000 e6s = $95 USDT ✓
        e6sUsdtPrices = Map.map<Nat, Nat, Nat>(state.intProps.e8sBtcPrices, Map.nhash, func(key: Nat, btcE8sIpPrice: Nat): Nat {
          Int.abs(Float.toInt(Float.fromInt(btcE8sIpPrice * ckbtcE8sUsdRate) / 10_000_000_000.0));
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

    // Get ckUSDT USD price (should be ~1_000_000_000 for $1 USDT with 9 decimals)
    // Note: In v0.7, we store decimals alongside the rate
    // For downgrade, we don't use this rate (we use BTC/USD rate from args instead)
    let _ckusdtUsdRate = Nat64.toNat(state.ckusdtRate.usd_price);
    let _ckusdtDecimals = state.ckusdtRate.decimals;

    // Get BTC/USD rate for downgrade conversion (from args)
    let btcUsdRateE8s = Nat64.toNat(args.ckbtc_usd_price_e8s);

    #v0_6_0({ state with
      e8sTransferFee = args.ckbtc_transfer_fee;
      ckbtcRate = {
        var usd_price = args.ckbtc_usd_price_e8s;
        var last_update = Time.now();
      };
      intProps = {
        var index = state.intProps.index;
        // Convert all listed prices from ckUSDT e6s back to ckBTC e8s
        // Formula: (usdtE6sPrice * 10^(btcDecimals + 2)) / btcUsdRate
        // Since v0.6 expects 8 decimals (not stored), we use btcDecimals = 8
        // Therefore: (usdtE6sPrice * 10^10) / btcUsdRate = btcE8sPrice
        // Breakdown:
        //   - usdtE6sPrice is USD amount in e6s (USD * 10^6)
        //   - Multiply by 10^10 to get USD * 10^16
        //   - Divide by btcUsdRate (USD/BTC * 10^8) to get BTC * 10^8
        // Example: If IP cost 95 USDT (95_000_000 e6s) and BTC=$95k (9_500_000_000_000 with 8 decimals):
        //   → (95_000_000 * 10_000_000_000) / 9_500_000_000_000 = 100_000 e8s = 0.001 BTC ✓
        // Note: Assumes ckUSDT ≈ $1 and btcUsdRate has 8 decimals (as per v0.6 convention)
        e8sBtcPrices = Map.map<Nat, Nat, Nat>(state.intProps.e6sUsdtPrices, Map.nhash, func(key: Nat, usdtE6sIpPrice: Nat): Nat {
          Int.abs(Float.toInt(Float.fromInt(usdtE6sIpPrice) * 10_000_000_000.0 / Float.fromInt(btcUsdRateE8s)));
        });
      };
    });
  };

};