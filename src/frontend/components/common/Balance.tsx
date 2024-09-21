import { icpLedgerActor } from "../actors/IcpLedgerActor";
import { fromE8s } from "../../utils/conversions";
import { Principal } from "@dfinity/principal";

type BalanceProps = {
  principal: Principal;
};

const Balance = ({ principal }: BalanceProps) => {

  const { data: balance } = icpLedgerActor.useQueryCall({
    functionName: "icrc1_balance_of",
    args: [{
      owner: principal,
      subaccount: [],
    }],
  });

  return <span>{fromE8s(balance ?? 0n).toFixed(2)} ICP</span>;
};

export default Balance;
