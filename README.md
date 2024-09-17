# Bipquantum

## Prerequisites

- npm: https://docs.npmjs.com/downloading-and-installing-node-js-and-npm
- dfx: https://internetcomputer.org/docs/current/developer-docs/getting-started/install/#installing-dfx-via-dfxvm
- mops: https://docs.mops.one/quick-start

## Install
```bash
npm install
mops toolchain init # Restart your VS Code or terminal
mops install
```

## Running the project locally

```bash
dfx start --background
./install-local.sh
npm run start
```

## Running the tests

```bash
mops test
```

## MVP Requirements

### IP transfer
- Users can buy/sell/own IPs without having a user profile
- Users shall be able to see its own collection of IPs
- Users shall be able to list/unlist its IPs

### New IP
- the user creation is mandatory to create new IP
- the user is used as single author of the IP
- creation date validation: 
    - validate that it is before the publication date
    - validate that it is today or in the past
- publication date: it should not be mandatory
- once created, IP shall not be listed on the marketplace yet, but only in the user's owned IP

## Misc TODOs

### Frontend:
- after logged in, if user does not exist redirect to /profile
- keep the redirect to /profile if creating in IP and user does not exist
- have a button to redirect to market once IP successfully minted
- remove copyright tab (but keep the .tsx, we'll use it later)
- remove 2x "Nft ai" in the left bar
- Make "Title of the IP" mandatory in the create IP page (shouldn't be allowed to left unset)
- Do not show "N/A ICP" on the IP card if not listed, just show nothing
- In the number input "List for (ICP)", allow to input a decimal number (e.g. 10.53)
- if the owner of the IP does not exist, do not show it in the IP details
- once an IP is submitted, the list button shall change to unlist
- Add the current price, e.g. "123.00 ICP" at the left of the unlist button
- make sure the list/unlist/buy button is always refreshed properly (rn a f5 is sometimes required)
- when clicking on a button that perform update call to the backend (e.g. for creation of IP, list/unlist of IP, buying of IP):
  - the button shall be disabled during the call
  - a spinner shall replace the text in the button during the call
- make sure the placement of the price unit "ICP" is consistent, always on the right (for wallet balance and price)

### Backend:
 - fix return ok if there's an actual error on transfer_ip
 - have user friendly messages
 - check IP Type and IP licence are up to date with Ankur's webapp
 - add migrations
 - transform the script/ip_transfer_scenario.sh into a real test in typescript or motoko