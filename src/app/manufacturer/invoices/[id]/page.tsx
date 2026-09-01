"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  ArrowLeft,
  FileText,
  Loader2,
  AlertCircle,
  Printer,
  User,
  Info as InfoIcon,
  Package,
  Receipt,
  Truck,
} from "lucide-react";

import {
  getManufactureInvoice,
  getManufactureCustomer,
} from "@/lib/api";

import type { Invoice } from "@/types/invoice";
import type { Customer } from "@/types/customer";

import InvoicePrint from "@/app/component/InvoicePrint";

function formatMoney(value: number | string | null | undefined) {
  const amount = Number(value ?? 0);

  return `₹${amount.toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

export default function InvoiceDetailsPage() {
  const params = useParams();

  const invoiceId = Number(params.id);

  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [customer, setCustomer] = useState<Customer | null>(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadInvoice() {
      if (Number.isNaN(invoiceId)) {
        setError("Invalid invoice ID.");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        const invoiceData = await getManufactureInvoice(invoiceId);

        setInvoice(invoiceData);

        try {
          const customerData = await getManufactureCustomer(invoiceData.customer_id);

          setCustomer(customerData);
        } catch (customerError) {
          console.error("Failed to load customer:", customerError);
        }
      } catch (err) {
        console.error(err);

        setError(
          err instanceof Error ? err.message : "Failed to load invoice.",
        );
      } finally {
        setLoading(false);
      }
    }

    loadInvoice();
  }, [invoiceId]);

  if (loading) {
    return (
      <div className="flex min-h-[500px] flex-col items-center justify-center gap-3">
        <div className="relative">
          <div className="absolute inset-0 animate-ping rounded-full bg-indigo-200 opacity-40" />
          <Loader2 size={24} className="relative animate-spin text-indigo-600" />
        </div>
        <span className="text-sm font-medium text-slate-500">
          Loading invoice...
        </span>
      </div>
    );
  }

  if (error || !invoice) {
    return (
      <div className="relative min-h-full p-6 sm:p-10">
        <div className="pointer-events-none absolute inset-0 z-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:3rem_3rem]" />

        <div className="relative z-10 mx-auto max-w-4xl">
          <Link
            href="/manufacturer/invoices"
            className="group mb-6 inline-flex w-fit items-center gap-2 text-sm font-medium text-slate-500 transition-colors hover:text-indigo-600"
          >
            <ArrowLeft
              size={16}
              className="transition-transform group-hover:-translate-x-1"
            />
            Back to Invoices
          </Link>

          <div className="rounded-3xl border border-red-200 bg-red-50/80 p-8 shadow-[0_8px_30px_rgb(0,0,0,0.06)] backdrop-blur-md">
            <div className="flex items-center gap-3 text-red-700">
              <AlertCircle size={20} />

              <div>
                <h2 className="font-semibold">Unable to load invoice</h2>

                <p className="mt-1 text-sm">
                  {error ?? "Invoice could not be found."}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const hasLogistics =
    invoice.delivery_note ||
    invoice.buyer_order_number ||
    invoice.destination ||
    invoice.vehicle_number ||
    invoice.lr_rr_number ||
    invoice.dispatched_through ||
    invoice.terms_of_delivery;

  return (
    <div className="relative min-h-full p-6 sm:p-10">
      {/* Subtle grid background */}
      <div className="pointer-events-none absolute inset-0 z-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px), print:hidden" />
      {/* Soft ambient glow */}
      <div className="pointer-events-none absolute -top-24 right-0 z-0 h-96 w-96 rounded-full bg-indigo-200/20 blur-3xl print:hidden" />

      <div className="relative z-10 mx-auto max-w-6xl">
        {/* Header */}
        <div className="mb-8 flex flex-col gap-4">
          <Link
            href="/manufacturer/invoices"
            className="group inline-flex w-fit items-center gap-2 text-sm font-medium text-slate-500 transition-colors hover:text-indigo-600 print:hidden"
          >
            <ArrowLeft
              size={16}
              className="transition-transform group-hover:-translate-x-1"
            />
            Back to Invoices
          </Link>

          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
            <div>
              <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-indigo-100 bg-indigo-50/70 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.15em] text-indigo-600 print:hidden">
                <FileText size={12} />
                Invoice
              </div>
              <h1 className="flex items-center gap-2.5 text-3xl font-light tracking-tight text-[#0f172a]">
                <FileText size={24} className="hidden text-indigo-600 print:hidden" />
                <span className="font-bold text-indigo-600">
                  {invoice.invoice_number}
                </span>
              </h1>
              <p className="mt-1.5 text-sm text-slate-500">
                Invoice dated {invoice.invoice_date}
              </p>
            </div>
            <button
              type="button"
              onClick={() => {
                    window.open(
                        `/manufacturer-invoice-print/${invoice.id}`,
                        "_blank",
                    );
                    }}
              className="inline-flex h-[48px] items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-6 text-sm font-semibold text-slate-700 shadow-sm hover:bg-slate-50"
            >
              <Printer size={16} strokeWidth={2.5} />
              Print Invoice
            </button>
          </div>
        </div>

        {/* Customer + Invoice Information */}
        <section className="mb-8 grid grid-cols-1 gap-6 lg:grid-cols-2">
          <div className="rounded-3xl border border-slate-100 bg-white/90 p-8 shadow-[0_8px_30px_rgb(0,0,0,0.06)] backdrop-blur-md transition-shadow hover:shadow-[0_8px_36px_rgb(0,0,0,0.08)]">
            <div className="mb-6 flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600">
                <User size={16} strokeWidth={2.5} />
              </div>
              <h2 className="text-lg font-semibold text-[#0f172a]">
                Customer
              </h2>
            </div>

            {customer ? (
              <div>
                <div className="text-lg font-bold text-[#0f172a]">
                  {customer.name}
                </div>

                <div className="mt-1 font-mono text-xs font-medium uppercase tracking-[0.1em] text-slate-400">
                  {customer.customer_code}
                </div>

                {customer.gstin_uin && (
                  <div className="mt-4 rounded-xl bg-slate-50/70 px-4 py-3 text-sm text-slate-600">
                    <span className="font-mono text-[11px] font-semibold uppercase tracking-[0.15em] text-slate-400">
                      GSTIN
                    </span>
                    <div className="mt-0.5 font-medium text-slate-700">
                      {customer.gstin_uin}
                    </div>
                  </div>
                )}

                {customer.address && (
                  <div className="mt-3 text-sm leading-relaxed text-slate-600">
                    {customer.address}
                  </div>
                )}
              </div>
            ) : (
              <div className="text-sm text-slate-500">
                Customer #{invoice.customer_id}
              </div>
            )}
          </div>

          <div className="rounded-3xl border border-slate-100 bg-white/90 p-8 shadow-[0_8px_30px_rgb(0,0,0,0.06)] backdrop-blur-md transition-shadow hover:shadow-[0_8px_36px_rgb(0,0,0,0.08)]">
            <div className="mb-6 flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600">
                <InfoIcon size={16} strokeWidth={2.5} />
              </div>
              <h2 className="text-lg font-semibold text-[#0f172a]">
                Invoice Information
              </h2>
            </div>

            <div className="grid grid-cols-2 gap-6">
              <Info label="Invoice Number" value={invoice.invoice_number} />
              <Info label="Invoice Date" value={invoice.invoice_date} />
              <Info
                label="Payment Terms"
                value={invoice.payment_terms || "-"}
              />
              <Info
                label="E-Way Bill"
                value={invoice.eway_bill_number || "-"}
              />
            </div>
          </div>
        </section>

        {/* Items */}
        <section className="mb-8 overflow-hidden rounded-3xl border border-slate-100 bg-white/90 shadow-[0_8px_30px_rgb(0,0,0,0.06)] backdrop-blur-md transition-shadow hover:shadow-[0_8px_36px_rgb(0,0,0,0.08)]">
          <div className="flex items-center gap-2.5 border-b border-slate-100 px-8 py-6">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600">
              <Package size={16} strokeWidth={2.5} />
            </div>
            <h2 className="text-lg font-semibold text-[#0f172a]">
              Invoice Items
            </h2>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[800px]">
              <thead className="bg-slate-50/50">
                <tr>
                  <th className="w-10 px-4 py-4" />
                  <th className="px-2 py-4 text-left font-mono text-[11px] font-semibold uppercase tracking-[0.15em] text-slate-500">
                    Product
                  </th>
                  <th className="px-4 py-4 text-left font-mono text-[11px] font-semibold uppercase tracking-[0.15em] text-slate-500">
                    HSN
                  </th>
                  <th className="px-4 py-4 text-right font-mono text-[11px] font-semibold uppercase tracking-[0.15em] text-slate-500">
                    Qty
                  </th>
                  <th className="px-4 py-4 text-left font-mono text-[11px] font-semibold uppercase tracking-[0.15em] text-slate-500">
                    Unit
                  </th>
                  <th className="px-4 py-4 text-right font-mono text-[11px] font-semibold uppercase tracking-[0.15em] text-slate-500">
                    Rate
                  </th>
                  <th className="px-4 py-4 text-right font-mono text-[11px] font-semibold uppercase tracking-[0.15em] text-slate-500">
                    GST
                  </th>
                  <th className="px-6 py-4 text-right font-mono text-[11px] font-semibold uppercase tracking-[0.15em] text-slate-500">
                    Amount
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100/60">
                {invoice.items?.map((item, index) => (
                  <tr
                    key={item.id}
                    className="group transition-colors hover:bg-indigo-50/20"
                  >
                    <td className="px-4 py-4 text-center font-mono text-xs font-semibold text-slate-300 group-hover:text-indigo-400">
                      {String(index + 1).padStart(2, "0")}
                    </td>

                    <td className="px-2 py-4">
                      <div className="text-sm font-semibold text-[#0f172a]">
                        {item.description}
                      </div>

                      <div className="mt-0.5 text-xs text-slate-400">
                        Product #{item.product_id}
                      </div>
                    </td>

                    <td className="px-4 py-4 text-sm font-medium text-slate-500">
                      {item.hsn_sac || "-"}
                    </td>

                    <td className="px-4 py-4 text-right text-sm text-slate-700">
                      {Number(item.quantity)}
                    </td>

                    <td className="px-4 py-4 text-sm font-medium text-slate-500">
                      {item.unit || "-"}
                    </td>

                    <td className="px-4 py-4 text-right text-sm text-slate-700">
                      {formatMoney(item.rate)}
                    </td>

                    <td className="px-4 py-4 text-right text-sm text-slate-600">
                      {item.gst_rate != null
                        ? `${Number(item.gst_rate).toFixed(2)}%`
                        : "-"}
                    </td>

                    <td className="px-6 py-4 text-right text-sm font-bold text-[#0f172a]">
                      {formatMoney(item.amount)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* Totals */}
        <section className="mb-8 flex justify-end">
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
              <SummaryRow label="Subtotal" value={formatMoney(invoice.subtotal)} />
              <SummaryRow label="CGST" value={formatMoney(invoice.cgst_amount)} />
              <SummaryRow label="SGST" value={formatMoney(invoice.sgst_amount)} />

              {Number(invoice.igst_amount ?? 0) > 0 && (
                <SummaryRow
                  label="IGST"
                  value={formatMoney(invoice.igst_amount)}
                />
              )}

              <SummaryRow
                label="Round Off"
                value={formatMoney(invoice.round_off)}
              />

              <div className="mt-2 border-t border-slate-100 pt-4">
                <div className="flex items-center justify-between rounded-2xl border border-indigo-100/50 bg-gradient-to-br from-indigo-50/70 to-indigo-50/30 p-4">
                  <span className="font-bold text-indigo-900">
                    Grand Total
                  </span>
                  <span className="text-xl font-bold text-indigo-700">
                    {formatMoney(invoice.grand_total)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Additional information */}
        {hasLogistics && (
          <section className="mb-10 rounded-3xl border border-slate-100 bg-white/90 p-8 shadow-[0_8px_30px_rgb(0,0,0,0.06)] backdrop-blur-md transition-shadow hover:shadow-[0_8px_36px_rgb(0,0,0,0.08)]">
            <div className="mb-6 flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600">
                <Truck size={16} strokeWidth={2.5} />
              </div>
              <h2 className="text-lg font-semibold text-[#0f172a]">
                Additional Information
              </h2>
            </div>

            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
              {invoice.delivery_note && (
                <Info label="Delivery Note" value={invoice.delivery_note} />
              )}

              {invoice.buyer_order_number && (
                <Info
                  label="Buyer Order Number"
                  value={invoice.buyer_order_number}
                />
              )}

              {invoice.destination && (
                <Info label="Destination" value={invoice.destination} />
              )}

              {invoice.vehicle_number && (
                <Info label="Vehicle Number" value={invoice.vehicle_number} />
              )}

              {invoice.lr_rr_number && (
                <Info label="LR / RR Number" value={invoice.lr_rr_number} />
              )}

              {invoice.dispatched_through && (
                <Info
                  label="Dispatched Through"
                  value={invoice.dispatched_through}
                />
              )}

              {invoice.terms_of_delivery && (
                <Info
                  label="Terms of Delivery"
                  value={invoice.terms_of_delivery}
                />
              )}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="font-mono text-[11px] font-medium uppercase tracking-[0.2em] text-slate-500">
        {label}
      </div>

      <div className="mt-1.5 text-sm font-medium text-slate-700">
        {value}
      </div>
    </div>
  );
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between">
      <span className="font-medium text-slate-500">{label}</span>
      <span className="font-semibold text-slate-700">{value}</span>
    </div>
  );
}