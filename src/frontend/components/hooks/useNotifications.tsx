import { backendActor } from "../actors/BackendActor";
import { ProcessedNotification } from "../../types/notifications";
import { Notification } from "../../../declarations/backend/backend.did";
import { fromE6s } from "../../utils/conversions";

export const useNotifications = () => {

  // Query user notifications
  const { data: rawNotifications, call: refetchNotifications } =
    backendActor.useQueryCall({
      functionName: "get_user_notifications",
      args: [], // Empty args array to trigger the query
    });

  // Mark notification as read
  const { call: markAsRead } = backendActor.useUpdateCall({
    functionName: "mark_notification_as_read",
  });

  // Process raw notifications from backend
  const processNotifications = (
    notifications: Notification[],
  ): ProcessedNotification[] => {
    return notifications.map((notification) => {
      const id = notification.id;
      const timestamp = new Date(Number(notification.timestamp / 1000000n)); // Convert from nanoseconds
      const isRead = "READ" in notification.state;

      if ("IP_PURCHASED" in notification.notificationType) {
        const data = notification.notificationType.IP_PURCHASED;
        const priceInUSDT = fromE6s(data.price);
        return {
          id,
          type: "IP_PURCHASED" as const,
          title: "IP Sold!",
          message: `Your IP #${data.ipId} was purchased for ${priceInUSDT} ckUSDT`,
          timestamp,
          isRead,
          data: {
            ipId: data.ipId.toString(),
            buyer: data.buyer.toString(),
            price: priceInUSDT.toString(),
          },
        };
      } else if ("ROYALTY_RECEIVED" in notification.notificationType) {
        const data = notification.notificationType.ROYALTY_RECEIVED;
        const amountInUSDT = fromE6s(data.amount);
        return {
          id,
          type: "ROYALTY_RECEIVED" as const,
          title: "Royalty Received!",
          message: `You received ${amountInUSDT} ckUSDT royalty from IP #${data.ipId}`,
          timestamp,
          isRead,
          data: {
            ipId: data.ipId.toString(),
            amount: amountInUSDT.toString(),
            fromSale: data.fromSale.toString(),
          },
        };
      } else {
        // Fallback for unknown notification types
        return {
          id,
          type: "IP_PURCHASED" as const,
          title: "Notification",
          message: "You have a new notification",
          timestamp,
          isRead,
          data: {},
        };
      }
    });
  };

  const notifications = rawNotifications !== undefined
    ? processNotifications(rawNotifications)
    : [];
  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const markNotificationsAsRead = async (notificationId: bigint) => {
    try {
      await markAsRead([{ notificationId }]);
      refetchNotifications();
      return true;
    } catch (error) {
      console.error("Failed to mark notification as read:", error);
      return false;
    }
  };

  return {
    notifications,
    unreadCount,
    markNotificationsAsRead,
    refetchNotifications,
    isLoading: !rawNotifications && rawNotifications !== null,
  };
};
