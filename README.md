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
 - display the amount of ICPs of the account linked to the logged user in the user page
 - force the creation of user when logged in for the first time (the first page one lands on shall be the creation of the user, and it shouldn't be possible to close it)
 - create a nicer user page than the modal one, add to it the list of owned IPs
 - add a button to buy an IP
 - fix routes
 - removed unused code in the frontend
