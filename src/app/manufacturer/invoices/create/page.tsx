"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Loader2,
  Plus,
  Trash2,
  AlertCircle,
  X,
  ChevronRight,
  FileText,
  Package,
  Truck,
  Receipt,
  User,
  Sparkles,
} from "lucide-react";
import Link from "next/link";

import {
createManufactureInvoice,
getManufactureCustomers,
getManufactureProducts,
getNextManufactureInvoiceNumber,
} from "@/lib/api";

import type { Customer } from "@/types/customer";
import type { Product } from "@/types/product";
import type { CreateInvoiceDTO } from "@/types/invoice";

interface InvoiceRow {
  product_id: number | "";
  quantity: number;
  rate: number;
  gst_rate: number | null;
}

const emptyRow: InvoiceRow = {
  product_id: "",
  quantity: 1,
  rate: 0,
  gst_rate: 18,
};

export default function CreateInvoicePage() {
  const router = useRouter();

  const [customers, setCustomers] = useState<Customer[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [nextInvoiceNumber, setNextInvoiceNumber] = useState("");   
  const [customerId, setCustomerId] = useState<number | "">("");
  const [invoiceDate, setInvoiceDate] = useState(() => {
  const today = new Date();

  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, "0");
  const day = String(today.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
});

  const [items, setItems] = useState<InvoiceRow[]>([
    { ...emptyRow },
  ]);

  const [ewayBillNumber, setEwayBillNumber] = useState("");
  const [deliveryNote, setDeliveryNote] = useState("");
  const [paymentTerms, setPaymentTerms] = useState("");
  const [supplierReference, setSupplierReference] = useState("");
  const [otherReferences, setOtherReferences] = useState("");
  const [buyerOrderNumber, setBuyerOrderNumber] = useState("");
  const [buyerOrderDate, setBuyerOrderDate] = useState("");
  const [dispatchDocumentNumber, setDispatchDocumentNumber] =
    useState("");
  const [deliveryNoteDate, setDeliveryNoteDate] = useState("");
  const [dispatchedThrough, setDispatchedThrough] = useState("");
  const [destination, setDestination] = useState("");
  const [lrRrNumber, setLrRrNumber] = useState("");
  const [vehicleNumber, setVehicleNumber] = useState("");
  const [termsOfDelivery, setTermsOfDelivery] = useState("");

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
  const loadInvoiceNumber = async () => {
    try {
      const data = await getNextManufactureInvoiceNumber();

      setNextInvoiceNumber(data.invoice_number);
    } catch (error) {
      console.error(
        "Failed to load invoice number:",
        error,
      );
    }
  };

  loadInvoiceNumber();
}, []);


  useEffect(() => {
    async function loadInitialData() {
      try {
        setLoading(true);
        setError(null);

        const [customerData, productData] = await Promise.all([
          getManufactureCustomers(),
          getManufactureProducts(),
        ]);

        setCustomers(customerData);
        setProducts(productData);
      } catch (err) {
        console.error(err);

        setError(
          err instanceof Error
            ? err.message
            : "Failed to load customers and products.",
        );
      } finally {
        setLoading(false);
      }
    }

    loadInitialData();
  }, []);

  function updateItem(
    index: number,
    field: keyof InvoiceRow,
    value: number | string | null,
  ) {
    setItems((current) =>
      current.map((item, itemIndex) => {
        if (itemIndex !== index) {
          return item;
        }

        return {
          ...item,
          [field]:
            field === "product_id"
              ? value === ""
                ? ""
                : Number(value)
              : field === "gst_rate"
                ? value === ""
                  ? null
                  : Number(value)
                : Number(value),
        };
      }),
    );
  }

  function selectProduct(index: number, productId: string) {
    setItems((current) =>
      current.map((item, itemIndex) => {
        if (itemIndex !== index) {
          return item;
        }

        return {
          ...item,
          product_id: productId === "" ? "" : Number(productId),
        };
      }),
    );
  }

  function addItem() {
    setItems((current) => [...current, { ...emptyRow }]);
  }

  function removeItem(index: number) {
    setItems((current) => {
      if (current.length === 1) {
        return current;
      }

      return current.filter((_, itemIndex) => itemIndex !== index);
    });
  }

  const totals = useMemo(() => {
    let subtotal = 0;
    let cgst = 0;
    let sgst = 0;

    for (const item of items) {
      const amount = Number(item.quantity || 0) * Number(item.rate || 0);
      const gstRate = Number(item.gst_rate || 0);

      subtotal += amount;

      const halfRate = gstRate / 2;

      cgst += (amount * halfRate) / 100;
      sgst += (amount * halfRate) / 100;
    }

    const total = subtotal + cgst + sgst;

    return { subtotal, cgst, sgst, total };
  }, [items]);

  const selectedCustomer = useMemo(
    () => customers.find((customer) => customer.id === customerId),
    [customers, customerId],
  );

  const filledItemCount = useMemo(
    () => items.filter((item) => item.product_id !== "").length,
    [items],
  );

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setError(null);

    if (!customerId) {
      setError("Please select a customer.");
      return;
    }

    if (items.length === 0) {
      setError("Add at least one invoice item.");
      return;
    }

    for (const item of items) {
      if (!item.product_id) {
        setError("Please select a product for every item.");
        return;
      }

      if (item.quantity <= 0) {
        setError("Quantity must be greater than zero.");
        return;
      }

      if (item.rate <= 0) {
        setError("Rate must be greater than zero.");
        return;
      }

      if (
        item.gst_rate !== null &&
        (item.gst_rate < 0 || item.gst_rate > 100)
      ) {
        setError("GST rate must be between 0 and 100.");
        return;
      }
    }

    const payload: CreateInvoiceDTO = {
      customer_id: Number(customerId),
      invoice_date: invoiceDate,

      items: items.map((item) => ({
        product_id: Number(item.product_id),
        quantity: Number(item.quantity),
        rate: Number(item.rate),
        gst_rate: item.gst_rate === null ? undefined : Number(item.gst_rate),
      })),

      eway_bill_number: ewayBillNumber.trim() || null,
      delivery_note: deliveryNote.trim() || null,
      payment_terms: paymentTerms.trim() || null,
      supplier_reference: supplierReference.trim() || null,
      other_references: otherReferences.trim() || null,

      buyer_order_number: buyerOrderNumber.trim() || null,
      buyer_order_date: buyerOrderDate || null,

      dispatch_document_number: dispatchDocumentNumber.trim() || null,
      delivery_note_date: deliveryNoteDate || null,

      dispatched_through: dispatchedThrough.trim() || null,
      destination: destination.trim() || null,
      lr_rr_number: lrRrNumber.trim() || null,
      vehicle_number: vehicleNumber.trim() || null,
      terms_of_delivery: termsOfDelivery.trim() || null,
    };

    try {
      setSubmitting(true);

      const invoice = await createManufactureInvoice(payload);

      router.push(`/manufracturer/invoices/${invoice.id}`);
    } catch (err) {
      console.error(err);

      setError(
        err instanceof Error ? err.message : "Failed to create invoice.",
      );
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-[400px] flex-col items-center justify-center gap-3">
        <div className="relative">
          <div className="absolute inset-0 animate-ping rounded-full bg-indigo-200 opacity-40" />
          <Loader2 size={24} className="relative animate-spin text-indigo-600" />
        </div>
        <span className="text-sm font-medium text-slate-500">
          Loading invoice data...
        </span>
      </div>
    );
  }

  return (
    <div className="relative min-h-full p-6 sm:p-10">
      {/* Subtle grid background */}
      <div className="pointer-events-none absolute inset-0 z-0" />
      {/* Soft ambient glow */}
      <div className="pointer-events-none absolute -top-24 right-0 z-0 h-96 w-96 rounded-full bg-indigo-200/20 blur-3xl" />

      <div className="relative z-10 mx-auto max-w-6xl">
        {/* Header */}
        <div className="mb-8 flex flex-col gap-4">
          <Link
            href="/manufacturer/invoices"
            className="group inline-flex w-fit items-center gap-2 text-sm font-medium text-slate-500 transition-colors hover:text-indigo-600"
          >
            <ArrowLeft
              size={16}
              className="transition-transform group-hover:-translate-x-1"
            />
            Back to Invoices
          </Link>

          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
            <div>
              <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-indigo-100 bg-indigo-50/70 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.15em] text-indigo-600">
                <Sparkles size={12} />
                New Draft
              </div>
              <h1 className="text-3xl font-light tracking-tight text-[#0f172a]">
                Create <span className="font-bold text-indigo-600">Invoice</span>
              </h1>
              <p className="mt-1.5 text-sm text-slate-500">
                Draft a new billing record and link it to a customer.
              </p>
            </div>

            {/* Live snapshot */}
            <div className="flex items-center gap-6 rounded-2xl border border-slate-100 bg-white/80 px-6 py-4 shadow-sm backdrop-blur-sm">
              <div>
                <p className="font-mono text-[10px] font-medium uppercase tracking-[0.2em] text-slate-400">
                  Items
                </p>
                <p className="text-lg font-bold text-[#0f172a]">
                  {filledItemCount}
                </p>
              </div>
              <div className="h-8 w-px bg-slate-200" />
              <div>
                <p className="font-mono text-[10px] font-medium uppercase tracking-[0.2em] text-slate-400">
                  Grand Total
                </p>
                <p className="text-lg font-bold text-indigo-600">
                  ₹
                  {totals.total.toLocaleString("en-IN", {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="mb-8 flex items-center justify-between rounded-xl border border-red-200 bg-red-50/80 px-5 py-4 text-sm text-red-700 shadow-sm backdrop-blur-sm animate-in fade-in slide-in-from-top-2">
            <div className="flex items-center gap-3">
              <AlertCircle size={18} />
              <span className="font-medium">{error}</span>
            </div>
            <button
              type="button"
              onClick={() => setError(null)}
              className="text-red-500 transition-colors hover:text-red-700"
            >
              <X size={18} />
            </button>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Invoice basic information */}
          <section className="rounded-3xl border border-slate-100 bg-white/90 p-8 shadow-[0_8px_30px_rgb(0,0,0,0.06)] backdrop-blur-md transition-shadow hover:shadow-[0_8px_36px_rgb(0,0,0,0.08)]">
            <div className="mb-6 flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600">
                <User size={16} strokeWidth={2.5} />
              </div>
              <h2 className="text-lg font-semibold text-[#0f172a]">
                Primary Details
              </h2>
            </div>

            <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
              <div>
                  <label className="mb-2 block font-mono text-[11px] font-medium uppercase tracking-[0.2em] text-slate-500">
                    Invoice Number
                  </label>

                  <div className="flex h-[52px] w-full items-center rounded-xl border border-slate-200 bg-slate-50 px-4">
                    <span className="font-mono text-sm font-semibold text-slate-700">
                      {nextInvoiceNumber || "Loading..."}
                    </span>
                  </div>

                  <p className="mt-2 text-xs text-slate-400">
                    Automatically assigned when the invoice is created.
                  </p>
                </div>

              <div>
                <label className="mb-2 block font-mono text-[11px] font-medium uppercase tracking-[0.2em] text-slate-500">
                  Invoice Date *
                </label>
                <input
                  required
                  type="date"
                  value={invoiceDate}
                  onChange={(event) => setInvoiceDate(event.target.value)}
                  className="h-[52px] w-full rounded-xl border border-slate-200 bg-white/80 px-4 text-sm text-slate-700 shadow-sm outline-none backdrop-blur-sm transition-all focus:border-indigo-600 focus:bg-white focus:ring-1 focus:ring-indigo-600"
                />
              </div>

              <div>
                <label className="mb-2 block font-mono text-[11px] font-medium uppercase tracking-[0.2em] text-slate-500">
                  Customer *
                </label>
                <div className="relative">
                  <select
                    required
                    value={customerId}
                    onChange={(event) =>
                      setCustomerId(
                        event.target.value ? Number(event.target.value) : "",
                      )
                    }
                    className="h-[52px] w-full appearance-none rounded-xl border border-slate-200 bg-white/80 px-4 text-sm text-slate-700 shadow-sm outline-none backdrop-blur-sm transition-all focus:border-indigo-600 focus:bg-white focus:ring-1 focus:ring-indigo-600"
                  >
                    <option value="">Select customer</option>
                    {customers.map((customer) => (
                      <option key={customer.id} value={customer.id}>
                        {customer.name} ({customer.customer_code})
                      </option>
                    ))}
                  </select>
                  <div className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-slate-400">
                    <ChevronRight size={18} className="rotate-90" />
                  </div>
                </div>
                {selectedCustomer && (
                  <p className="mt-2 truncate text-xs font-medium text-indigo-500">
                    Billing to {selectedCustomer.name}
                  </p>
                )}
              </div>
            </div>
          </section>

          {/* Items */}
          <section className="overflow-hidden rounded-3xl border border-slate-100 bg-white/90 shadow-[0_8px_30px_rgb(0,0,0,0.06)] backdrop-blur-md transition-shadow hover:shadow-[0_8px_36px_rgb(0,0,0,0.08)]">
            <div className="flex flex-col gap-4 border-b border-slate-100 px-8 py-6 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-2.5">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600">
                  <Package size={16} strokeWidth={2.5} />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-[#0f172a]">
                    Line Items
                  </h2>
                  <p className="mt-0.5 text-sm text-slate-500">
                    Add products, adjust quantities, and set GST rates.
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={addItem}
                className="inline-flex h-[44px] items-center justify-center gap-2 rounded-xl bg-indigo-50 px-5 text-sm font-semibold text-indigo-600 transition-all hover:bg-indigo-100 active:scale-[0.97]"
              >
                <Plus size={16} strokeWidth={2.5} />
                Add Row
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full min-w-[900px]">
                <thead className="bg-slate-50/50">
                  <tr>
                    <th className="w-10 px-4 py-4" />
                    <th className="px-2 py-4 text-left font-mono text-[11px] font-semibold uppercase tracking-[0.15em] text-slate-500">
                      Product
                    </th>
                    <th className="px-4 py-4 text-left font-mono text-[11px] font-semibold uppercase tracking-[0.15em] text-slate-500">
                      HSN
                    </th>
                    <th className="px-4 py-4 text-left font-mono text-[11px] font-semibold uppercase tracking-[0.15em] text-slate-500">
                      Qty
                    </th>
                    <th className="px-4 py-4 text-left font-mono text-[11px] font-semibold uppercase tracking-[0.15em] text-slate-500">
                      Unit
                    </th>
                    <th className="px-4 py-4 text-left font-mono text-[11px] font-semibold uppercase tracking-[0.15em] text-slate-500">
                      Rate (₹)
                    </th>
                    <th className="px-4 py-4 text-left font-mono text-[11px] font-semibold uppercase tracking-[0.15em] text-slate-500">
                      GST %
                    </th>
                    <th className="px-6 py-4 text-right font-mono text-[11px] font-semibold uppercase tracking-[0.15em] text-slate-500">
                      Amount (₹)
                    </th>
                    <th className="w-16 px-2" />
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-100/60">
                  {items.map((item, index) => {
                    const product = products.find(
                      (productItem) => productItem.id === item.product_id,
                    );

                    const amount =
                      Number(item.quantity || 0) * Number(item.rate || 0);

                    return (
                      <tr
                        key={index}
                        className="group transition-colors hover:bg-indigo-50/20"
                      >
                        <td className="px-4 py-4 text-center font-mono text-xs font-semibold text-slate-300 group-hover:text-indigo-400">
                          {String(index + 1).padStart(2, "0")}
                        </td>

                        <td className="px-2 py-4">
                          <div className="relative">
                            <select
                              value={item.product_id}
                              onChange={(event) =>
                                selectProduct(index, event.target.value)
                              }
                              className="h-[44px] w-full appearance-none rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 outline-none transition-all focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600"
                            >
                              <option value="">Select product...</option>
                              {products.map((productItem) => (
                                <option key={productItem.id} value={productItem.id}>
                                  {productItem.name}
                                </option>
                              ))}
                            </select>
                            <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">
                              <ChevronRight size={16} className="rotate-90" />
                            </div>
                          </div>
                        </td>

                        <td className="px-4 py-4 text-sm font-medium text-slate-500">
                          {product?.hsn_sac || "-"}
                        </td>

                        <td className="px-4 py-4">
                          <input
                            type="number"
                            min="0.001"
                            step="0.001"
                            value={item.quantity}
                            onChange={(event) =>
                              updateItem(index, "quantity", event.target.value)
                            }
                            className="h-[44px] w-24 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 outline-none transition-all focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600"
                          />
                        </td>

                        <td className="px-4 py-4 text-sm font-medium text-slate-500">
                          {product?.unit || "-"}
                        </td>

                        <td className="px-4 py-4">
                          <input
                            type="number"
                            min="0.01"
                            step="0.01"
                            value={item.rate}
                            onChange={(event) =>
                              updateItem(index, "rate", event.target.value)
                            }
                            className="h-[44px] w-28 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 outline-none transition-all focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600"
                          />
                        </td>

                        <td className="px-4 py-4">
                          <input
                            type="number"
                            min="0"
                            max="100"
                            step="0.01"
                            value={item.gst_rate ?? ""}
                            onChange={(event) =>
                              updateItem(index, "gst_rate", event.target.value)
                            }
                            className="h-[44px] w-24 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 outline-none transition-all focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600"
                          />
                        </td>

                        <td className="px-6 py-4 text-right text-sm font-bold text-[#0f172a]">
                          {amount.toLocaleString("en-IN", {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          })}
                        </td>

                        <td className="px-2 py-4">
                          <button
                            type="button"
                            onClick={() => removeItem(index)}
                            disabled={items.length === 1}
                            className="flex h-10 w-10 items-center justify-center rounded-xl text-slate-400 transition-colors hover:bg-red-50 hover:text-red-600 disabled:cursor-not-allowed disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-slate-400"
                          >
                            <Trash2 size={18} />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <button
              type="button"
              onClick={addItem}
              className="flex w-full items-center justify-center gap-2 border-t border-dashed border-slate-200 py-4 text-sm font-medium text-slate-400 transition-colors hover:bg-indigo-50/30 hover:text-indigo-600"
            >
              <Plus size={16} />
              Add another line item
            </button>
          </section>

          {/* Totals */}
          <section className="flex justify-end">
            <div className="w-full max-w-md rounded-3xl border border-slate-100 bg-white/90 p-8 shadow-[0_8px_30px_rgb(0,0,0,0.06)] backdrop-blur-md">
              <div className="mb-6 flex items-center gap-2.5">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600">
                  <Receipt size={16} strokeWidth={2.5} />
                </div>
                <h2 className="text-lg font-semibold text-[#0f172a]">
                  Invoice Summary
                </h2>
              </div>

              <div className="space-y-4 text-sm">
                <div className="flex items-center justify-between">
                  <span className="font-medium text-slate-500">Subtotal</span>
                  <span className="font-semibold text-slate-700">
                    ₹
                    {totals.subtotal.toLocaleString("en-IN", {
                      minimumFractionDigits: 2,
                    })}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="font-medium text-slate-500">CGST</span>
                  <span className="font-semibold text-slate-700">
                    ₹
                    {totals.cgst.toLocaleString("en-IN", {
                      minimumFractionDigits: 2,
                    })}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="font-medium text-slate-500">SGST</span>
                  <span className="font-semibold text-slate-700">
                    ₹
                    {totals.sgst.toLocaleString("en-IN", {
                      minimumFractionDigits: 2,
                    })}
                  </span>
                </div>

                <div className="mt-2 border-t border-slate-100 pt-4">
                  <div className="flex items-center justify-between rounded-2xl border border-indigo-100/50 bg-gradient-to-br from-indigo-50/70 to-indigo-50/30 p-4">
                    <span className="font-bold text-indigo-900">
                      Grand Total
                    </span>
                    <span className="text-xl font-bold text-indigo-700">
                      ₹
                      {totals.total.toLocaleString("en-IN", {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Additional information */}
          <section className="rounded-3xl border border-slate-100 bg-white/90 p-8 shadow-[0_8px_30px_rgb(0,0,0,0.06)] backdrop-blur-md transition-shadow hover:shadow-[0_8px_36px_rgb(0,0,0,0.08)]">
            <div className="mb-6 flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600">
                <Truck size={16} strokeWidth={2.5} />
              </div>
              <h2 className="text-lg font-semibold text-[#0f172a]">
                Logistics & Additional Information
              </h2>
            </div>

            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
              <Input
                label="E-Way Bill Number"
                value={ewayBillNumber}
                onChange={setEwayBillNumber}
              />
              <Input
                label="Delivery Note"
                value={deliveryNote}
                onChange={setDeliveryNote}
              />
              <Input
                label="Payment Terms"
                value={paymentTerms}
                onChange={setPaymentTerms}
              />
              <Input
                label="Supplier Reference"
                value={supplierReference}
                onChange={setSupplierReference}
              />
              <Input
                label="Other References"
                value={otherReferences}
                onChange={setOtherReferences}
              />
              <Input
                label="Buyer Order Number"
                value={buyerOrderNumber}
                onChange={setBuyerOrderNumber}
              />
              <Input
                label="Buyer Order Date"
                type="date"
                value={buyerOrderDate}
                onChange={setBuyerOrderDate}
              />
              <Input
                label="Dispatch Doc Number"
                value={dispatchDocumentNumber}
                onChange={setDispatchDocumentNumber}
              />
              <Input
                label="Delivery Note Date"
                type="date"
                value={deliveryNoteDate}
                onChange={setDeliveryNoteDate}
              />
              <Input
                label="Dispatched Through"
                value={dispatchedThrough}
                onChange={setDispatchedThrough}
              />
              <Input
                label="Destination"
                value={destination}
                onChange={setDestination}
              />
              <Input
                label="LR / RR Number"
                value={lrRrNumber}
                onChange={setLrRrNumber}
              />
              <Input
                label="Vehicle Number"
                value={vehicleNumber}
                onChange={setVehicleNumber}
              />
              <Input
                label="Terms of Delivery"
                value={termsOfDelivery}
                onChange={setTermsOfDelivery}
              />
            </div>
          </section>

          {/* Submit */}
          <div className="sticky bottom-4 z-20 flex flex-col-reverse justify-end gap-3 rounded-2xl border border-slate-200 bg-white/95 p-4 shadow-[0_8px_30px_rgb(0,0,0,0.1)] backdrop-blur-md sm:flex-row sm:items-center">
            <span className="mr-auto hidden text-xs font-medium text-slate-400 sm:block">
              {filledItemCount} item{filledItemCount === 1 ? "" : "s"} · Total ₹
              {totals.total.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
            </span>

            <Link
              href="/Manufracturer/invoices"
              className="flex h-[48px] items-center justify-center rounded-xl border border-slate-200 bg-white px-8 text-sm font-semibold text-slate-600 transition-colors hover:bg-slate-50 hover:text-slate-900"
            >
              Cancel
            </Link>

            <button
              type="submit"
              disabled={submitting}
              className="flex h-[48px] items-center justify-center gap-2 rounded-xl bg-[#0f172a] px-8 text-sm font-bold uppercase tracking-[0.1em] text-white transition-all hover:bg-slate-800 hover:shadow-lg hover:shadow-slate-900/20 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-70 disabled:hover:shadow-none"
            >
              {submitting ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <FileText size={18} strokeWidth={2.5} />
                  Generate Invoice
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

interface InputProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
}

function Input({ label, value, onChange, type = "text" }: InputProps) {
  return (
    <div>
      <label className="mb-2 block font-mono text-[11px] font-medium uppercase tracking-[0.2em] text-slate-500">
        {label}
      </label>

      <input
        type={type}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="h-[52px] w-full rounded-xl border border-slate-200 bg-white/80 px-4 text-sm text-slate-700 shadow-sm outline-none backdrop-blur-sm transition-all focus:border-indigo-600 focus:bg-white focus:ring-1 focus:ring-indigo-600"
      />
    </div>
  );
}