import { useState } from "react";
import { MdNotifications, MdNotificationsNone } from "react-icons/md";
import { useNotificationContext } from "./NotificationContext";
import NotificationDropdown from "./NotificationDropdown";

const NotificationBell = () => {
  const { unreadCount } = useNotificationContext();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        data-notification-bell
        className="relative h-10 w-10 rounded-full bg-white p-2 text-xl text-black dark:bg-white/10 dark:text-white"
      >
        {unreadCount > 0 ? (
          <MdNotifications size={22} />
        ) : (
          <MdNotificationsNone size={22} />
        )}

        {unreadCount > 0 && (
          <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs font-bold text-white">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {isOpen && <NotificationDropdown onClose={() => setIsOpen(false)} />}
    </div>
  );
};

export default NotificationBell;
