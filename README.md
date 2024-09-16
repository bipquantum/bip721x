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

## Requirements
- The user creation is mandatory for creating new IP
- Users can buy/sell/own IPs without having a user profile


## Misc TODOs

### To do now:
- When creating a new IP, one should be able to edit the user information. If a change is made, the user shall be updated.
- If the owner of the IP has not created a user, the Owner details shall be hidden instead of an error
- Right after listing/unlisting the IP, the button to list/unlist or the label of the price is not updated, one need to press f5 it shoudn't be the case
- Buttons for my IPs / list all IPs does not always refresh the list

### To improve
- why return ok when there's an actual error on transfer_ip ?

### To dicuss / confirm
- creation date: validate that it is before the publication date
- publication date: should pick yes or no, if yes user can pick it!

### Later
 - transform the script/ip_transfer_scenario.sh into a real test in typescript or motoko
 - discussion CID