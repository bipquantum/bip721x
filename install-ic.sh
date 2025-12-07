set -ex

dfx identity use first_deployement

BACKEND_CANISTER=$(dfx canister id backend --ic)

# Deploy all canisters
dfx deploy icrc7 --ic --argument 'record {
  icrc7_args = opt opt record {
    symbol = opt "bIP721" : opt text;
    name = opt "Intellectual Property" : opt text;
    description = opt "A Collection of Intellectual Property by BipQuantum" : opt text;
    logo = null : opt text;
    supply_cap = null : opt nat;
    allow_transfers = null : opt bool;
    max_query_batch_size = opt 100 : opt nat;
    max_update_batch_size = opt 100 : opt nat;
    default_take_value = opt 1000 : opt nat;
    max_take_value = opt 10000 : opt nat;
    max_memo_size = opt 512 : opt nat;
    permitted_drift = null : opt nat;
    tx_window = null : opt nat;
    burn_account = null;
    deployer = principal "'${BACKEND_CANISTER}'";
    supported_standards = null;
  };
  icrc37_args = null;
  icrc3_args = null;
}'

# Backend
STRIPE_PREMIUM_MONTHLY_LINK="plink_1SXSclFdNkpYWKD6M7LBCrGb"

dfx deploy backend --argument 'variant {
  init = record {
    airdrop_per_user = 100_000_000_000;
    admin = principal "'${DEPLOYER_PRINCIPAL}'";
    chatbot_api_key = "'${CHATBOT_API_KEY}'";
    ckusdt_rate = record {
      usd_price = '${CKUSDT_USD_PRICE}' : nat64;
      decimals = '${CKUSDT_DECIMALS}' : nat32;
    };
    ckusdt_transfer_fee = '${CKUSDT_TRANSFER_FEE}' : nat;
    subscriptions = record {
      plans = vec {
        record {
          id = "free";
          name = "Free Always";
          intervalCredits = 10_000 : nat;
          renewalPriceUsdtE6s = 0 : nat;
          renewalInterval = variant { Months = 1 : nat };
          numberInterval = null;
          stripePaymentLink = null;
        };
        record {
          id = "premium_monthly";
          name = "Premium Monthly";
          intervalCredits = 2_000_000 : nat;
          renewalPriceUsdtE6s = 9_990_000 : nat;
          renewalInterval = variant { Months = 1 : nat };
          numberInterval = opt (12 : nat);
          stripePaymentLink = opt "'${STRIPE_PREMIUM_MONTHLY_LINK}'";
        };
      };
      free_plan_id = "free";
      grace_period_days = 7 : nat;
      subaccount = "subscriptions" : text;
    };
    stripe_secret_key = "'${STRIPE_LIVE_SECRET_KEY}'";
  }
}' --ic
dfx canister call backend init_model --ic

dfx deploy frontend --ic
