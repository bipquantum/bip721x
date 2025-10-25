import { useState } from "react";
import { bip721LedgerActor } from "../actors/Bip721LedgerActor";
import { ApprovalInfo } from "../../../declarations/bip721_ledger/bip721_ledger.did";
import { dateToTime } from "../../utils/conversions";
import { Principal } from "@dfinity/principal";
import { canisterId as backendId } from "../../../declarations/backend";
import { backendActor } from "../actors/BackendActor";
import { toast } from "react-toastify";
import { useMixpanelTracking } from "./useMixpanelTracking";

interface ListIntPropArgs {
  onSuccess?: () => void;
  onError?: () => void;
}

export const useListIntProp = ({ onSuccess, onError }: ListIntPropArgs) => {
  const { trackIPListed } = useMixpanelTracking();

  const { call: approveBip721Transfer } = bip721LedgerActor.authenticated.useUpdateCall({
    functionName: "icrc37_approve_tokens",
  });

  const { call: isBip721TranferApproved } = bip721LedgerActor.unauthenticated.useQueryCall({
    functionName: "icrc37_is_approved",
  });

  const { call: listIntProp } = backendActor.authenticated.useUpdateCall({
    functionName: "list_int_prop",
  });

  const [loading, setLoading] = useState(false);

  interface CallArgs {
    sellPrice: bigint;
    intPropId: bigint;
  }

  const call = async ({ sellPrice, intPropId }: CallArgs) => {
    setLoading(true);

    try {
      // Check if the token is already approved
      const isApprovedResult = await isBip721TranferApproved([[
        {
          token_id: intPropId,
          from_subaccount: [],
          spender: {
            owner: Principal.fromText(backendId),
            subaccount: [],
          },
        },
      ]]);

      // Only approve if not already approved
      if (!isApprovedResult || !isApprovedResult[0]) {
        const info: ApprovalInfo = {
          memo: [],
          from_subaccount: [],
          created_at_time: [dateToTime(new Date())],
          spender: {
            owner: Principal.fromText(backendId),
            subaccount: [],
          },
          expires_at: [],
        };

        const approvalResult = await approveBip721Transfer([
          [{ token_id: intPropId, approval_info: info }],
        ]);

        if (!approvalResult || "Err" in approvalResult) {
          toast.warn("Failed to approve IP transfer");
          console.error(approvalResult?.Err ?? "No result");
          onError?.();
          return;
        }
      }

      const listResult = await listIntProp([
        { token_id: intPropId, e6s_usdt_price: sellPrice },
      ]);

      if (!listResult || "err" in listResult) {
        toast.warn("Failed to list IP");
        console.error(listResult?.err ?? "No result");
        onError?.();
      } else {
        // Track IP listing
        trackIPListed({
          tokenId: intPropId.toString(),
          priceE6s: sellPrice.toString(),
        });

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
