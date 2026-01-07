import { useEffect } from "react";
import { useAuth } from "@nfid/identitykit/react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import ProfileTab from "./ProfileTab";
import SubscriptionTab from "./SubscriptionTab";

enum Tab {
  Profile = "profile",
  Subscription = "subscription",
}

const Profile = () => {
  const { user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const { tab } = useParams<{ tab?: string }>();

  // Determine active tab from URL parameter
  const activeTab = tab === "subscription" ? Tab.Subscription : Tab.Profile;

  // Check query parameters for Stripe redirect
  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);

    // Optional: Show success message if coming from Stripe
    if (searchParams.get("payment") === "success") {
      console.log("Payment successful! Subscription will be activated via webhook.");
    }
  }, [location.search]);

  if (!user) {
    return <></>;
  }

  return (
    <div
      key={user?.principal.toText() || "anonymous"}
      className="flex h-full w-full flex-col items-center overflow-y-auto p-4 font-semibold text-black dark:text-white"
    >
      {/* Tab Headers */}
      <div className="mb-6 flex w-full max-w-4xl gap-2 border-b border-gray-300 dark:border-gray-600">
        <button
          onClick={() => navigate("/profile")}
          className={`px-6 py-3 font-bold transition-colors ${
            activeTab === Tab.Profile
              ? "border-b-2 border-primary text-primary dark:border-secondary dark:text-secondary"
              : "text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200"
          }`}
        >
          Profile
        </button>
        <button
          onClick={() => navigate("/profile/subscription")}
          className={`px-6 py-3 font-bold transition-colors ${
            activeTab === Tab.Subscription
              ? "border-b-2 border-primary text-primary dark:border-secondary dark:text-secondary"
              : "text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200"
          }`}
        >
          Subscription
        </button>
      </div>

      {/* Tab Content */}
      <div className="w-full flex-grow">
        {activeTab === Tab.Profile && <ProfileTab />}
        {activeTab === Tab.Subscription && <SubscriptionTab />}
      </div>
    </div>
  );
};

export default Profile;
