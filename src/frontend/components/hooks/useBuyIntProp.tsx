import { useState } from "react";
import { dateToTime } from "../../utils/conversions";
import { Principal } from "@dfinity/principal";
import { canisterId } from "../../../declarations/backend";
import { backendActor } from "../actors/BackendActor";
import { toast } from "react-toastify";
import { bqcLedgerActor } from "../actors/BqcLedgerActor";
import { ApproveArgs } from "../../../declarations/bqc_ledger/bqc_ledger.did";

interface BuyIntPropArgs {
  onSuccess?: () => void;
  onError?: () => void;
}

export const useBuyIntProp = ({ onSuccess, onError }: BuyIntPropArgs) => {
  const { call: approveBqcTransfer } = bqcLedgerActor.useUpdateCall({
    functionName: "icrc2_approve",
  });

  const { call: buyIntProp } = backendActor.useUpdateCall({
    functionName: "buy_int_prop",
  });

  const { call: getE8sPrice } = backendActor.useQueryCall({
    functionName: "get_e8s_price",
  });

  const [loading, setLoading] = useState(false);

  const call = async (intPropId: bigint) => {
    setLoading(true);

    const e8sPrice = await getE8sPrice([{ token_id: intPropId }]);

    if (!e8sPrice || "err" in e8sPrice) {
      toast.warn("Failed to get e8s price");
      console.error(e8sPrice?.err ?? "No result");
      onError?.();
      return;
    }

    try {
      // Approve the BQC transfer if the price is greater than 0
      if (e8sPrice.ok > 0n) {
        const args: ApproveArgs = {
          amount: e8sPrice.ok + 10_000n,
          memo: [],
          from_subaccount: [],
          created_at_time: [dateToTime(new Date())],
          spender: {
            owner: Principal.fromText(canisterId),
            subaccount: [],
          },
          expires_at: [],
          fee: [],
          expected_allowance: [],
        };

        const approvalResult = await approveBqcTransfer([args]);

        if (!approvalResult || "Err" in approvalResult) {
          toast.warn("Failed to approve BQC transfer");
          console.error(approvalResult?.Err ?? "No result");
          onError?.();
          return;
        }
      }

      const buyResult = await buyIntProp([{ token_id: intPropId }]);

      if (!buyResult) {
        toast.warn("Failed to buy: undefined error");
        onError?.();
        return;
      }

      if ("ok" in buyResult) {
        toast.success("Success");
        onSuccess?.();
      } else {
        toast.warn("Failed to buy");
        console.error(buyResult.err);
        onError?.();
      }
    } catch (e) {
      console.error(e);
      toast.warn("Unexpected failure during buy");
      onError?.();
    } finally {
      setLoading(false);
    }
  };

  return {
    call,
    loading,
  };
};
