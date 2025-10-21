import { useState } from "react";
import { Principal } from "@dfinity/principal";
import { canisterId } from "../../../declarations/backend";
import { backendActor } from "../actors/BackendActor";
import { toast } from "react-toastify";
import { useFungibleLedgerContext } from "../contexts/FungibleLedgerContext";

interface BuyIntPropArgs {
  onSuccess?: () => void;
  onError?: () => void;
}

export const useBuyIntProp = ({ onSuccess, onError }: BuyIntPropArgs) => {
  
  const { ckusdtLedger } = useFungibleLedgerContext();

  const { call: buyIntProp } = backendActor.authenticated.useUpdateCall({
    functionName: "buy_int_prop",
  });

  const { call: getE6sPrice } = backendActor.unauthenticated.useQueryCall({
    functionName: "get_e6s_price",
  });

  const [loading, setLoading] = useState(false);

  const call = async (intPropId: bigint) => {
    setLoading(true);

    const e6sPrice = await getE6sPrice([{ token_id: intPropId }]);

    if (!e6sPrice || "err" in e6sPrice) {
      toast.warn("Failed to get e6s price");
      console.error(e6sPrice?.err ?? "No result");
      onError?.();
      return;
    }

    const tokenFee = ckusdtLedger.tokenFee;
    if (tokenFee === undefined) {
      toast.warn("Failed to get token fee");
      console.error("Token fee is undefined");
      onError?.();
      setLoading(false);
      return;
    }

    try {
      // Approve the USDT transfer if the price is greater than 0
      if (e6sPrice.ok > 0n) {
        
        const approvalResult = await ckusdtLedger.approveTokens(
          e6sPrice.ok + tokenFee,
          {
            owner: Principal.fromText(canisterId),
            subaccount: [],
          }
        );

        if (!approvalResult || "Err" in approvalResult) {
          toast.warn("Failed to approve USDT transfer");
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
