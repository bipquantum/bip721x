set -ex

ADMIN_PRINCIPAL=$(dfx identity get-principal)

# Create all canisters
dfx canister create --all

BACKEND_CANISTER=$(dfx canister id backend)

# Deploy all canisters
dfx deploy icrc7 --mode reinstall --argument 'record {
  icrc7_args = opt opt record {
    symbol = opt "IP" : opt text;
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

dfx deploy backend

dfx canister call backend init_controller
