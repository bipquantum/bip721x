import { useState } from "react";
import { bip721LedgerActor } from "../actors/Bip721LedgerActor";
import { ApprovalInfo } from "../../../declarations/bip721_ledger/bip721_ledger.did";
import { dateToTime } from "../../utils/conversions";
import { Principal } from "@dfinity/principal";
import { canisterId } from "../../../declarations/backend";
import { backendActor } from "../actors/BackendActor";
import { toast } from "react-toastify";

interface ListIntPropArgs {
  onSuccess?: () => void;
  onError?: () => void;
}

export const useListIntProp = ({ onSuccess, onError }: ListIntPropArgs) => {
  const { call: approveBip721Transfer } = bip721LedgerActor.useUpdateCall({
    functionName: "icrc37_approve_tokens",
  });

  const { call: listIntProp } = backendActor.useUpdateCall({
    functionName: "list_int_prop",
  });

  const [loading, setLoading] = useState(false);

  interface CallArgs {
    sellPrice: bigint;
    intPropId: bigint;
  }

  const call = async ({ sellPrice, intPropId }: CallArgs) => {
    const info: ApprovalInfo = {
      memo: [],
      from_subaccount: [],
      created_at_time: [dateToTime(new Date())],
      spender: {
        owner: Principal.fromText(canisterId),
        subaccount: [],
      },
      expires_at: [],
    };

    setLoading(true);
    try {
      const approvalResult = await approveBip721Transfer([
        [{ token_id: intPropId, approval_info: info }],
      ]);

      if (!approvalResult || "Err" in approvalResult) {
        toast.warn("Failed to approve IP transfer");
        console.error(approvalResult?.Err ?? "No result");
        onError?.();
        return;
      }

      const listResult = await listIntProp([
        { token_id: intPropId, e8s_icp_price: sellPrice },
      ]);

      if (!listResult || "err" in listResult) {
        toast.warn("Failed to list IP");
        console.error(listResult?.err ?? "No result");
        onError?.();
      } else {
        toast.success("Success");
        onSuccess?.();
      }
    } catch (e) {
      console.error(e);
      toast.warn("Failed to list");
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
