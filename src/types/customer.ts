export interface Customer {
  id: number;
  customer_code: string;
  name: string;
  gstin_uin?: string | null;
  contact_person?: string | null;
  address?: string | null;
  state_id?: number;
}

export interface CreateCustomerDTO {
  name: string;
  gstin_uin?: string | null;
  contact_person?: string | null;
  address?: string;
  state_id: number;
}