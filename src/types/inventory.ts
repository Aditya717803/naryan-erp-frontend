export interface Inventory {
  id: number;
  product_id: number;
  quantity: number;
  created_at: string;
  updated_at: string;
}

export interface InventoryAdjustment {
  quantity: number;
  note?: string | null;
}

export interface InventoryTransaction {
  id: number;
  product_id: number;
  transaction_type: string;
  quantity: number;
  note: string | null;
  created_at: string;
}