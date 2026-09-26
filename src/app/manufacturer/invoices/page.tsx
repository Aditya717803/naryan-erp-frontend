"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
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
  Files,
  Filter,
  Download,

} from "lucide-react";

import {
  getManufactureInvoices,
  getManufactureCustomers,
  downloadManufactureInvoices,
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

type DateFilter = "all" | "today" | "week" | "month";
type SortFilter = "newest" | "oldest" | "total-desc" | "total-asc";

export default function InvoicesPage() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);

  const [search, setSearch] = useState("");
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [customerFilter, setCustomerFilter] = useState("all");
  const [dateFilter, setDateFilter] = useState<DateFilter>("all");
  const [sortFilter, setSortFilter] = useState<SortFilter>("newest");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [downloadOpen, setDownloadOpen] = useState(false);
  const [downloadStart, setDownloadStart] = useState("");
  const [downloadEnd, setDownloadEnd] = useState("");
  const [downloading, setDownloading] = useState(false);
  const [downloadError, setDownloadError] = useState<string | null>(null);

  async function handleDownload() {
    if (!downloadStart || !downloadEnd) {
      setDownloadError("Select both a start date and an end date.");
      return;
    }
    if (downloadStart > downloadEnd) {
      setDownloadError("Start date cannot be later than end date.");
      return;
    }
    try {
      setDownloading(true);
      setDownloadError(null);
      const blob = await downloadManufactureInvoices(downloadStart, downloadEnd);
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `manufacture-invoices-${downloadStart}-to-${downloadEnd}.zip`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);
      setDownloadOpen(false);
    } catch (err) {
      setDownloadError(
        err instanceof Error ? err.message : "Failed to download invoices.",
      );
    } finally {
      setDownloading(false);
    }
  }

  async function loadInvoices(searchTerm = "") {
    try {
      setLoading(true);
      setError(null);

      const [invoiceData, customerData] = await Promise.all([
        getManufactureInvoices(searchTerm.trim() || undefined),
        getManufactureCustomers(),
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

  const filteredInvoices = useMemo(() => {
    const now = new Date();
    const today = now.toISOString().slice(0, 10);
    const day = now.getDay();
    const daysSinceMonday = day === 0 ? 6 : day - 1;
    const weekStart = new Date(now);
    weekStart.setDate(now.getDate() - daysSinceMonday);
    const weekStartValue = weekStart.toISOString().slice(0, 10);
    const monthStart = `${now.getFullYear()}-${String(
      now.getMonth() + 1,
    ).padStart(2, "0")}-01`;

    const result = invoices.filter((invoice) => {
      const matchesCustomer =
        customerFilter === "all" ||
        invoice.customer_id === Number(customerFilter);
      const matchesDate =
        dateFilter === "all" ||
        (dateFilter === "today" && invoice.invoice_date === today) ||
        (dateFilter === "week" && invoice.invoice_date >= weekStartValue) ||
        (dateFilter === "month" && invoice.invoice_date >= monthStart);

      return matchesCustomer && matchesDate;
    });

    return result.sort((first, second) => {
      if (sortFilter === "total-desc") {
        return Number(second.grand_total) - Number(first.grand_total);
      }

      if (sortFilter === "total-asc") {
        return Number(first.grand_total) - Number(second.grand_total);
      }

      const comparison =
        first.invoice_date.localeCompare(second.invoice_date);
      return sortFilter === "oldest" ? comparison : -comparison;
    });
  }, [invoices, customerFilter, dateFilter, sortFilter]);

  function clearFilters() {
    setCustomerFilter("all");
    setDateFilter("all");
    setSortFilter("newest");
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
              <Files size= {36}/> Invoices
            </h1>
            <p className="mt-1.5 bg-violet-100 text-sm text-slate-500 border rounded-3xl px-5 py-1">
              Create Invoice , view invoice histories and print invoice.
            </p>
          </div>

          <Link
            href="/manufacturer/invoices/create"
            className="flex h-[48px] items-center justify-center gap-2 rounded-xl bg-[#0f172a] px-6 text-sm font-bold uppercase tracking-[0.1em] text-white transition-all hover:bg-slate-800 hover:shadow-lg hover:shadow-slate-900/20 active:scale-[0.98]"
          >
            <Plus size={18} strokeWidth={2.5} />
            Create Invoice
          </Link>
          <button
            type="button"
            onClick={() => {
              setDownloadError(null);
              setDownloadOpen(true);
            }}
            className="flex h-[48px] items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-6 text-sm font-bold uppercase tracking-[0.1em] text-slate-700 transition-all hover:border-indigo-200 hover:bg-indigo-50 hover:text-indigo-600"
          >
            <Download size={18} />
            Download Invoices
          </button>
        </div>

        {downloadOpen && (
          <div className="mb-6 rounded-2xl border border-indigo-100 bg-white p-5 shadow-sm">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="font-semibold text-slate-900">Download invoice ZIP</h2>
              <button type="button" onClick={() => setDownloadOpen(false)} className="text-slate-400 hover:text-slate-700" aria-label="Close download form"><X size={18} /></button>
            </div>
            <div className="grid gap-4 sm:grid-cols-[1fr_1fr_auto] sm:items-end">
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-500">From
                <input type="date" value={downloadStart} onChange={(e) => setDownloadStart(e.target.value)} className="mt-2 h-10 w-full rounded-xl border border-slate-200 px-3 text-sm text-slate-700" />
              </label>
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-500">To
                <input type="date" value={downloadEnd} onChange={(e) => setDownloadEnd(e.target.value)} className="mt-2 h-10 w-full rounded-xl border border-slate-200 px-3 text-sm text-slate-700" />
              </label>
              <button type="button" onClick={handleDownload} disabled={downloading} className="flex h-10 items-center justify-center gap-2 rounded-xl bg-indigo-600 px-5 text-sm font-semibold text-white hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60">
                {downloading && <Loader2 size={16} className="animate-spin" />}
                {downloading ? "Preparing..." : "Download ZIP"}
              </button>
            </div>
            {downloadError && <p className="mt-3 text-sm font-medium text-red-600">{downloadError}</p>}
          </div>
        )}

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
          <div className="flex w-full flex-wrap items-start gap-3">
            <form
              onSubmit={handleSearch}
              className="flex w-full max-w-lg flex-1 gap-3"
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
              className="flex h-[50px] items-center justify-center gap-2 rounded-full drop-shadow-md bg-slate-100 px-6 text-sm font-semibold text-black transition-colors hover:drop-shadow-lg"
            >
              <Search size={20} className="text-slate-500 " />
              <span className="font-medium">Search</span>
            </button>
            </form>
            <button
              type="button"
              onClick={() => setFiltersOpen((open) => !open)}
              className="flex h-[52px] items-center justify-center gap-2 rounded-xl border  bg-slate-900 px-5 text-sm font-semibold text-white transition-colors hover:bg-slate-800 hover:drop-shadow-lg"
            >
              <Filter size={17} />
              Filter
            </button>

            {/* Invoice count */}
            <div className="flex h-[52px] items-center gap-2 rounded-xl border border-slate-200 bg-white/80 px-5 text-sm font-medium text-slate-600 shadow-sm backdrop-blur-sm">
              <FileText size={18} className="text-black" />
              <span>
                {filteredInvoices.length}{" "}
                {filteredInvoices.length === 1 ? "Invoice" : "Invoices"}
              </span>
            </div>
          </div>

          {filtersOpen && (
            <div className="mt-4 grid w-full grid-cols-1 gap-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:grid-cols-3">
              <label className="flex flex-col gap-2 text-xs font-semibold uppercase tracking-[0.15em] text-slate-500">
                Customer
                <select
                  value={customerFilter}
                  onChange={(event) => setCustomerFilter(event.target.value)}
                  className="h-10 rounded-xl border border-slate-200 bg-white px-3 text-sm font-normal normal-case tracking-normal text-slate-700 outline-none focus:border-indigo-600"
                >
                  <option value="all">All Customers</option>
                  {customers.map((customer) => (
                    <option key={customer.id} value={customer.id}>
                      {customer.name}
                    </option>
                  ))}
                </select>
              </label>
              <label className="flex flex-col gap-2 text-xs font-semibold uppercase tracking-[0.15em] text-slate-500">
                Date
                <select
                  value={dateFilter}
                  onChange={(event) => setDateFilter(event.target.value as DateFilter)}
                  className="h-10 rounded-xl border border-slate-200 bg-white px-3 text-sm font-normal normal-case tracking-normal text-slate-700 outline-none focus:border-indigo-600"
                >
                  <option value="all">All Dates</option>
                  <option value="today">Today</option>
                  <option value="week">This Week</option>
                  <option value="month">This Month</option>
                </select>
              </label>
              <label className="flex flex-col gap-2 text-xs font-semibold uppercase tracking-[0.15em] text-slate-500">
                Sort By
                <select
                  value={sortFilter}
                  onChange={(event) => setSortFilter(event.target.value as SortFilter)}
                  className="h-10 rounded-xl border border-slate-200 bg-white px-3 text-sm font-normal normal-case tracking-normal text-slate-700 outline-none focus:border-indigo-600"
                >
                  <option value="newest">Newest First</option>
                  <option value="oldest">Oldest First</option>
                  <option value="total-desc">Total: High to Low</option>
                  <option value="total-asc">Total: Low to High</option>
                </select>
              </label>
              <button
                type="button"
                onClick={clearFilters}
                className="h-10 justify-self-start rounded-xl border border-slate-200 px-4 text-sm font-semibold text-slate-600 transition-colors hover:bg-slate-50 hover:text-indigo-600 sm:col-span-3"
              >
                Clear Filters
              </button>
            </div>
          )}
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
          ) : filteredInvoices.length === 0 ? (
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
                  {filteredInvoices.map((invoice) => (
                    <tr
                      key={invoice.id}
                      className="group transition-colors hover:bg-slate-50/50"
                    >
                      <td className="px-6 py-4">
                        <Link
                          href={`/manufacturer/invoices/${invoice.id}`}
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
                          href={`/manufacturer/invoices/${invoice.id}`}
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