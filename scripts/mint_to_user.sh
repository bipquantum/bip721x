# sardariuss 2024-SEP-04: Script created with ChatGPT, for more comprehensive scripts we should use ic-repl https://github.com/dfinity/ic-repl

#!/bin/bash

# Check if the correct number of arguments is provided
if [ "$#" -ne 2 ]; then
  echo "Usage: $0 <user_principal> <amount_to_mint>"
  exit 1
fi

# Assign arguments to variables
USER_PRINCIPAL=$1
AMOUNT_TO_MINT=$2

# Use the default identity
dfx identity use default

# Mint to user
dfx canister call icp_ledger icrc1_transfer "record {
  to = (record { owner = principal \"$USER_PRINCIPAL\"; subaccount = null; });
  fee = null;
  memo = null;
  from_subaccount = null;
  created_at_time = null;
  amount = $AMOUNT_TO_MINT : nat;
}"
