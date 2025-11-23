set -ex

dfx identity use default
DEPLOYER_PRINCIPAL=$(dfx identity get-principal)
DEPLOYER_ACCOUNT_ID=$(dfx ledger account-id)

# Create all canisters
dfx canister create --all

BACKEND_CANISTER=$(dfx canister id backend)
FAUCET_CANISTER=$(dfx canister id faucet)
BQC_LEDGER_CANISTER=$(dfx canister id bqc_ledger)
CKUSDT_LEDGER_CANISTER=$(dfx canister id ckusdt_ledger)

BQC_LOGO=$(base64 -w 0 ./src/frontend/assets/logobqc.png)
# Exchange rate for ckUSDT/USD with 9 decimals (typical format from exchange_rate canister)
# 1_000_000_000 = 1.0 USD (with 9 decimals)
CKUSDT_USD_PRICE=1_000_000_000
CKUSDT_DECIMALS=9
CKUSDT_TRANSFER_FEE=10_000  # 10,000 e6s = 0.01 ckUSDT

# Deploy all independent canisters

dfx deploy bip721_ledger --argument 'record {
  deployer = principal "'${BACKEND_CANISTER}'";
}' & 
dfx deploy bqc_ledger --argument 'record {
  minting_account = record {
    owner = principal "'${FAUCET_CANISTER}'";
    subaccount = null;
  };
  logo = opt "data:image/png;base64,'${BQC_LOGO}'";
}' & 
dfx deploy ckusdt_ledger --argument '(
  variant {
    Init = record {
      decimals = opt (6 : nat8);
      token_symbol = "ckUSDT";
      token_name = "ckUSDT";
      max_memo_length = null;
      feature_flags = null;
      transfer_fee = '${CKUSDT_TRANSFER_FEE}' : nat;
      metadata = (
        vec {
          record {
            "icrc1:logo";
            variant {
              Text = "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzYwIiBoZWlnaHQ9IjM2MCIgdmlld0JveD0iMCAwIDM2MCAzNjAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxnIGNsaXAtcGF0aD0idXJsKCNjbGlwMF84NzZfNzEpIj4KPHBhdGggZD0iTTE4MCAwQzI3OS40IDAgMzYwIDgwLjYgMzYwIDE4MEMzNjAgMjc5LjQgMjc5LjQgMzYwIDE4MCAzNjBDODAuNiAzNjAgMCAyNzkuNCAwIDE4MEMwIDgwLjYgODAuNiAwIDE4MCAwWiIgZmlsbD0iIzNCMDBCOSIvPgo8cGF0aCBmaWxsLXJ1bGU9ImV2ZW5vZGQiIGNsaXAtcnVsZT0iZXZlbm9kZCIgZD0iTTQwLjQwMDEgMTkwLjQwMkM0NS40MDAxIDI1OS40MDIgMTAwLjYgMzE0LjYwMiAxNjkuNiAzMTkuNjAyVjMzNS4yMDJDOTIuMDAwMSAzMzAuMDAyIDMwIDI2OC4wMDIgMjQuOCAxOTAuNDAySDQwLjQwMDFaIiBmaWxsPSJ1cmwoI3BhaW50MF9saW5lYXJfODc2XzcxKSIvPgo8cGF0aCBmaWxsLXJ1bGU9ImV2ZW5vZGQiIGNsaXAtcnVsZT0iZXZlbm9kZCIgZD0iTTE2OS42IDQwLjQwMDhDMTAwLjYgNDUuNDAwOCA0NS40MDAxIDEwMC42MDEgNDAuNDAwMSAxNjkuNjAxSDI0LjhDMjkuOCA5Mi4wMDA4IDkyLjAwMDEgMjkuODAwOCAxNjkuNiAyNC44MDA4VjQwLjQwMDhaIiBmaWxsPSIjMjlBQkUyIi8+CjxwYXRoIGZpbGwtcnVsZT0iZXZlbm9kZCIgY2xpcC1ydWxlPSJldmVub2RkIiBkPSJNMzE5LjYgMTY5LjQwMkMzMTQuNiAxMDAuNDAyIDI1OS40IDQ1LjIwMTYgMTkwLjQgNDAuMjAxNlYyNC42MDE2QzI2OCAyOS44MDE2IDMzMC4yIDkxLjgwMTYgMzM1LjIgMTY5LjQwMkgzMTkuNloiIGZpbGw9InVybCgjcGFpbnQxX2xpbmVhcl84NzZfNzEpIi8+CjxwYXRoIGZpbGwtcnVsZT0iZXZlbm9kZCIgY2xpcC1ydWxlPSJldmVub2RkIiBkPSJNMTkwLjQgMzE5LjYwMkMyNTkuNCAzMTQuNjAyIDMxNC42IDI1OS40MDIgMzE5LjYgMTkwLjQwMkgzMzUuMkMzMzAuMiAyNjguMDAyIDI2OCAzMzAuMDAyIDE5MC40IDMzNS4yMDJWMzE5LjYwMloiIGZpbGw9IiMyOUFCRTIiLz4KPHBhdGggZmlsbC1ydWxlPSJldmVub2RkIiBjbGlwLXJ1bGU9ImV2ZW5vZGQiIGQ9Ik0xOTUuODAxIDE4NS40MDdDMTk0LjkxNCAxODUuNDc0IDE5MC4zMzQgMTg1Ljc0OCAxODAuMTE5IDE4NS43NDhDMTcxLjk5MyAxODUuNzQ4IDE2Ni4yMjQgMTg1LjUwNCAxNjQuMiAxODUuNDA3QzEzMi43OTkgMTg0LjAyMyAxMDkuMzYxIDE3OC41NDUgMTA5LjM2MSAxNzEuOTg3QzEwOS4zNjEgMTY1LjQyOCAxMzIuNzk5IDE1OS45NTggMTY0LjIgMTU4LjU1MVYxNzkuOTUyQzE2Ni4yNTQgMTgwLjEgMTcyLjEzMyAxODAuNDQ4IDE4MC4yNTkgMTgwLjQ0OEMxOTAuMDA5IDE4MC40NDggMTk0Ljg5MiAxODAuMDQxIDE5NS43NzEgMTc5Ljk1OVYxNTguNTY2QzIyNy4xMDUgMTU5Ljk2NSAyNTAuNDkyIDE2NS40NDMgMjUwLjQ5MiAxNzEuOTg3QzI1MC40OTIgMTc4LjUzMSAyMjcuMTEzIDE4NC4wMDggMTk1Ljc3MSAxODUuNEwxOTUuODAxIDE4NS40MDdaTTE5NS44MDEgMTU2LjM1M1YxMzcuMjAzSDIzOS41M1YxMDhIMTIwLjQ3MVYxMzcuMjAzSDE2NC4xOTNWMTU2LjM0NUMxMjguNjU1IDE1Ny45ODEgMTAxLjkzIDE2NS4wMzYgMTAxLjkzIDE3My40OUMxMDEuOTMgMTgxLjk0MyAxMjguNjU1IDE4OC45OSAxNjQuMTkzIDE5MC42MzRWMjUySDE5NS43OTNWMTkwLjYxMUMyMzEuMjQ5IDE4OC45NzUgMjU3LjkzIDE4MS45MjggMjU3LjkzIDE3My40ODJDMjU3LjkzIDE2NS4wMzYgMjMxLjI3MiAxNTcuOTg5IDE5NS43OTMgMTU2LjM0NUwxOTUuODAxIDE1Ni4zNTNaIiBmaWxsPSJ3aGl0ZSIvPgo8L2c+CjxkZWZzPgo8bGluZWFyR3JhZGllbnQgaWQ9InBhaW50MF9saW5lYXJfODc2XzcxIiB4MT0iMTMwLjcyIiB5MT0iMzA0LjEyMiIgeDI9IjMzLjQ4IiB5Mj0iMjIyLjIyMiIgZ3JhZGllbnRVbml0cz0idXNlclNwYWNlT25Vc2UiPgo8c3RvcCBvZmZzZXQ9IjAuMjEiIHN0b3AtY29sb3I9IiNFRDFFNzkiLz4KPHN0b3Agb2Zmc2V0PSIxIiBzdG9wLWNvbG9yPSIjNTIyNzg1Ii8+CjwvbGluZWFyR3JhZGllbnQ+CjxsaW5lYXJHcmFkaWVudCBpZD0icGFpbnQxX2xpbmVhcl84NzZfNzEiIHgxPSIzMDkuMzIiIHkxPSIxMjMuMDYyIiB4Mj0iMjEyLjA4IiB5Mj0iNDEuMTYxNSIgZ3JhZGllbnRVbml0cz0idXNlclNwYWNlT25Vc2UiPgo8c3RvcCBvZmZzZXQ9IjAuMjEiIHN0b3AtY29sb3I9IiNGMTVBMjQiLz4KPHN0b3Agb2Zmc2V0PSIwLjY4IiBzdG9wLWNvbG9yPSIjRkJCMDNCIi8+CjwvbGluZWFyR3JhZGllbnQ+CjxjbGlwUGF0aCBpZD0iY2xpcDBfODc2XzcxIj4KPHJlY3Qgd2lkdGg9IjM2MCIgaGVpZ2h0PSIzNjAiIGZpbGw9IndoaXRlIi8+CjwvY2xpcFBhdGg+CjwvZGVmcz4KPC9zdmc+Cg=="
            };
          };
          record { "icrc103:public_allowances"; variant { Text = "true" } };
          record { "icrc103:max_take_value"; variant { Nat = 500 : nat } };
        }
      );
      minting_account = record {
        owner = principal "'${FAUCET_CANISTER}'";
        subaccount = null;
      };
      initial_balances = vec {};
      fee_collector_account = null;
      archive_options = record {
        num_blocks_to_archive = 5_000 : nat64;
        max_transactions_per_response = null;
        trigger_threshold = 10_000 : nat64;
        more_controller_ids = null;
        max_message_size_bytes = null;
        cycles_for_archive_creation = null;
        node_max_memory_size_bytes = null;
        controller_id = principal "'${DEPLOYER_PRINCIPAL}'";
      };
    }
  }
)' & 
dfx deploy faucet --argument '( record {
  canister_ids = record {
    bqc_ledger = principal "'${BQC_LEDGER_CANISTER}'";
    ckusdt_ledger = principal "'${CKUSDT_LEDGER_CANISTER}'";
  };
})' & 
dfx deploy idempotent_proxy_canister --argument "(opt variant {Init =
  record {
    ecdsa_key_name = \"dfx_test_key\";
    proxy_token_refresh_interval = 3600;
    subnet_size = 13;
    service_fee = 10_000_000;
  }
})" &
# Exchange rate canister initialization
dfx deploy exchange_rate --argument '( record {
  ckusdt_usd_price = '${CKUSDT_USD_PRICE}' : nat64;
  ckusdt_decimals = '${CKUSDT_DECIMALS}' : nat32;
})' &
wait

# Idempotent proxy
dfx canister call idempotent_proxy_canister admin_set_agents '
  (vec {
    record {
      name = "bIPQuantumWorker";
      endpoint = "https://idempotent-proxy-cf-worker.bipquantum.workers.dev";
      max_cycles = 30000000000;
      proxy_token = null;
    };
  })
'
dfx canister call idempotent_proxy_canister admin_add_managers '(vec {principal "'${BACKEND_CANISTER}'"})'
dfx canister call idempotent_proxy_canister admin_add_callers '(vec {principal "'${BACKEND_CANISTER}'"})'

# Internet identity
dfx deps pull
dfx deps init
dfx deps deploy internet_identity

# Backend
STRIPE_PREMIUM_MONTHLY_LINK="plink_1SUqfIEq6YsoiR2BzqKaTpQB"

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
    stripe_secret_key = "'${STRIPE_SECRET_KEY}'";
  }
}'
dfx canister call backend init_model

# Transfer BQC tokens to the backend for the airdrop
# 8 decimals, 1000 tokens per user, 1000 users
dfx canister call faucet mint_bqc '(
  record {
    to = record {
      owner = principal "'${BACKEND_CANISTER}'";
      subaccount = null;
    };
    amount = 100_000_000_000_000 : nat;
  },
)'

dfx deploy frontend

dfx generate
