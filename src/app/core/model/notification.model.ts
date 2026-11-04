export type NotificationType =
  | 'REQUEST_RECEIVED' | 'REQUEST_ACCEPTED' | 'REQUEST_REJECTED' | 'REQUEST_CANCELLED'
  | 'TRIP_CANCELLED' | 'ACCOUNT_WARNING' | 'ACCOUNT_SUSPENDED';

export interface AppNotification {
  id: number;
  type: NotificationType;
  message: string;
  read: boolean;
  createdAt: string;
}