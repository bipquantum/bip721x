# Watchout: Running this scenario will only work once, because the token_id is hardcoded to 0

set -ex

dfx identity new alice --storage-mode=plaintext || true

dfx identity use alice

ALICE_PRINCIPAL=$(dfx identity get-principal)

dfx identity new bob --storage-mode=plaintext || true

dfx identity use bob

BOB_PRINCIPAL=$(dfx identity get-principal)

dfx identity use default

ADMIN_PRINCIPAL=$(dfx identity get-principal)

BACKEND_CANISTER=$(dfx canister id backend)

# Get accounts
ALICE_ACCOUNT=$(dfx canister call backend get_user_account "(
  record {
    user = principal \"$ALICE_PRINCIPAL\";
  }
)" --query | sed -e 's/^[(]//' -e 's/[)]$//' -e 's/},$/}/')
BOB_ACCOUNT=$(dfx canister call backend get_user_account "(
  record {
    user = principal \"$BOB_PRINCIPAL\";
  }
)" --query | sed -e 's/^[(]//' -e 's/[)]$//' -e 's/},$/}/')

# Get Name
dfx canister call icrc7 icrc7_name  --query 

# Get Symbol
dfx canister call icrc7 icrc7_symbol  --query 

# Get Description
dfx canister call icrc7 icrc7_description  --query 

# Get Logo
dfx canister call icrc7 icrc7_logo  --query

# Alice creates a new IP, sells it for 1 ICP
dfx identity use alice
dfx canister call backend create_int_prop "(
  record {
    title = \"Alice\'s awesome IP!\";
    e8sIcpPrice = 100_000_000 : nat;
    description = \"This IP is just awesome.\";
    intPropType = variant { IP_CERTIFICATE };
    intPropLicense = variant { GAME_FI };
    creationDate = 1_725_454_315_245_000_000 : nat;
  },
)"

# Check Alice's IPs
dfx canister call backend get_int_props "(
  record {
    owner = principal \"$ALICE_PRINCIPAL\";
    prev = null;
    take = opt (10 : nat);
  },
)"

# Check Bob's IPs
dfx canister call backend get_int_props "(
  record {
    owner = principal \"$BOB_PRINCIPAL\";
    prev = null;
    take = opt (10 : nat);
  },
)"

# Mint 2 ICPs to bob
dfx identity use default
dfx canister call icp_ledger icrc1_transfer  "(
  record {
    to = $BOB_ACCOUNT;
    fee = null;
    memo = null;
    from_subaccount = null;
    created_at_time = null;
    amount = 200_000_000 : nat;
  },
)"

dfx identity use bob

# Bob buys Alice's IP
dfx canister call backend buy_int_prop "(
  record {
    token_id = 0;
  },
)"

# Check Alice's ICP balance
dfx canister call icp_ledger icrc1_balance_of "($ALICE_ACCOUNT)"

# Check Bob's ICP balance
dfx canister call icp_ledger icrc1_balance_of "($BOB_ACCOUNT)"

# Check Alice's IPs
dfx canister call backend get_int_props "(
  record {
    owner = principal \"$ALICE_PRINCIPAL\";
    prev = null;
    take = opt (10 : nat);
  },
)"

# Check Bob's IPs
dfx canister call backend get_int_props "(
  record {
    owner = principal \"$BOB_PRINCIPAL\";
    prev = null;
    take = opt (10 : nat);
  },
)"

# Switch back to the default identity
dfx identity use default
