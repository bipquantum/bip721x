import { useState } from "react";
import { Principal } from "@dfinity/principal";
import { canisterId } from "../../../declarations/backend";
import { backendActor } from "../actors/BackendActor";
import { toast } from "react-toastify";
import { useFungibleLedgerContext } from "../contexts/FungibleLedgerContext";
import { Account } from "../../../declarations/ckbtc_ledger/ckbtc_ledger.did";

interface SetSubscriptionArgs {
  onSuccess?: () => void;
  onError?: () => void;
}

export const useSetSubscription = ({ onSuccess, onError }: SetSubscriptionArgs) => {

  const { ckusdtLedger } = useFungibleLedgerContext();

  const { call: setSubscription } = backendActor.authenticated.useUpdateCall({
    functionName: "set_subscription",
  });

  const { data: plans, call: refreshPlans } = backendActor.unauthenticated.useQueryCall({
    functionName: "get_plans",
    args: [],
  });

  const { data: subscriptionSubaccount, call: refreshSubscriptionSubaccount } = backendActor.unauthenticated.useQueryCall({
    functionName: "get_subscription_subaccount",
    args: [],
  });

  const [loading, setLoading] = useState(false);

  const call = async (planId: string) => {
    setLoading(true);

    try {
      // Get all plans to find the selected plan
      if (plans === undefined) {
        await refreshPlans();
      }

      if (!plans || plans.length === 0) {
        toast.warn("Failed to get plans");
        console.error("No plans available");
        onError?.();
        setLoading(false);
        return;
      }

      if (subscriptionSubaccount === undefined) {
        await refreshSubscriptionSubaccount();
      }

      if (!subscriptionSubaccount) {
        toast.warn("Failed to get subscription subaccount");
        console.error("No subscription subaccount returned");
        onError?.();
        setLoading(false);
        return;
      }

      const selectedPlan = plans.find((p) => p.id === planId);

      if (!selectedPlan) {
        toast.warn("Plan not found");
        console.error("Plan ID not found:", planId);
        onError?.();
        setLoading(false);
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

      // Calculate total amount needed for the plan's duration
      let totalAmount: bigint;
      if (selectedPlan.numberInterval.length > 0) {
        // Plan has a limited duration
        const intervals = Number(selectedPlan.numberInterval[0]);
        totalAmount = (selectedPlan.renewalPriceUsdtE6s + tokenFee) * BigInt(intervals);
      } else {
        // Plan never expires, approve for 1 interval
        totalAmount = selectedPlan.renewalPriceUsdtE6s + tokenFee;
      }

      // Approve the USDT transfer if the price is greater than 0
      if (totalAmount > 0n) {

        const spender : Account = {
          owner: Principal.fromText(canisterId),
          subaccount: [subscriptionSubaccount],
        };

        const approvalResult = await ckusdtLedger.approveTokens(
          totalAmount,
          spender
        );

        if (!approvalResult || "Err" in approvalResult) {
          toast.warn("Failed to approve USDT transfer");
          console.error(approvalResult?.Err ?? "No result");
          onError?.();
          setLoading(false);
          return;
        }
      }

      // Call set_subscription
      const subscriptionResult = await setSubscription([planId]);

      if (!subscriptionResult) {
        toast.warn("Failed to set subscription: undefined error");
        onError?.();
        setLoading(false);
        return;
      }

      if ("ok" in subscriptionResult) {
        ckusdtLedger.refreshUserBalance();
        toast.success("Subscription updated successfully!");
        onSuccess?.();
      } else {
        toast.warn("Failed to set subscription");
        console.error(subscriptionResult.err);
        onError?.();
      }
    } catch (e) {
      console.error(e);
      toast.warn("Unexpected failure during subscription setup");
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
