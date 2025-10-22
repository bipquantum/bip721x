import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useActors } from "../../common/ActorsContext";
import SpinnerSvg from "../../../assets/spinner.svg";
import { Plan, SSubscription } from "../../../../declarations/backend/backend.did";
import { FiCheck, FiArrowRight } from "react-icons/fi";

const SubscriptionTab = () => {
  const { authenticated } = useActors();
  const navigate = useNavigate();
  const [subscription, setSubscription] = useState<SSubscription | null>(null);
  const [currentPlan, setCurrentPlan] = useState<Plan | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authenticated) return;

    const fetchData = async () => {
      try {
        const subData = await authenticated.backend.get_subscription();
        setSubscription(subData);

        const plansData = await authenticated.backend.get_plans();
        const plan = plansData.find((p) => p.id === subData.planId);
        if (plan) {
          setCurrentPlan(plan);
        }
      } catch (error) {
        console.error("Error fetching subscription:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [authenticated]);

  if (loading) {
    return (
      <div className="flex h-full w-full items-center justify-center">
        <img src={SpinnerSvg} alt="Loading..." className="h-12 w-12" />
      </div>
    );
  }

  if (!subscription || !currentPlan) {
    return (
      <div className="flex h-full w-full items-center justify-center">
        <p className="text-gray-600 dark:text-gray-400">No subscription found</p>
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

  const formatInterval = (days: bigint): string => {
    const numDays = Number(days);
    if (numDays === 30) return "month";
    if (numDays === 365) return "year";
    return `${numDays} days`;
  };

  const formatDate = (timestamp: bigint): string => {
    const date = new Date(Number(timestamp) / 1_000_000);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const formatDuration = (numberInterval: [] | [bigint], intervalDays: bigint): string => {
    if (numberInterval.length === 0) {
      return "Never expires";
    }
    const intervals = Number(numberInterval[0]);
    const days = Number(intervalDays);
    const totalDays = intervals * days;

    if (totalDays >= 365) {
      return `${Math.floor(totalDays / 365)} year${Math.floor(totalDays / 365) > 1 ? "s" : ""}`;
    }
    if (totalDays >= 30) {
      return `${Math.floor(totalDays / 30)} month${Math.floor(totalDays / 30) > 1 ? "s" : ""}`;
    }
    return `${totalDays} days`;
  };

  const creditsPercentage = Number(subscription.availableCredits) / Number(currentPlan.intervalCredits) * 100;
  const isActive = "Active" in subscription.state;

  return (
    <div className="flex w-full flex-col items-center space-y-6">
      {/* Current Plan Card */}
      <div className="w-full max-w-4xl rounded-2xl border-2 border-primary bg-primary/5 p-5 shadow-lg dark:border-secondary dark:bg-secondary/5">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-black dark:text-white">
            {currentPlan.name}
          </h2>
          <span
            className={`rounded-full px-3 py-1 text-xs font-semibold ${
              isActive
                ? "bg-green-500 text-white"
                : "bg-orange-500 text-white"
            }`}
          >
            {isActive ? "Active ✓" : "Past Due"}
          </span>
        </div>

        <div className="mb-4">
          <span className="text-3xl font-extrabold text-primary dark:text-secondary">
            {formatPrice(currentPlan.renewalPriceUsdtE6s)}
          </span>
          {currentPlan.renewalPriceUsdtE6s > 0n && (
            <span className="ml-2 text-lg text-gray-600 dark:text-gray-400">
              / {formatInterval(currentPlan.renewalIntervalDays)}
            </span>
          )}
        </div>

        <div className="mb-4 space-y-2">
          <div className="flex items-center gap-2">
            <FiCheck className="text-green-500" size={16} />
            <span className="text-sm text-gray-700 dark:text-gray-300">
              {formatCredits(currentPlan.intervalCredits)} credits per {formatInterval(currentPlan.renewalIntervalDays)}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <FiCheck className="text-green-500" size={16} />
            <span className="text-sm text-gray-700 dark:text-gray-300">
              Duration: {formatDuration(currentPlan.numberInterval, currentPlan.renewalIntervalDays)}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <FiCheck className="text-green-500" size={16} />
            <span className="text-sm text-gray-700 dark:text-gray-300">
              Next renewal: {formatDate(subscription.nextRenewalDate)}
            </span>
          </div>

          {subscription.expiryDate.length > 0 && (
            <div className="flex items-center gap-2">
              <FiCheck className="text-green-500" size={16} />
              <span className="text-sm text-gray-700 dark:text-gray-300">
                Expires: {formatDate(subscription.expiryDate[0]!)}
              </span>
            </div>
          )}
        </div>

        <button
          onClick={() => navigate("/plans")}
          className="flex w-full items-center justify-center gap-2 rounded-lg bg-primary py-2.5 font-semibold text-white transition-colors hover:bg-primary/90 dark:bg-secondary dark:hover:bg-secondary/90"
        >
          Change Plan
          <FiArrowRight size={18} />
        </button>
      </div>

      {/* Credits Dashboard */}
      <div className="w-full max-w-4xl rounded-lg bg-white p-6 shadow dark:bg-gray-800">
        <h3 className="mb-4 text-xl font-bold text-black dark:text-white">
          Credit Usage
        </h3>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          {/* Available Credits */}
          <div>
            <p className="mb-2 text-sm text-gray-600 dark:text-gray-400">
              Available Credits
            </p>
            <p className="mb-3 text-3xl font-bold text-primary dark:text-secondary">
              {formatCredits(subscription.availableCredits)}
            </p>
            <div className="h-2 w-full overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700">
              <div
                className="h-full bg-primary transition-all dark:bg-secondary"
                style={{ width: `${Math.min(creditsPercentage, 100)}%` }}
              />
            </div>
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
              {creditsPercentage.toFixed(1)}% of monthly limit
            </p>
          </div>

          {/* Used This Period */}
          <div>
            <p className="mb-2 text-sm text-gray-600 dark:text-gray-400">
              Used This Period
            </p>
            <p className="mb-3 text-3xl font-bold text-black dark:text-white">
              {formatCredits(currentPlan.intervalCredits - subscription.availableCredits)}
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {((Number(currentPlan.intervalCredits - subscription.availableCredits) / Number(currentPlan.intervalCredits)) * 100).toFixed(1)}% used
            </p>
          </div>

          {/* Total Credits Used */}
          <div>
            <p className="mb-2 text-sm text-gray-600 dark:text-gray-400">
              Total Credits Used
            </p>
            <p className="mb-3 text-3xl font-bold text-black dark:text-white">
              {formatCredits(subscription.totalCreditsUsed)}
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              All-time usage
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SubscriptionTab;
