import { useState, useEffect } from "react";
import { useAuth } from "@nfid/identitykit/react";
import { useLocation } from "react-router-dom";
import ProfileTab from "./ProfileTab";
import SubscriptionTab from "./SubscriptionTab";

enum Tab {
  Profile = "profile",
  Subscription = "subscription",
}

const Profile = () => {
  const { user } = useAuth();
  const location = useLocation();
  const [activeTab, setActiveTab] = useState<Tab>(Tab.Profile);

  // Check if we should open subscription tab from navigation state
  useEffect(() => {
    if (location.state?.tab === "subscription") {
      setActiveTab(Tab.Subscription);
    }
  }, [location.state]);

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
          onClick={() => setActiveTab(Tab.Profile)}
          className={`px-6 py-3 font-bold transition-colors ${
            activeTab === Tab.Profile
              ? "border-b-2 border-primary text-primary dark:border-secondary dark:text-secondary"
              : "text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200"
          }`}
        >
          Profile
        </button>
        <button
          onClick={() => setActiveTab(Tab.Subscription)}
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
