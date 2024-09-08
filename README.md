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
- once the IP is submitted, automatically go to the IP item page

### To improve
- why return ok when there's an actual error on transfer_ip ?

### To dicuss / confirm
- once the IP is bought:
    - do not display the IP in the list of public IPs
    - reroute to your list of IPs
    - to confirm: one should not put the price of the IP at the creation, it forces to put it right away on the market. We should rather have a button to sell it in the owned IP user page.
- make the user creation mandatory: 
    - ask for user creation after logged in for the first time (i.e. if backend.get_user returns null)
    - modify button so that once created, it's only written update user
    --> Buyer can stay anonymous (simply using NFID or II)
- creation date: validate that it is before the publication date
- publication date: should pick yes or no, if yes user can pick it!

### Later
 - transform the script/ip_transfer_scenario.sh into a real test in typescript or motoko
 - discussion CID