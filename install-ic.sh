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
# TODO sardariuss 2024-09-25: multiply interval by 2, divide fee by 2
dfx deploy idempotent_proxy_canister  --argument "(opt variant {Upgrade =
  record {
    proxy_token_refresh_interval = opt 86_400;
    subnet_size = opt 13;
    service_fee = opt 10_000_000;
  }
})" --ic --upgrade-unchanged

# TODO sardariuss 2024-09-25: Deploy our own cf proxy
dfx canister call idempotent_proxy_canister admin_set_agents '
  (vec {
    record {
      name = "LDCLabs";
      endpoint = "https://idempotent-proxy-cf-worker.zensh.workers.dev";
      max_cycles = 30000000000;
      proxy_token = null;
    };
  })
' --ic

dfx canister call idempotent_proxy_canister admin_add_managers '(vec {principal "'${BACKEND_CANISTER}'"})' --ic

dfx canister call idempotent_proxy_canister admin_add_callers '(vec {principal "'${BACKEND_CANISTER}'"})' --ic

dfx deploy backend --ic --argument 'variant {
  init = record { e8sTransferFee = 10; }
}'

dfx canister call backend init_controller --ic

dfx deploy frontend --ic
