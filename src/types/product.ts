export interface Product {
  id: number;
  product_code: string;
  name: string;
  hsn_sac: string | null;
  unit: string;
}

export interface CreateProductDTO {
  product_code: string;
  name: string;
  hsn_sac?: string | null;
  unit: string;
}