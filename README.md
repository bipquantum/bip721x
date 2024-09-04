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
- to discuss:
    - either make the current UI fully fonctionnal:
        - be able to click on bipquantum / create new IP / profile (header buttons) even when popup active or put another color in background when popactive to show it's inactive
    - or bring UI from current bipquantum app ?
- remove deadcode in UI, fix Typescript build
- make the user creation mandatory: 
    - ask for user creation after logged in for the first time (i.e. if backend.get_user returns null)
    - modify button so that once created, it's only written update user
    --> Buyer can stay anonymous (simply using NFID or II)
- creation date: validate that it is before the publication date
- publication date: should pick yes or no, if yes user can pick it!
- once the IP is submitted, automatically go back to the list of IPs and refresh
- add a copy/paste icon in the UI that copies the account so that it can be pasted somewhere else
- create a test which: creates a user, creates an IP, create another user, buy the IP
- create a script (in typescript?) that mints ICP for you when you give your principal 
- fix routes
- popup error/success buy + refresh

### Later
 - choose file: shall be able to preview image
 - discussion CID