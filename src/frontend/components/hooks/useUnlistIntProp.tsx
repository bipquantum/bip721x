import { useState } from "react";
import { bip721LedgerActor } from "../actors/Bip721LedgerActor";
import { RevokeTokenApprovalArg } from "../../../declarations/bip721_ledger/bip721_ledger.did";
import { dateToTime } from "../../utils/conversions";
import { Principal } from "@dfinity/principal";
import { canisterId } from "../../../declarations/backend";
import { backendActor } from "../actors/BackendActor";
import { toast } from "react-toastify";

interface UnlistIntPropArgs {
  onSuccess?: () => void;
  onError?: () => void;
}

export const useUnlistIntProp = ({ onSuccess, onError }: UnlistIntPropArgs) => {
  const { call: revokeBip721Transfer } = bip721LedgerActor.useUpdateCall({
    functionName: "icrc37_revoke_token_approvals",
  });

  const { call: unlistIntProp } = backendActor.useUpdateCall({
    functionName: "unlist_int_prop",
  });

  const [loading, setLoading] = useState(false);

  const call = async (intPropId: bigint) => {
    const info: RevokeTokenApprovalArg = {
      token_id: intPropId,
      memo: [],
      from_subaccount: [],
      created_at_time: [dateToTime(new Date())],
      spender: [
        {
          owner: Principal.fromText(canisterId),
          subaccount: [],
        },
      ],
    };

    setLoading(true);

    try {
      const revokeResult = await revokeBip721Transfer([[info]]);

      if (!revokeResult || "Err" in revokeResult) {
        toast.warn("Failed to revoke IP transfer");
        console.error(revokeResult?.Err ?? "No result");
        onError?.();
        return;
      }

      const unlistResult = await unlistIntProp([{ token_id: intPropId }]);

      if (!unlistResult || "err" in unlistResult) {
        toast.warn("Failed to unlist IP");
        console.error(unlistResult?.err ?? "No result");
        onError?.();
      } else {
        toast.success("Success");
        onSuccess?.();
      }
    } catch (e) {
      console.error(e);
      toast.warn("Failed to unlist");
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
