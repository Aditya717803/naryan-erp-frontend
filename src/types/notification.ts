export interface Notification {
  id: number;
  title: string;
  message: string;
  notification_type: string;
  product_id: number | null;
  is_read: boolean;
  created_at: string;
}