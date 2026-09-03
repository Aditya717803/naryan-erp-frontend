"use client";

import { FormEvent, useEffect, useState } from "react";
import Link from "next/link";
import {
  FileText,
  Plus,
  Search,
  Loader2,
  AlertCircle,
  Eye,
  IndianRupee,
  X,
  Files

} from "lucide-react";

import {
  getInvoices,
  getCustomers,
} from "@/lib/api";

import type { Invoice } from "@/types/invoice";
import type { Customer } from "@/types/customer";

function formatMoney(value: number | string | null | undefined) {
  const amount = Number(value ?? 0);

  return `₹${amount.toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

export default function InvoicesPage() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);

  const [search, setSearch] = useState("");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function loadInvoices(searchTerm = "") {
    try {
      setLoading(true);
      setError(null);

      const [invoiceData, customerData] = await Promise.all([
        getInvoices(searchTerm.trim() || undefined),
        getCustomers(),
      ]);

      setInvoices(invoiceData);
      setCustomers(customerData);
    } catch (err) {
      console.error(err);

      setError(
        err instanceof Error
          ? err.message
          : "Failed to load invoices.",
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadInvoices();
  }, []);

  function handleSearch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    loadInvoices(search);
  }

  function getCustomerName(customerId: number) {
    const customer = customers.find(
      (item) => item.id === customerId,
    );

    return customer?.name ?? `Customer #${customerId}`;
  }

  return (
    <div className="relative min-h-full p-6 sm:p-10">
      {/* Subtle Grid Background */}
      <div className="pointer-events-none absolute inset-0 z-0" />

      <div className="relative z-10">
        {/* Header */}
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className=" flex items-center  gap-2 text-3xl font-mono tracking-tight text-[#5500ff]">
              <Files className="h-10 w-10 bg-indigo-100 p-1 rounded-4xl text-black"/> Invoices
            </h1>
            <p className="mt-1.5 bg-violet-100 text-sm text-slate-500 border rounded-3xl px-5 py-1">
              Create Invoice , view invoice histories and print invoice.
            </p>
          </div>

          <Link
            href="/store/invoices/create"
            className="flex h-[48px] items-center justify-center gap-2 rounded-xl bg-[#0f172a] px-6 text-sm font-bold uppercase tracking-[0.1em] text-white transition-all hover:bg-slate-800 hover:shadow-lg hover:shadow-slate-900/20 active:scale-[0.98]"
          >
            <Plus size={18} strokeWidth={2.5} />
            Create Invoice
          </Link>
        </div>

        {/* Error */}
        {error && (
          <div className="mb-6 flex items-center justify-between rounded-xl border border-red-200 bg-red-50/80 px-5 py-4 text-sm text-red-700 backdrop-blur-sm">
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

        {/* Search & Meta */}
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          {/* Search Form */}
          <form
            onSubmit={handleSearch}
            className="flex w-full max-w-lg gap-3"
          >
            <div className="relative w-full max-w-md">
          <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-indigo-500" />
          <input
            type="text"
            value={search}
            onChange={(event) => {
              const value = event.target.value;
              setSearch(value);
              
            }}
            placeholder="Search Inovoice Number..."
            className="h-[52px] w-full rounded-2xl border border-slate-200 bg-white pl-12 pr-4 text-sm text-slate-700 outline-none transition-all placeholder:text-slate-400 focus:border-indigo-600 focus:ring-indigo-600 shadow-sm"
          />
        </div>
            <button
              type="submit"
              className="flex h-[52px] items-center justify-center rounded-xl bg-indigo-50 px-6 text-sm font-semibold text-indigo-600 transition-colors hover:bg-indigo-100"
            >
              Search
            </button>
          </form>

          {/* Invoice count */}
          <div className="flex h-[52px] items-center gap-2 rounded-xl border border-slate-200 bg-white/80 px-5 text-sm font-medium text-slate-600 shadow-sm backdrop-blur-sm">
            <FileText size={18} className="text-indigo-600" fill="currentColor" />
            <span>
              {invoices.length}{" "}
              {invoices.length === 1 ? "Invoice" : "Invoices"}
            </span>
          </div>
        </div>

        {/* Table Container */}
        <div className="overflow-hidden rounded-3xl border border-slate-100 bg-white/90 shadow-[0_8px_30px_rgb(0,0,0,0.06)] backdrop-blur-md">
          {loading ? (
            <div className="flex min-h-[350px] flex-col items-center justify-center gap-3">
              <Loader2
                size={24}
                className="animate-spin text-indigo-600"
              />
              <span className="text-sm font-medium text-slate-500">
                Loading invoices...
              </span>
            </div>
          ) : invoices.length === 0 ? (
            <div className="flex min-h-[350px] flex-col items-center justify-center p-8 text-center">
              <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-50">
                <FileText size={28} className="text-slate-400" />
              </div>
              <h3 className="text-lg font-semibold text-[#0f172a]">
                No invoices found
              </h3>
              <p className="mt-1 text-sm text-slate-500">
                Create your first invoice to get started.
              </p>
              <Link
                href="/store/invoices/create"
                className="mt-6 flex h-[48px] items-center justify-center gap-2 rounded-xl bg-[#0f172a] px-6 text-sm font-bold uppercase tracking-[0.1em] text-white transition-all hover:bg-slate-800 hover:shadow-lg hover:shadow-slate-900/20 active:scale-[0.98]"
              >
                <Plus size={18} strokeWidth={2.5} />
                Create Invoice
              </Link>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[800px] text-left text-sm">
                <thead className="border-b border-slate-100 bg-slate-50/50">
                  <tr>
                    <th className="px-6 py-4 font-mono text-[11px] font-semibold uppercase tracking-[0.15em] text-slate-500">
                      Invoice
                    </th>
                    <th className="px-6 py-4 font-mono text-[11px] font-semibold uppercase tracking-[0.15em] text-slate-500">
                      Customer
                    </th>
                    <th className="px-6 py-4 font-mono text-[11px] font-semibold uppercase tracking-[0.15em] text-slate-500">
                      Date
                    </th>
                    <th className="px-6 py-4 text-right font-mono text-[11px] font-semibold uppercase tracking-[0.15em] text-slate-500">
                      Subtotal
                    </th>
                    <th className="px-6 py-4 text-right font-mono text-[11px] font-semibold uppercase tracking-[0.15em] text-slate-500">
                      Total
                    </th>
                    <th className="px-6 py-4 text-right font-mono text-[11px] font-semibold uppercase tracking-[0.15em] text-slate-500">
                      Action
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-100/60">
                  {invoices.map((invoice) => (
                    <tr
                      key={invoice.id}
                      className="group transition-colors hover:bg-slate-50/50"
                    >
                      <td className="px-6 py-4">
                        <Link
                          href={`/store/invoices/${invoice.id}`}
                          className="flex items-center gap-3"
                        >
                          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 transition-colors group-hover:bg-indigo-100">
                            <FileText size={18} fill="currentColor" className="opacity-20" />
                            <FileText size={18} className="absolute" />
                          </div>
                          <span className="font-bold text-[#0f172a] transition-colors group-hover:text-indigo-600">
                            {invoice.invoice_number}
                          </span>
                        </Link>
                      </td>

                      <td className="px-6 py-4">
                        <div className="font-medium text-slate-700">
                          {getCustomerName(invoice.customer_id)}
                        </div>
                      </td>

                      <td className="px-6 py-4">
                        <div className="text-slate-500 font-medium">
                          {invoice.invoice_date}
                        </div>
                      </td>

                      <td className="px-6 py-4 text-right text-slate-500 font-medium">
                        {formatMoney(invoice.subtotal)}
                      </td>

                      <td className="px-6 py-4 text-right">
                        <div className="inline-flex items-center gap-1 font-bold text-[#0f172a]">
                          {formatMoney(invoice.grand_total)}
                        </div>
                      </td>

                      <td className="px-6 py-4 text-right">
                        <Link
                          href={`/store/invoices/${invoice.id}`}
                          className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-600 transition-all hover:border-indigo-200 hover:bg-indigo-50 hover:text-indigo-600"
                        >
                          <Eye size={15} />
                          View
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}