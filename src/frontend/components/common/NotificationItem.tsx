import { useState } from "react";
import { MdSell, MdAccountBalanceWallet } from "react-icons/md";
import { useNotificationContext } from "./NotificationContext";
import { ProcessedNotification } from "../../types/notifications";

interface NotificationItemProps {
  notification: ProcessedNotification;
  onClick: () => void;
}

const NotificationItem = ({ notification, onClick }: NotificationItemProps) => {
  const { markAsRead } = useNotificationContext();
  const [isLoading, setIsLoading] = useState(false);

  const handleClick = async () => {
    if (!notification.isRead) {
      setIsLoading(true);
      try {
        await markAsRead(notification.id);
      } finally {
        setIsLoading(false);
      }
    }
    onClick();
  };

  const getIcon = () => {
    switch (notification.type) {
      case "IP_PURCHASED":
        return <MdSell className="text-green-500" size={20} />;
      case "ROYALTY_RECEIVED":
        return <MdAccountBalanceWallet className="text-blue-500" size={20} />;
      default:
        return <MdSell className="text-gray-500" size={20} />;
    }
  };

  const formatTimeAgo = (timestamp: Date) => {
    const now = new Date();
    const diffMs = now.getTime() - timestamp.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return timestamp.toLocaleDateString();
  };

  return (
    <div
      className={`cursor-pointer border-b border-gray-200 p-4 transition-colors hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-800 ${
        !notification.isRead ? "bg-blue-50 dark:bg-blue-900/20" : ""
      }`}
      onClick={handleClick}
    >
      <div className="flex items-start space-x-3">
        <div className="mt-1 flex-shrink-0">{getIcon()}</div>

        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between">
            <p className="truncate text-sm font-medium text-black dark:text-white">
              {notification.title}
            </p>
            {!notification.isRead && (
              <div className="ml-2 flex-shrink-0">
                {isLoading ? (
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-blue-500 border-t-transparent" />
                ) : (
                  <div className="h-2 w-2 rounded-full bg-blue-500" />
                )}
              </div>
            )}
          </div>

          <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
            {notification.message}
          </p>

          <p className="mt-2 text-xs text-gray-500 dark:text-gray-500">
            {formatTimeAgo(notification.timestamp)}
          </p>
        </div>
      </div>
    </div>
  );
};

export default NotificationItem;
