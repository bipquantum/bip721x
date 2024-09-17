import { Account } from "../../../declarations/backend/backend.did";
import { icpLedgerActor } from "../actors/IcpLedgerActor";
import { fromE8s } from "../../utils/conversions";

type BalanceProps = {
  account: Account;
};

const Balance = ({ account }: BalanceProps) => {
  const { data: balance } = icpLedgerActor.useQueryCall({
    functionName: "icrc1_balance_of",
    args: [account],
  });

  return <span>{fromE8s(balance ?? 0n).toFixed(2)} ICP</span>;
};

export default Balance;
