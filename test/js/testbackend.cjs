// TODO: do a proper test with assertions

// Load environment variables from .env file
require('dotenv').config({ path: '../../.env' });

const { getActor } = require("./actor.cjs");
const { Ed25519KeyIdentity } = require("@dfinity/identity");
const { Principal } = require('@dfinity/principal');

const dateToTime = (date) => {
  return BigInt(date.getTime() * 1_000_000);
}

const getCanisterIds = () => {
  const canisterIds = {
    bip721: process.env.CANISTER_ID_BIP721_LEDGER,
    bqc: process.env.CANISTER_ID_ckusdt_ledger,
    backend: process.env.CANISTER_ID_BACKEND,
  };

  if (canisterIds.bip721 === undefined || canisterIds.bqc === undefined || canisterIds.backend === undefined) {
    throw new Error("One of environment variable CANISTER_ID_* is not defined");
  }
  return canisterIds;
}

const getActorFactories = async () => {
  const bip721ServicePromise = import("../../.dfx/local/canisters/bip721_ledger/service.did.js");
  const bqcServicePromise = import("../../.dfx/local/canisters/ckusdt_ledger/service.did.js");
  const backendServicePromise = import("../../.dfx/local/canisters/backend/service.did.js");

  return await Promise.all([bip721ServicePromise, bqcServicePromise, backendServicePromise]).then(([bip721Service, bqcService, backendService]) => {
      
      if (bip721Service.idlFactory === undefined || bqcService.idlFactory === undefined || backendService.idlFactory === undefined) {
        throw new Error("One of the actor factories is undefined");
      }
      return { bip721Factory: bip721Service.idlFactory, bqcFactory: bqcService.idlFactory, backendFactory: backendService.idlFactory };
    }
  );
}

const createActors = async (canisterIds,actorFactories, identity) => {

  let bip721ActorPromise  = getActor(canisterIds.bip721,  actorFactories.bip721Factory,  identity);
  let bqcActorPromise     = getActor(canisterIds.bqc,     actorFactories.bqcFactory,     identity);
  let backendActorPromise = getActor(canisterIds.backend, actorFactories.backendFactory, identity);

  return await Promise.all([bip721ActorPromise, bqcActorPromise, backendActorPromise]).then(([bip721Actor, bqcActor, backendActor]) => {

    if (bip721Actor === null || bqcActor === null || backendActor === null) {
      throw new Error("One of the actors is null");
    }
    return { bip721Actor, bqcActor, backendActor };
  });
}

const listIp = async (canisterIds, user_actors, token_id, e6s_usdt_price) => {
  
  // Approve the backend to transfer the IP
  let approve_transfer_result = await user_actors.bip721Actor.icrc37_approve_tokens([{
    token_id: token_id, 
    approval_info: {
      memo: [],
      from_subaccount: [],
      created_at_time: [dateToTime(new Date())],
      spender: {
        owner: Principal.fromText(canisterIds.backend),
        subaccount: [],
      },
      expires_at: [],
    }
  }]);
  if (approve_transfer_result.Err !== undefined) {
    return false;
  }

  // List the IP
  let list_int_prop_result = await user_actors.backendActor.list_int_prop({
    token_id: token_id, e6s_usdt_price: e6s_usdt_price
  });
  return list_int_prop_result.ok !== undefined;
}

const buyIp = async (canisterIds, user_actors, token_id, e6s_usdt_price) => {
    
  // Allow the backend to spend the ICP
  let approve_result = await user_actors.bqcActor.icrc2_approve({
    amount: e6s_usdt_price + 10_000n,
    memo: [],
    from_subaccount: [],
    created_at_time: [dateToTime(new Date())],
    spender: {
      owner: Principal.fromText(canisterIds.backend),
      subaccount: [],
    },
    expires_at: [],
    fee: [],
    expected_allowance: [],
  });
  if (approve_result.Err !== undefined) {
    console.error(approve_result.Err);
    return false;
  }

  // Buy the IP
  let buy_int_prop_result = await user_actors.backendActor.buy_int_prop({ token_id: token_id });
  return buy_int_prop_result.ok !== undefined;
}

async function testBuyIpThenBuyBack() {

  const canisterIds = getCanisterIds();
  const actorFactories = await getActorFactories();

  let author = await createActors(canisterIds, actorFactories, Ed25519KeyIdentity.generate());

  // Create a user profile
  let set_user_result = await author.backendActor.set_user({
    firstName: "Lucky",
    lastName: "Luke",
    nickName: "Luke",
    specialty: "Cowboy",
    countryCode: "US",
  });
  console.log(set_user_result);

  // Create a new IP
  let create_int_prop_result = await author.backendActor.create_int_prop({
    dataUri: "",
    title: "Test IP",
    intPropLicenses: [],
    intPropType: { COPYRIGHT: null },
    description: "Test IP description",
    creationDate: dateToTime(new Date()),
    publishing: [],
    percentageRoyalties: [],
  });
  console.log(create_int_prop_result);
  let token_id = create_int_prop_result.ok;

  var e6s_usdt_price = 100n * 100_000_000n // 100 ICP
  const list_ip_result = await listIp(canisterIds, author, token_id, e6s_usdt_price);
  console.log(list_ip_result);

  let buyer = await createActors(canisterIds, actorFactories, Ed25519KeyIdentity.generate());

  // Get the airdrop first
  let airdrop_result = await buyer.backendActor.airdrop_user();
  console.log(airdrop_result);

  // Allow the backend to spend the ICP
  let buy_ip_result = await buyIp(canisterIds, buyer, token_id, e6s_usdt_price);
  console.log(buy_ip_result);

  // The buyer lists the IP for sale for a different price
  e6s_usdt_price = 200n * 100_000_000n // 200 ICP
  let list_ip_result2 = await listIp(canisterIds, buyer, token_id, e6s_usdt_price);
  console.log(list_ip_result2);

  // The author buys the IP back, but needs airdrop first
  let airdrop_result2 = await author.backendActor.airdrop_user();
  console.log(airdrop_result2);

  let buy_ip_result2 = await buyIp(canisterIds, author, token_id, e6s_usdt_price);
  console.log(buy_ip_result2);
}

async function testBuyTwoIps() {

  const canisterIds = getCanisterIds();
  const actorFactories = await getActorFactories();

  let author = await createActors(canisterIds, actorFactories, Ed25519KeyIdentity.generate());

  // Create a user profile
  let set_user_result = await author.backendActor.set_user({
    firstName: "",
    lastName: "",
    nickName: "",
    specialty: "",
    countryCode: "US",
  });
  console.log(set_user_result);

  // Create IP1
  let token_1 = (await author.backendActor.create_int_prop({
    dataUri: "",
    title: "Test IP 1",
    intPropLicenses: [],
    intPropType: { COPYRIGHT: null },
    description: "Test IP 1 description",
    creationDate: dateToTime(new Date()),
    publishing: [],
  })).ok;
  console.log(token_1);

  const e6s_usdt_price = 100n * 100_000_000n // 100 ICP
  const list_ip_result = await listIp(canisterIds, author, token_1, e6s_usdt_price);
  console.log(list_ip_result);

  let token_2 = (await author.backendActor.create_int_prop({
    dataUri: "",
    title: "Test IP 2",
    intPropLicenses: [],
    intPropType: { COPYRIGHT: null },
    description: "Test IP 2 description",
    creationDate: dateToTime(new Date()),
    publishing: [],
  })).ok;
  console.log(token_2);

  const list_ip_result2 = await listIp(canisterIds, author, token_2, e6s_usdt_price);
  console.log(list_ip_result2);

  let buyer = await createActors(canisterIds, actorFactories, Ed25519KeyIdentity.generate());

  // Get the airdrop first
  let airdrop_result = await buyer.backendActor.airdrop_user();
  console.log(airdrop_result);

  // Buy IP1
  let buy_ip_result = await buyIp(canisterIds, buyer, token_1, e6s_usdt_price);
  console.log(buy_ip_result);

  // Buy IP2
  let buy_ip_result2 = await buyIp(canisterIds, buyer, token_2, e6s_usdt_price);
  console.log(buy_ip_result2);
};

testBuyIpThenBuyBack();
testBuyTwoIps();