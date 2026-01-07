import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useActors } from "../../common/ActorsContext";
import { useAuth } from "@nfid/identitykit/react";
import SpinnerSvg from "../../../assets/spinner.svg";
import { Plan, RenewalInterval } from "../../../../declarations/backend/backend.did";
import { FiCheck } from "react-icons/fi";
import Modal from "../../common/Modal";
import { useSetSubscription } from "../../hooks/useSetSubscription";
import { backendActor } from "../../actors/BackendActor";
import { getStripeCheckoutUrl } from "../../../constants/stripe";

type PaymentMethod = "ckusdt" | "stripe";

const Plans = () => {

  const { authenticated } = useActors();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<PaymentMethod>("ckusdt");

  const { call: updateSubscription, loading: settingSubscription } = useSetSubscription({
    onSuccess: () => {
      setSelectedPlan(null);
      // Navigate to profile subscription tab
      navigate("/profile/subscription");
    },
  });

  const { data: plans, call: refreshPlans } = backendActor.unauthenticated.useQueryCall({
    functionName: "get_plans",
    args: [],
  });

  const { data: subscription, call: refreshSubscription } = backendActor.authenticated.useQueryCall({
    functionName: "get_subscription",
    args: [],
  });

  useEffect(() => {
    refreshPlans();
    refreshSubscription();
  }, [authenticated]);

  if (plans === undefined || subscription === undefined) {
    return (
      <div className="flex h-full w-full items-center justify-center">
        <img src={SpinnerSvg} alt="Loading..." className="h-12 w-12" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex h-full w-full items-center justify-center">
        <p className="text-black dark:text-white">Please log in to view plans</p>
      </div>
    );
  }

  const formatCredits = (credits: bigint): string => {
    return credits.toLocaleString();
  };

  const formatPrice = (priceE6s: bigint): string => {
    const price = Number(priceE6s) / 1_000_000;
    return price === 0 ? "Free" : `$${price.toFixed(2)}`;
  };

  const formatInterval = (interval: RenewalInterval): string => {
    if ("Days" in interval) {
      const numDays = Number(interval.Days);
      if (numDays === 30) return "month";
      if (numDays === 365) return "year";
      return `${numDays} days`;
    } else {
      const numMonths = Number(interval.Months);
      if (numMonths === 1) return "month";
      if (numMonths === 12) return "year";
      return `${numMonths} months`;
    }
  };

  const getIntervalDays = (interval: RenewalInterval): number => {
    if ("Days" in interval) {
      return Number(interval.Days);
    } else {
      return Number(interval.Months) * 30; // Approximate months as 30 days
    }
  };

  const formatDuration = (numberInterval: [] | [bigint], interval: RenewalInterval): string => {
    if (numberInterval.length === 0) {
      return "Forever";
    }
    const intervals = Number(numberInterval[0]);
    const days = getIntervalDays(interval);
    const totalDays = intervals * days;

    if (totalDays >= 365) {
      return `${Math.floor(totalDays / 365)} year${Math.floor(totalDays / 365) > 1 ? 's' : ''}`;
    }
    if (totalDays >= 30) {
      return `${Math.floor(totalDays / 30)} month${Math.floor(totalDays / 30) > 1 ? 's' : ''}`;
    }
    return `${totalDays} days`;
  };

  return (
    <div className="flex h-full w-full flex-col items-center overflow-y-auto p-4 text-black dark:text-white">
      {/* Header */}
      <div className="mb-8 w-full max-w-6xl">
        <h1 className="font-momentum text-3xl font-extrabold text-black dark:text-white">
          Subscription Plans
        </h1>
        <p className="mt-2 text-gray-600 dark:text-gray-400">
          Choose the plan that fits your needs
        </p>
      </div>

      {/* Plans Grid */}
      <div className="grid w-full max-w-6xl grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {plans.map((plan) => {
          const isCurrentPlan = subscription?.planId === plan.id;

          return (
            <div
              key={plan.id}
              className={`relative flex flex-col rounded-2xl border-2 p-6 transition-all ${
                isCurrentPlan
                  ? "border-primary bg-primary/5 shadow-lg dark:border-secondary dark:bg-secondary/5"
                  : "border-gray-300 bg-white dark:border-gray-600 dark:bg-gray-800"
              }`}
            >
              {/* Current Plan Badge */}
              {isCurrentPlan && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-primary px-4 py-1 text-sm font-semibold text-white dark:bg-secondary">
                  Current Plan
                </div>
              )}

              {/* Plan Name */}
              <h2 className="mb-2 text-2xl font-bold text-black dark:text-white">
                {plan.name}
              </h2>

              {/* Price */}
              <div className="mb-4">
                <span className="text-4xl font-extrabold text-primary dark:text-secondary">
                  {formatPrice(plan.renewalPriceUsdtE6s)}
                </span>
                {plan.renewalPriceUsdtE6s > 0n && (
                  <span className="ml-2 text-gray-600 dark:text-gray-400">
                    / {formatInterval(plan.renewalInterval)}
                  </span>
                )}
              </div>

              {/* Features */}
              <div className="mb-6 flex-grow">
                <div className="mb-3 flex items-center gap-2">
                  <FiCheck className="text-green-500" size={20} />
                  <span className="text-gray-700 dark:text-gray-300">
                    {formatCredits(plan.intervalCredits)} credits per {formatInterval(plan.renewalInterval)}
                  </span>
                </div>

                {plan.id !== "free" && (
                  <div className="mb-3 flex items-center gap-2">
                    <FiCheck className="text-green-500" size={20} />
                    <span className="text-gray-700 dark:text-gray-300">
                      Access to voice AI
                    </span>
                  </div>
                )}

                <div className="mb-3 flex items-center gap-2">
                  <FiCheck className="text-green-500" size={20} />
                  <span className="text-gray-700 dark:text-gray-300">
                    Duration: {formatDuration(plan.numberInterval, plan.renewalInterval)}
                  </span>
                </div>

                {plan.renewalPriceUsdtE6s > 0n && (
                  <div className="mb-3 flex items-center gap-2">
                    <FiCheck className="text-green-500" size={20} />
                    <span className="text-gray-700 dark:text-gray-300">
                      Renews every {formatInterval(plan.renewalInterval)}
                    </span>
                  </div>
                )}
              </div>

              {/* Action Button */}
              <button
                className={`w-full rounded-lg py-3 font-semibold transition-colors ${
                  isCurrentPlan
                    ? "cursor-default bg-gray-300 text-gray-600 dark:bg-gray-700 dark:text-gray-400"
                    : "bg-primary text-white hover:bg-primary/90 dark:bg-secondary dark:hover:bg-secondary/90"
                }`}
                disabled={isCurrentPlan}
                onClick={() => !isCurrentPlan && setSelectedPlan(plan)}
              >
                {isCurrentPlan ? "Active" : "Select Plan"}
              </button>
            </div>
          );
        })}
      </div>

      {/* Plan Selection Modal */}
      <Modal
        isVisible={selectedPlan !== null}
        onClose={() => {
          setSelectedPlan(null);
          setSelectedPaymentMethod("ckusdt"); // Reset to default
        }}
        title="Confirm Plan Selection"
      >
        {selectedPlan && (
          <div className="space-y-4">
            {/* Plan Name */}
            <div>
              <h3 className="text-2xl font-bold text-black dark:text-white">
                {selectedPlan.name}
              </h3>
            </div>

            {/* Price */}
            <div className="rounded-lg bg-gray-100 p-4 dark:bg-gray-700">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {selectedPlan.renewalPriceUsdtE6s > 0n ? "Recurring Price" : "Price"}
              </p>
              <p className="text-3xl font-bold text-primary dark:text-secondary">
                {formatPrice(selectedPlan.renewalPriceUsdtE6s)}
                {selectedPlan.renewalPriceUsdtE6s > 0n && (
                  <span className="ml-2 text-lg text-gray-600 dark:text-gray-400">
                    / {formatInterval(selectedPlan.renewalInterval)}
                  </span>
                )}
              </p>
            </div>

            {/* Plan Features */}
            <div>
              <p className="mb-2 text-sm font-semibold text-gray-700 dark:text-gray-300">
                What's included:
              </p>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <FiCheck className="text-green-500" size={18} />
                  <span className="text-sm text-gray-700 dark:text-gray-300">
                    {formatCredits(selectedPlan.intervalCredits)} credits per {formatInterval(selectedPlan.renewalInterval)}
                  </span>
                </div>
                {selectedPlan.id !== "free" && (
                  <div className="flex items-center gap-2">
                    <FiCheck className="text-green-500" size={18} />
                    <span className="text-sm text-gray-700 dark:text-gray-300">
                      Access to voice AI
                    </span>
                  </div>
                )}
                <div className="flex items-center gap-2">
                  <FiCheck className="text-green-500" size={18} />
                  <span className="text-sm text-gray-700 dark:text-gray-300">
                    Duration: {formatDuration(selectedPlan.numberInterval, selectedPlan.renewalInterval)}
                  </span>
                </div>
                {selectedPlan.renewalPriceUsdtE6s > 0n && (
                  <div className="flex items-center gap-2">
                    <FiCheck className="text-green-500" size={18} />
                    <span className="text-sm text-gray-700 dark:text-gray-300">
                      Renews every {formatInterval(selectedPlan.renewalInterval)}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Payment Method Selection - Only show for paid plans */}
            {selectedPlan.renewalPriceUsdtE6s > 0n && (
              <div>
                <p className="mb-3 text-sm font-semibold text-gray-700 dark:text-gray-300">
                  Choose Payment Method:
                </p>
                <div className="space-y-3">
                  {/* ckUSDT Option */}
                  <button
                    onClick={() => setSelectedPaymentMethod("ckusdt")}
                    className={`w-full rounded-lg border-2 p-4 text-left transition-all ${
                      selectedPaymentMethod === "ckusdt"
                        ? "border-primary bg-primary/10 dark:border-secondary dark:bg-secondary/10"
                        : "border-gray-300 bg-white hover:border-gray-400 dark:border-gray-600 dark:bg-gray-800 dark:hover:border-gray-500"
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className="mt-0.5">
                        <div className={`h-5 w-5 rounded-full border-2 flex items-center justify-center ${
                          selectedPaymentMethod === "ckusdt"
                            ? "border-primary dark:border-secondary"
                            : "border-gray-400 dark:border-gray-500"
                        }`}>
                          {selectedPaymentMethod === "ckusdt" && (
                            <div className="h-3 w-3 rounded-full bg-primary dark:bg-secondary" />
                          )}
                        </div>
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-2xl">💎</span>
                          <span className="font-semibold text-black dark:text-white">
                            ckUSDT (Crypto)
                          </span>
                        </div>
                        <p className="text-xs text-gray-600 dark:text-gray-400">
                          Direct blockchain payment • No processing fees
                        </p>
                      </div>
                    </div>
                  </button>

                  {/* Stripe Option */}
                  <button
                    onClick={() => setSelectedPaymentMethod("stripe")}
                    className={`w-full rounded-lg border-2 p-4 text-left transition-all ${
                      selectedPaymentMethod === "stripe"
                        ? "border-primary bg-primary/10 dark:border-secondary dark:bg-secondary/10"
                        : "border-gray-300 bg-white hover:border-gray-400 dark:border-gray-600 dark:bg-gray-800 dark:hover:border-gray-500"
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className="mt-0.5">
                        <div className={`h-5 w-5 rounded-full border-2 flex items-center justify-center ${
                          selectedPaymentMethod === "stripe"
                            ? "border-primary dark:border-secondary"
                            : "border-gray-400 dark:border-gray-500"
                        }`}>
                          {selectedPaymentMethod === "stripe" && (
                            <div className="h-3 w-3 rounded-full bg-primary dark:bg-secondary" />
                          )}
                        </div>
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-2xl">💳</span>
                          <span className="font-semibold text-black dark:text-white">
                            Credit/Debit Card
                          </span>
                        </div>
                        <p className="text-xs text-gray-600 dark:text-gray-400">
                          Powered by Stripe • Instant payment
                        </p>
                      </div>
                    </div>
                  </button>
                </div>
              </div>
            )}

            {/* Expiration Date */}
            {selectedPlan.numberInterval.length > 0 && (
              <div className="rounded-lg bg-gray-100 p-4 dark:bg-gray-700">
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Plan will expire on:
                </p>
                <p className="text-lg font-bold text-black dark:text-white">
                  {(() => {
                    const now = Date.now();
                    const intervals = Number(selectedPlan.numberInterval[0]);
                    const days = getIntervalDays(selectedPlan.renewalInterval);
                    const expiryDate = new Date(now + intervals * days * 24 * 60 * 60 * 1000);
                    return expiryDate.toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    });
                  })()}
                </p>
              </div>
            )}

            {/* Amount Due Now */}
            {selectedPlan.renewalPriceUsdtE6s > 0n && (
              <div className="rounded-lg border-2 border-primary bg-primary/10 p-4 dark:border-secondary dark:bg-secondary/10">
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Amount due now:
                </p>
                <p className="text-2xl font-bold text-primary dark:text-secondary">
                  {formatPrice(selectedPlan.renewalPriceUsdtE6s)}
                </p>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-3 pt-2">
              <button
                onClick={() => {
                  setSelectedPlan(null);
                  setSelectedPaymentMethod("ckusdt"); // Reset to default
                }}
                disabled={settingSubscription}
                className="flex-1 rounded-lg border-2 border-gray-300 bg-white py-2.5 font-semibold text-gray-700 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  if (selectedPlan && user) {
                    if (selectedPaymentMethod === "ckusdt") {
                      // Current flow: direct subscription update with ckUSDT
                      updateSubscription(selectedPlan.id);
                    } else {
                      // Stripe flow: redirect to Stripe Checkout
                      const checkoutUrl = getStripeCheckoutUrl(
                        selectedPlan.id,
                        user.principal.toString()
                      );

                      if (checkoutUrl === "#") {
                        alert(`Stripe payment link not configured for plan: ${selectedPlan.name}`);
                        return;
                      }

                      // Redirect to Stripe Checkout
                      window.location.href = checkoutUrl;
                    }
                  }
                }}
                disabled={settingSubscription}
                className="flex min-h-[42px] flex-1 items-center justify-center rounded-lg bg-primary py-2.5 font-semibold text-white transition-colors hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-secondary dark:hover:bg-secondary/90"
              >
                {settingSubscription ? (
                  <img src={SpinnerSvg} alt="Loading..." className="h-6 w-6" />
                ) : selectedPlan.renewalPriceUsdtE6s === 0n ? (
                  "Proceed"
                ) : selectedPaymentMethod === "stripe" ? (
                  "Proceed to Stripe"
                ) : (
                  "Proceed with ckUSDT"
                )}
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default Plans;
