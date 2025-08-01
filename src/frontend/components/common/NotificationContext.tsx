import {
  createContext,
  useContext,
  useEffect,
  ReactNode,
} from "react";
import { useAuth } from "@ic-reactor/react";
import { useNotifications } from "../hooks/useNotifications";
import { ProcessedNotification } from "../../types/notifications";

interface NotificationContextType {
  notifications: ProcessedNotification[];
  unreadCount: number;
  markAsRead: (notificationId: bigint) => Promise<boolean>;
  isLoading: boolean;
}

const NotificationContext = createContext<NotificationContextType | undefined>(
  undefined,
);

interface NotificationProviderProps {
  children: ReactNode;
}

export const NotificationProvider = ({
  children,
}: NotificationProviderProps) => {
  const { authenticated } = useAuth();
  const {
    notifications,
    unreadCount,
    markNotificationsAsRead,
    refetchNotifications,
    isLoading,
  } = useNotifications();

  // Poll for new notifications every 30 seconds when authenticated
  useEffect(() => {
    if (!authenticated) return;

    const interval = setInterval(() => {
      refetchNotifications();
    }, 30000); // 30 seconds

    // Initial fetch
    refetchNotifications();

    return () => clearInterval(interval);
  }, [authenticated]);

  const contextValue: NotificationContextType = {
    notifications,
    unreadCount,
    markAsRead: markNotificationsAsRead,
    isLoading,
  };

  return (
    <NotificationContext.Provider value={contextValue}>
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotificationContext = () => {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error(
      "useNotificationContext must be used within a NotificationProvider",
    );
  }
  return context;
};
