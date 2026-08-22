export type Role = "admin" | "manager" | "employee";

export interface User {
  id: number;
  user_id: string;
  name: string;
  is_active: boolean;
  created_at: string;
}

export interface TokenResponse {
  access_token: string;
  refresh_token: string;
  token_type: string;
  expires_in: number;
}

export interface LoginCredentials {
  user_id: string;
  password: string;
}

export type StoreType = "store" | "plant";

export interface BillingLocation {
  id: StoreType;
  name: string;
  subtitle: string;
  address: string;
  gstin: string;
  features: string[];
}
