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

## Credits
- Idempotent proxy canister: https://github.com/ldclabs/idempotent-proxy/tree/main/src/idempotent_proxy_canister

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

## TODOs
- in the chatbot, the link to the minted bIP is not working (because the context does not update on transition)
- add versionning to the state machine