export type NotificationState = { UNREAD: null } | { READ: null };

export type NotificationType =
  | { IP_PURCHASED: { ipId: bigint; buyer: string; price: bigint } }
  | { ROYALTY_RECEIVED: { ipId: bigint; amount: bigint; fromSale: string } };

export interface Notification {
  id: bigint;
  notificationType: NotificationType;
  state: NotificationState;
  timestamp: bigint;
  recipient: string;
}

export interface ProcessedNotification {
  id: bigint;
  type: "IP_PURCHASED" | "ROYALTY_RECEIVED";
  title: string;
  message: string;
  timestamp: Date;
  isRead: boolean;
  data: {
    ipId?: string;
    buyer?: string;
    price?: string;
    amount?: string;
    fromSale?: string;
  };
}
