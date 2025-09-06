set -ex

dfx identity use default
DEPLOYER_PRINCIPAL=$(dfx identity get-principal)
DEPLOYER_ACCOUNT_ID=$(dfx ledger account-id)

# Create all canisters
dfx canister create --all

BACKEND_CANISTER=$(dfx canister id backend)
FAUCET_CANISTER=$(dfx canister id faucet)
BQC_LEDGER_CANISTER=$(dfx canister id bqc_ledger)
CKBTC_LEDGER_CANISTER=$(dfx canister id ckbtc_ledger)

BQC_LOGO=$(base64 -w 0 ./src/frontend/assets/logobqc.png)
CKBTC_USD_RATE=10_833_200_000_000  # 1 ckBTC = 108,332 USD (price in e8s)

# Deploy all independent canisters
#
#dfx deploy bip721_ledger --argument 'record {
#  deployer = principal "'${BACKEND_CANISTER}'";
#}' & 
#dfx deploy bqc_ledger --argument 'record {
#  minting_account = record {
#    owner = principal "'${FAUCET_CANISTER}'";
#    subaccount = null;
#  };
#  logo = opt "data:image/png;base64,'${BQC_LOGO}'";
#}' & 
#dfx deploy ckbtc_ledger --argument '(
#  variant {
#    Init = record {
#      decimals = opt (8 : nat8);
#      token_symbol = "ckBTC";
#      token_name = "ckBTC";
#      max_memo_length = null;
#      feature_flags = null;
#      transfer_fee = 10 : nat;
#      metadata = (
#        vec {
#          record {
#            "icrc1:logo";
#            variant {
#              Text = "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTQ2IiBoZWlnaHQ9IjE0NiIgdmlld0JveD0iMCAwIDE0NiAxNDYiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIxNDYiIGhlaWdodD0iMTQ2IiByeD0iNzMiIGZpbGw9IiMzQjAwQjkiLz4KPHBhdGggZmlsbC1ydWxlPSJldmVub2RkIiBjbGlwLXJ1bGU9ImV2ZW5vZGQiIGQ9Ik0xNi4zODM3IDc3LjIwNTJDMTguNDM0IDEwNS4yMDYgNDAuNzk0IDEyNy41NjYgNjguNzk0OSAxMjkuNjE2VjEzNS45MzlDMzcuMzA4NyAxMzMuODY3IDEyLjEzMyAxMDguNjkxIDEwLjA2MDUgNzcuMjA1MkgxNi4zODM3WiIgZmlsbD0idXJsKCNwYWludDBfbGluZWFyXzExMF81NzIpIi8+CjxwYXRoIGZpbGwtcnVsZT0iZXZlbm9kZCIgY2xpcC1ydWxlPSJldmVub2RkIiBkPSJNNjguNzY0NiAxNi4zNTM0QzQwLjc2MzggMTguNDAzNiAxOC40MDM3IDQwLjc2MzcgMTYuMzUzNSA2OC43NjQ2TDEwLjAzMDMgNjguNzY0NkMxMi4xMDI3IDM3LjI3ODQgMzcuMjc4NSAxMi4xMDI2IDY4Ljc2NDYgMTAuMDMwMkw2OC43NjQ2IDE2LjM1MzRaIiBmaWxsPSIjMjlBQkUyIi8+CjxwYXRoIGZpbGwtcnVsZT0iZXZlbm9kZCIgY2xpcC1ydWxlPSJldmVub2RkIiBkPSJNMTI5LjYxNiA2OC43MzQzQzEyNy41NjYgNDAuNzMzNSAxMDUuMjA2IDE4LjM3MzQgNzcuMjA1MSAxNi4zMjMyTDc3LjIwNTEgMTBDMTA4LjY5MSAxMi4wNzI0IDEzMy44NjcgMzcuMjQ4MiAxMzUuOTM5IDY4LjczNDNMMTI5LjYxNiA2OC43MzQzWiIgZmlsbD0idXJsKCNwYWludDFfbGluZWFyXzExMF81NzIpIi8+CjxwYXRoIGZpbGwtcnVsZT0iZXZlbm9kZCIgY2xpcC1ydWxlPSJldmVub2RkIiBkPSJNNzcuMjM1NCAxMjkuNTg2QzEwNS4yMzYgMTI3LjUzNiAxMjcuNTk2IDEwNS4xNzYgMTI5LjY0NyA3Ny4xNzQ5TDEzNS45NyA3Ny4xNzQ5QzEzMy44OTcgMTA4LjY2MSAxMDguNzIyIDEzMy44MzcgNzcuMjM1NCAxMzUuOTA5TDc3LjIzNTQgMTI5LjU4NloiIGZpbGw9IiMyOUFCRTIiLz4KPHBhdGggZD0iTTk5LjgyMTcgNjQuNzI0NUMxMDEuMDE0IDU2Ljc1MzggOTQuOTQ0NyA1Mi40Njg5IDg2LjY0NTUgNDkuNjEwNEw4OS4zMzc2IDM4LjgxM0w4Mi43NjQ1IDM3LjE3NUw4MC4xNDM1IDQ3LjY4NzlDNzguNDE1NSA0Ny4yNTczIDc2LjY0MDYgNDYuODUxMSA3NC44NzcxIDQ2LjQ0ODdMNzcuNTE2OCAzNS44NjY1TDcwLjk0NzQgMzQuMjI4NUw2OC4yNTM0IDQ1LjAyMjJDNjYuODIzIDQ0LjY5NjUgNjUuNDE4OSA0NC4zNzQ2IDY0LjA1NiA0NC4wMzU3TDY0LjA2MzUgNDQuMDAyTDU0Ljk5ODUgNDEuNzM4OEw1My4yNDk5IDQ4Ljc1ODZDNTMuMjQ5OSA0OC43NTg2IDU4LjEyNjkgNDkuODc2MiA1OC4wMjM5IDQ5Ljk0NTRDNjAuNjg2MSA1MC42MSA2MS4xNjcyIDUyLjM3MTUgNjEuMDg2NyA1My43NjhDNTguNjI3IDYzLjYzNDUgNTYuMTcyMSA3My40Nzg4IDUzLjcxMDQgODMuMzQ2N0M1My4zODQ3IDg0LjE1NTQgNTIuNTU5MSA4NS4zNjg0IDUwLjY5ODIgODQuOTA3OUM1MC43NjM3IDg1LjAwMzQgNDUuOTIwNCA4My43MTU1IDQ1LjkyMDQgODMuNzE1NUw0Mi42NTcyIDkxLjIzODlMNTEuMjExMSA5My4zNzFDNTIuODAyNSA5My43Njk3IDU0LjM2MTkgOTQuMTg3MiA1NS44OTcxIDk0LjU4MDNMNTMuMTc2OSAxMDUuNTAxTDU5Ljc0MjYgMTA3LjEzOUw2Mi40MzY2IDk2LjMzNDNDNjQuMjMwMSA5Ni44MjEgNjUuOTcxMiA5Ny4yNzAzIDY3LjY3NDkgOTcuNjkzNEw2NC45OTAyIDEwOC40NDhMNzEuNTYzNCAxMTAuMDg2TDc0LjI4MzYgOTkuMTg1M0M4NS40OTIyIDEwMS4zMDYgOTMuOTIwNyAxMDAuNDUxIDk3LjQ2ODQgOTAuMzE0MUMxMDAuMzI3IDgyLjE1MjQgOTcuMzI2MSA3Ny40NDQ1IDkxLjQyODggNzQuMzc0NUM5NS43MjM2IDczLjM4NDIgOTguOTU4NiA3MC41NTk0IDk5LjgyMTcgNjQuNzI0NVpNODQuODAzMiA4NS43ODIxQzgyLjc3MiA5My45NDM4IDY5LjAyODQgODkuNTMxNiA2NC41NzI3IDg4LjQyNTNMNjguMTgyMiA3My45NTdDNzIuNjM4IDc1LjA2ODkgODYuOTI2MyA3Ny4yNzA0IDg0LjgwMzIgODUuNzgyMVpNODYuODM2NCA2NC42MDY2Qzg0Ljk4MyA3Mi4wMzA3IDczLjU0NDEgNjguMjU4OCA2OS44MzM1IDY3LjMzNEw3My4xMDYgNTQuMjExN0M3Ni44MTY2IDU1LjEzNjQgODguNzY2NiA1Ni44NjIzIDg2LjgzNjQgNjQuNjA2NloiIGZpbGw9IndoaXRlIi8+CjxkZWZzPgo8bGluZWFyR3JhZGllbnQgaWQ9InBhaW50MF9saW5lYXJfMTEwXzU3MiIgeDE9IjUzLjQ3MzYiIHkxPSIxMjIuNzkiIHgyPSIxNC4wMzYyIiB5Mj0iODkuNTc4NiIgZ3JhZGllbnRVbml0cz0idXNlclNwYWNlT25Vc2UiPgo8c3RvcCBvZmZzZXQ9IjAuMjEiIHN0b3AtY29sb3I9IiNFRDFFNzkiLz4KPHN0b3Agb2Zmc2V0PSIxIiBzdG9wLWNvbG9yPSIjNTIyNzg1Ii8+CjwvbGluZWFyR3JhZGllbnQ+CjxsaW5lYXJHcmFkaWVudCBpZD0icGFpbnQxX2xpbmVhcl8xMTBfNTcyIiB4MT0iMTIwLjY1IiB5MT0iNTUuNjAyMSIgeDI9IjgxLjIxMyIgeTI9IjIyLjM5MTQiIGdyYWRpZW50VW5pdHM9InVzZXJTcGFjZU9uVXNlIj4KPHN0b3Agb2Zmc2V0PSIwLjIxIiBzdG9wLWNvbG9yPSIjRjE1QTI0Ii8+CjxzdG9wIG9mZnNldD0iMC42ODQxIiBzdG9wLWNvbG9yPSIjRkJCMDNCIi8+CjwvbGluZWFyR3JhZGllbnQ+CjwvZGVmcz4KPC9zdmc+Cg=="
#            };
#          };
#          record { "icrc103:public_allowances"; variant { Text = "true" } };
#          record { "icrc103:max_take_value"; variant { Nat = 500 : nat } };
#        }
#      );
#      minting_account = record {
#        owner = principal "'${FAUCET_CANISTER}'";
#        subaccount = null;
#      };
#      initial_balances = vec {};
#      fee_collector_account = null;
#      archive_options = record {
#        num_blocks_to_archive = 5_000 : nat64;
#        max_transactions_per_response = null;
#        trigger_threshold = 10_000 : nat64;
#        more_controller_ids = null;
#        max_message_size_bytes = null;
#        cycles_for_archive_creation = null;
#        node_max_memory_size_bytes = null;
#        controller_id = principal "'${DEPLOYER_PRINCIPAL}'";
#      };
#    }
#  }
#)' & 
#dfx deploy faucet --argument '( record {
#  canister_ids = record {
#    bqc_ledger = principal "'${BQC_LEDGER_CANISTER}'";
#    ckbtc_ledger = principal "'${CKBTC_LEDGER_CANISTER}'";
#  };
#})' & 
#dfx deploy idempotent_proxy_canister --argument "(opt variant {Init =
#  record {
#    ecdsa_key_name = \"dfx_test_key\";
#    proxy_token_refresh_interval = 3600;
#    subnet_size = 13;
#    service_fee = 10_000_000;
#  }
#})" &
## 1 ckBTC = 108,332 USD (price in e8s)
#dfx deploy exchange_rate --argument '( record {
#  ckbtcUsdRate = '${CKBTC_USD_RATE}' : nat64;
#})' &
#wait
#
## Idempotent proxy
#dfx canister call idempotent_proxy_canister admin_set_agents '
#  (vec {
#    record {
#      name = "bIPQuantumWorker";
#      endpoint = "https://idempotent-proxy-cf-worker.bipquantum.workers.dev";
#      max_cycles = 30000000000;
#      proxy_token = null;
#    };
#  })
#'
#dfx canister call idempotent_proxy_canister admin_add_managers '(vec {principal "'${BACKEND_CANISTER}'"})'
#dfx canister call idempotent_proxy_canister admin_add_callers '(vec {principal "'${BACKEND_CANISTER}'"})'
#
## Internet identity
#dfx deps pull
#dfx deps init
#dfx deps deploy internet_identity

# Backend
dfx deploy backend --argument 'variant {
  init = record { 
    e8sTransferFee = 10;
    airdrop_per_user = 100_000_000_000;
    admin = principal "'${DEPLOYER_PRINCIPAL}'";
    chatbot_api_key = "'${CHATBOT_API_KEY}'";
    ckbtc_usd_price = '${CKBTC_USD_RATE}' : nat64;
  }
}'
dfx canister call backend init_controller

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
