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

# Get the user account
USER_ACCOUNT=$(dfx canister call backend get_user_account "record {
  user = principal \"$USER_PRINCIPAL\";
}" --query)

# Extract owner and subaccount
OWNER=$(echo $USER_ACCOUNT | grep -oP '(?<=owner = principal ")[^"]+')
SUBACCOUNT=$(echo $USER_ACCOUNT | grep -oP '(?<=subaccount = opt blob ")[^"]+')

# Format the `to` field
if [ -n "$SUBACCOUNT" ]; then
  TO="(record { owner = principal \"$OWNER\"; subaccount = opt blob \"$SUBACCOUNT\"; })"
else
  TO="(record { owner = principal \"$OWNER\"; subaccount = null; })"
fi

echo "User account to: $TO"

# Mint to user
dfx canister call icp_ledger icrc1_transfer "record {
  to = $TO;
  fee = null;
  memo = null;
  from_subaccount = null;
  created_at_time = null;
  amount = $AMOUNT_TO_MINT : nat;
}"
