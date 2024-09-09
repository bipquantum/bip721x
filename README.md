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

## Misc TODOs

### To do now:
- bring UI from current bipquantum app (Tope)
- Button to list or unlist the IP does not work if the user has not been created yet
- Right after listing/unlisting the IP, the button to list/unlist or the price is not updated
- Buttons for my IPs / list all IPs does not always refresh the list

### To improve
- why return ok when there's an actual error on transfer_ip ?

### To dicuss / confirm
- make the user creation mandatory: 
    - ask for user creation after logged in for the first time (i.e. if backend.get_user returns null)
    - modify button so that once created, it's only written update user
    --> Buyer can stay anonymous (simply using NFID or II)
- creation date: validate that it is before the publication date
- publication date: should pick yes or no, if yes user can pick it!

### Later
 - transform the script/ip_transfer_scenario.sh into a real test in typescript or motoko
 - discussion CID