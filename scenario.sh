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
  },
)"

# Alice approves the backend to spend her IPs
dfx canister call icrc7 icrc37_approve_collection "(
  vec {
    record { 
      approval_info = record {
        from_subaccount = null; 
        spender = record {
          owner = principal \"$BACKEND_CANISTER\";
          subaccount = null
        };
        memo = null;
        expires_at = null;
        created_at_time = null 
      }
    }
  }
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
    to = record {
      owner = principal \"$BOB_PRINCIPAL\";
      subaccount = null;
    };
    fee = null;
    memo = null;
    from_subaccount = null;
    created_at_time = null;
    amount = 200_000_000 : nat;
  },
)"

# Bob authorize the backend to spend up to 100 ICPs of his account
dfx identity use bob
dfx canister call icp_ledger icrc2_approve "(
  record {
    fee = null;
    memo = null;
    from_subaccount = null;
    created_at_time = null;
    amount = 10_000_000_000 : nat;
    expected_allowance = null;
    expires_at = null;
    spender = record {
      owner = principal \"$BACKEND_CANISTER\";
      subaccount = null;
    };
  },
)"

# Bob buys Alice's IP
dfx canister call backend buy_int_prop "(
  record {
    token_id = 0;
  },
)"

# Check Alice's ICP balance
dfx canister call icp_ledger icrc1_balance_of "(
  record {
    owner = principal \"$ALICE_PRINCIPAL\";
    subaccount = null;
  }
)"

# Check Bob's ICP balance
dfx canister call icp_ledger icrc1_balance_of "(
  record {
    owner = principal \"$BOB_PRINCIPAL\";
    subaccount = null;
  }
)"

# Check Alice's IPs
# TODO sardariuss 2024-08-07: Find out why Alice still owns the IP
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
