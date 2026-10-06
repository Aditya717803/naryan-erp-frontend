export interface Inventory {
  id: number;
  product_id: number;
  quantity: number;
  bundle_count: number;
  created_at: string;
  updated_at: string;
}

export interface InventoryAdjustment {
  quantity: number;
  bundle_count?: number;
  note?: string | null;
}

export interface BundleCountAdjustment {
  count: number;
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