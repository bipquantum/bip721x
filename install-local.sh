set -ex

dfx identity use default
DEPLOYER_PRINCIPAL=$(dfx identity get-principal)
DEPLOYER_ACCOUNT_ID=$(dfx ledger account-id)

# Create all canisters
dfx canister create --all

BACKEND_CANISTER=$(dfx canister id backend)

# Deploy all canisters

dfx deploy bip721_ledger --argument 'record {
  deployer = principal "'${BACKEND_CANISTER}'";
}'

dfx deploy bqc_ledger --argument 'record {
  minting_account = record {
    owner = principal "'${BACKEND_CANISTER}'";
    subaccount = null;
  };
}'

dfx deploy idempotent_proxy_canister --argument "(opt variant {Init =
  record {
    ecdsa_key_name = \"dfx_test_key\";
    proxy_token_refresh_interval = 3600;
    subnet_size = 13;
    service_fee = 10_000_000;
  }
})"

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

dfx deploy backend --argument 'variant {
  init = record { 
    e8sTransferFee = 10;
    airdrop_per_user = 100_000_000_000;
    admin = principal "'${DEPLOYER_PRINCIPAL}'";
    chatbot_api_key = "'${CHATBOT_API_KEY}'";
  }
}'

## Internet identity
dfx deps pull
dfx deps init
dfx deps deploy internet_identity

dfx canister call backend init_controller

dfx deploy frontend

dfx generate
