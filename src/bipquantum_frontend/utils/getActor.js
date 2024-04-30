import { canisterId, createActor } from "../../declarations/bipquantum_backend";
import { HttpAgent } from "@dfinity/agent";

const getActor = async (identity) => {
  try {
    const agent = new HttpAgent({
      identity,
      host: window.origin,
    });

    await agent.fetchRootKey();

    const actor = createActor(canisterId.toString(), {
      agent,
    });

    return actor;
  } catch (error) {
    return null;
  }
};

export default getActor;
