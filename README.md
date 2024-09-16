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

### To do now:
- When creating a new IP
    - if the user is not created yet, it shall not be redirected to the user page, but to the IP details as usual
    - on the second page, if the user already exist, the button shall be "Validate Author Details"
    - on the second page, if the user does not already exist, the button shall be "Add Author Details"
    - the user details can always be edited; if there is an edit the user shall be updated.
- If the owner of the IP has not created a user, the Owner details shall be hidden instead of an error.
- Right after listing/unlisting the IP, the button to list/unlist or the label of the price is not updated, one need to press f5 it shoudn't be the case
- Buttons for my IPs / list all IPs does not always refresh the list
- The publication date shall be optional, but if given it shall be after the creation date

### To improve
- why return ok when there's an actual error on transfer_ip ?

### Later
 - transform the script/ip_transfer_scenario.sh into a real test in typescript or motoko
 - discussion CID