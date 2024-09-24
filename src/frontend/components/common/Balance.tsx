import { icpLedgerActor } from "../actors/IcpLedgerActor";
import { fromE8s, toE8s } from "../../utils/conversions";
import { Principal } from "@dfinity/principal";
import { canisterId } from "../../../declarations/backend";
import { NumericFormat } from "react-number-format";
import { useState } from "react";
import { ApproveArgs } from "../../../declarations/icp_ledger/icp_ledger.did";

import SpinnerSvg from "../../assets/spinner.svg";
import { toast } from "react-toastify";

type BalanceProps = {
  principal: Principal;
};

const Balance = ({ principal }: BalanceProps) => {
  const [approveAmount, setApproveAmount] = useState<bigint>(BigInt(0));

  const { data: balance } = icpLedgerActor.useQueryCall({
    functionName: "icrc1_balance_of",
    args: [
      {
        owner: principal,
        subaccount: [],
      },
    ],
  });

  const { data: allowance, call: refreshAllowance } =
    icpLedgerActor.useQueryCall({
      functionName: "icrc2_allowance",
      args: [
        {
          account: {
            owner: principal,
            subaccount: [],
          },
          spender: {
            owner: Principal.fromText(canisterId),
            subaccount: [],
          },
        },
      ],
    });

  const { call: approve, loading: approvalLoading } =
    icpLedgerActor.useUpdateCall({
      functionName: "icrc2_approve",
    });

  const getAllowance = () => {
    if (allowance === undefined) {
      return 0n;
    } else {
      return allowance.allowance;
    }
  };

  const triggerApproval = () => {
    const args: [ApproveArgs] = [
      {
        amount: approveAmount,
        fee: [],
        memo: [],
        from_subaccount: [],
        created_at_time: [],
        expected_allowance: [allowance?.allowance ?? 0n],
        expires_at: [],
        spender: {
          owner: Principal.fromText(canisterId),
          subaccount: [],
        },
      },
    ];

    approve(args).then((result) => {
      if (!result || "Err" in result) {
        console.error("Failed to approve");
        toast.warn("Failed to approve ICPs!");
      } else {
        refreshAllowance();
        toast.success("ICPs approved successfully!");
      }
    });
  };

  return (
    <div className="flex w-full flex-row items-center justify-between gap-2 px-2">
      <span className="text-lg">
        Balance: {fromE8s(balance ?? 0n).toFixed(2)} ICP
      </span>
      <span className="text-lg">
        Allowed: {fromE8s(getAllowance()).toFixed(2)} ICP
      </span>
      <NumericFormat
        className="focus:ring-primary-600 focus:border-primary-600 dark:focus:ring-primary-500 dark:focus:border-primary-500 block w-32 rounded-lg border border-gray-300 bg-white p-2.5 text-sm text-gray-900 dark:border-gray-500 dark:placeholder-gray-400"
        thousandSeparator=","
        decimalScale={2}
        value={Number(fromE8s(approveAmount))}
        onValueChange={(e) => {
          setApproveAmount(
            toE8s(parseFloat(e.value === "" ? "0" : e.value.replace(/,/g, ""))),
          );
        }}
      />
      <button
        onClick={() => triggerApproval()}
        className="flex items-center justify-center rounded-lg bg-blue-700 px-5 py-2.5 text-center text-sm font-medium text-white hover:bg-blue-800 focus:outline-none focus:ring-4 focus:ring-blue-300 dark:bg-blue-600 dark:text-white dark:hover:bg-blue-700 dark:focus:ring-blue-800"
        type="button"
        disabled={approvalLoading}
      >
        {approvalLoading ? <img src={SpinnerSvg} alt="" /> : "Approve"}
      </button>
    </div>
  );
};

export default Balance;
