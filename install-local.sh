set -ex

dfx identity use default
DEPLOYER_PRINCIPAL=$(dfx identity get-principal)
DEPLOYER_ACCOUNT_ID=$(dfx ledger account-id)

# Create all canisters
dfx canister create --all

BACKEND_CANISTER=$(dfx canister id backend)

# Deploy all canisters
dfx deploy icrc7 --argument 'record {
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
}' --mode=reinstall --yes

#dfx deploy --specified-id ryjl3-tyaaa-aaaaa-aaaba-cai icp_ledger --argument 'variant {
#  Init = record {
#    minting_account = "'${DEPLOYER_ACCOUNT_ID}'";
#    initial_values = vec {};
#    send_whitelist = vec {};
#    transfer_fee = opt record {
#      e8s = 10_000 : nat64;
#    };
#    token_symbol = opt "ICP";
#    token_name = opt "Internet Computer Protocol";
#  }
#}'

dfx deploy backend --mode=reinstall --yes

## Internet identity
#dfx deps pull
#dfx deps init
#dfx deps deploy internet_identity

dfx canister call backend init_controller

#dfx deploy frontend

dfx generate
