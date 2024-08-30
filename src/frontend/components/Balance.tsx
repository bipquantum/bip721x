import { Account__1 } from "../../declarations/backend/backend.did";
import { ledgerActor } from "./actors/LedgerActor";

type BalanceProps = {
  user: Account__1;
};

const Balance = ({ user }: BalanceProps) => {
  const { data } = ledgerActor.useQueryCall({
    functionName: "icrc1_balance_of",
    args: [{ owner: user.owner, subaccount: [] }],
  });

  return <p className="text-lg m-auto">ICPS: {data ? data.toString() : "0"}</p>;
};

export default Balance;
