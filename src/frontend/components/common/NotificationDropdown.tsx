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
      const target = event.target as Node;
      
      // Don't close if clicking on the dropdown itself
      if (dropdownRef.current && dropdownRef.current.contains(target)) {
        return;
      }
      
      // Don't close if clicking on the notification bell button or its children
      const bellButton = document.querySelector('[data-notification-bell]');
      if (bellButton && bellButton.contains(target)) {
        return;
      }
      
      onClose();
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [onClose]);

  return (
    <div
      ref={dropdownRef}
      className="fixed left-1/2 top-1/2 z-[9999] h-[80vh] w-[90vw] max-w-sm -translate-x-1/2 -translate-y-1/2 overflow-y-auto rounded-lg border border-gray-200 bg-white shadow-lg dark:border-gray-700 dark:bg-background-dark sm:absolute sm:left-auto sm:top-12 sm:right-0 sm:h-auto sm:w-80 sm:max-h-96 sm:translate-x-0 sm:translate-y-0"
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
