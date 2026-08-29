export interface InvoiceItem {
  id?: number;
  invoice_id?: number;
  product_id: number;
  description?: string;
  hsn_sac?: string | null;
  quantity: number;
  unit?: string | null;
  rate: number;
  amount?: number;
  gst_rate?: number;
  cgst_rate?: number;
  cgst_amount?: number;
  sgst_rate?: number;
  sgst_amount?: number;
  igst_rate?: number;
  igst_amount?: number;
}

export interface Invoice {
  id: number;
  invoice_number: string;
  customer_id: number;
  invoice_date: string;
  eway_bill_number?: string | null;
  delivery_note?: string | null;
  payment_terms?: string | null;
  supplier_reference?: string | null;
  other_references?: string | null;
  buyer_order_number?: string | null;
  buyer_order_date?: string | null;
  dispatch_document_number?: string | null;
  delivery_note_date?: string | null;
  dispatched_through?: string | null;
  destination?: string | null;
  lr_rr_number?: string | null;
  vehicle_number?: string | null;
  terms_of_delivery?: string | null;
  subtotal: number;
  cgst_rate?: number;
  cgst_amount?: number;
  sgst_rate?: number;
  sgst_amount?: number;
  igst_rate?: number;
  igst_amount?: number;
  round_off?: number;
  grand_total: number;
  items?: InvoiceItem[];
}

export interface CreateInvoiceDTO {
  customer_id: number;
  invoice_date: string; // ISO date
  items: Array<{
    product_id: number;
    description?: string;
    hsn_sac?: string | null;
    quantity: number;
    unit?: string | null;
    rate: number;
    gst_rate?: number;
  }>;
  eway_bill_number?: string | null;
  delivery_note?: string | null;
  payment_terms?: string | null;
  supplier_reference?: string | null;
  other_references?: string | null;
  buyer_order_number?: string | null;
  buyer_order_date?: string | null;
  dispatch_document_number?: string | null;
  delivery_note_date?: string | null;
  dispatched_through?: string | null;
  destination?: string | null;
  lr_rr_number?: string | null;
  vehicle_number?: string | null;
  terms_of_delivery?: string | null;
}