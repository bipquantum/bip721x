import { backendActor } from "../actors/BackendActor";
import { useState } from "react";
import { dateToTime } from "../../utils/conversions";
import { bip721LedgerActor } from "../actors/Bip721LedgerActor";
import { toast } from "react-toastify";

interface DeleteIntPropArgs {
  onSuccess?: () => void;
  onError?: () => void;
}

export const useDeleteIntProp = ({ onSuccess, onError }: DeleteIntPropArgs) => {
  const { call: unlistIntProp } = backendActor.useUpdateCall({
    functionName: "unlist_int_prop",
  });
  const { call: burn } = bip721LedgerActor.authenticated.useUpdateCall({
    functionName: "icrcX_burn",
  });

  const [loading, setLoading] = useState(false);

  const call = async (intPropId: bigint) => {
    setLoading(true);

    // Unlist the IP, if already unlisted, ignore the error and proceed with burn.
    // TODO sardariuss 2025-05-28: if the IP is listed and the unlist fails, the backend will keep
    // having the IP ID listed, and hence querying the IPs will return null for this ID.
    // The side-effect of this is that the IP will be showned as "loading" in the UI.
    // To counter this, we should have a more clever list query function that does not take
    // IPs that are not found on the ledger.
    unlistIntProp([
      {
        token_id: intPropId,
      },
    ])
      .then(() => {
        burn([
          {
            created_at_time: [dateToTime(new Date())],
            memo: [],
            tokens: [intPropId],
          },
        ]).then((burnResult) => {
          if (!burnResult) {
            throw new Error("Burn failed: No result");
          }
          if ("Err" in burnResult) {
            throw new Error(`Burn failed: ${JSON.stringify(burnResult.Err)}`);
          }
          toast.success("IP deleted successfully");
          onSuccess?.();
        });
        setLoading(false);
      })
      .catch((error) => {
        console.error("Delete failed:", error);
        onError?.();
        toast.error(error.message || "Failed to delete IP");
      })
      .finally(() => {
        setLoading(false);
      });
  };
  return { call, loading };
};
