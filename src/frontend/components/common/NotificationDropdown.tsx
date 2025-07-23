import { useRef, useEffect } from "react";
import { useNotificationContext } from "./NotificationContext";
import NotificationItem from "./NotificationItem";

interface NotificationDropdownProps {
  onClose: () => void;
}

const NotificationDropdown = ({ onClose }: NotificationDropdownProps) => {
  const { notifications, isLoading } = useNotificationContext();
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        onClose();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [onClose]);

  return (
    <div
      ref={dropdownRef}
      className="absolute right-0 top-12 z-[9999] max-h-96 w-80 overflow-y-auto rounded-lg border border-gray-200 bg-white shadow-lg dark:border-gray-700 dark:bg-background-dark"
    >
      <div className="sticky top-0 border-b border-gray-200 bg-white px-4 py-3 dark:border-gray-700 dark:bg-background-dark">
        <h3 className="text-lg font-semibold text-black dark:text-white">
          Notifications
        </h3>
      </div>

      <div className="max-h-80 overflow-y-auto">
        {isLoading ? (
          <div className="p-4 text-center text-gray-500 dark:text-gray-400">
            Loading notifications...
          </div>
        ) : notifications.length === 0 ? (
          <div className="p-4 text-center text-gray-500 dark:text-gray-400">
            No notifications yet
          </div>
        ) : (
          notifications.map((notification) => (
            <NotificationItem
              key={notification.id}
              notification={notification}
              onClick={onClose}
            />
          ))
        )}
      </div>
    </div>
  );
};

export default NotificationDropdown;
