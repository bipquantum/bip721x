# Bipquantum

## Prerequisites

- npm: https://docs.npmjs.com/downloading-and-installing-node-js-and-npm
- dfx: https://internetcomputer.org/docs/current/developer-docs/getting-started/install/#installing-dfx-via-dfxvm
- mops: https://docs.mops.one/quick-start
- cargo: https://doc.rust-lang.org/cargo/

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
- Verify the idempotent proxy cycles consomption has been reduced by putting the timer every day
- Inject the chatgpt API key instead of hardcoding it
- Fix Conversions.intPropToMetadata to be able to use it
- Harmonize the error messages returned by the backend canister
- Be able to add a subaccount when creating IPs
- Code review of implementation of ICRC-7/ICRC-37/ICRC-3, ideally have them audited
- Have a proper approve flow (comes with NFID)
- Misc frontend todos, nothing blocking or critical
