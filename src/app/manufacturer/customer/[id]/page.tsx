import { notFound } from "next/navigation";
import Link from "next/link";

import {
  MapPin,
  ArrowLeft,
  FileText,
  Phone,
  Hash,
  IndianRupee,
  Truck,
  X,
} from "lucide-react";

import { serverApiFetch } from "@/lib/server-api";
import type { Invoice } from "@/types/invoice";

interface CustomerPageProps {
  params: Promise<{
    id: string;
  }>;
}

interface Customer {
  id: number;
  customer_code: string;
  name: string;
  gstin_uin?: string | null;
  contact_person?: string | null;
  address?: string | null;
  state_id?: number;
}

export default async function ManufactureCustomerPage({
  params,
}: CustomerPageProps) {
  const { id: idParam } = await params;

  const id = Number(idParam);

  if (Number.isNaN(id)) {
    return notFound();
  }

  let customer: Customer;
  let invoices: Invoice[] = [];

  try {
    const customerResponse = await serverApiFetch(
      `/manufacture/customers/${id}`,
    );

    if (!customerResponse.ok) {
      if (customerResponse.status === 404) {
        return notFound();
      }

      throw new Error("Failed to load manufacture customer");
    }

    customer = await customerResponse.json();

    const invoicesResponse = await serverApiFetch(
      `/manufacture/customers/${id}/invoices`,
    );

    if (!invoicesResponse.ok) {
      throw new Error(
        "Failed to load manufacture customer invoices",
      );
    }

    invoices = await invoicesResponse.json();
  } catch (error) {
    console.error(error);

    return (
      <div className="flex items-center justify-center p-6">
        <div className="max-w-sm rounded-2xl border border-slate-100 bg-white p-8 text-center shadow-[0_8px_30px_rgb(0,0,0,0.04)]">

          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-red-50 text-red-500">
            <X size={28} />
          </div>

          <h1 className="text-xl font-semibold text-[#0f172a]">
            Customer not found
          </h1>

          <p className="mt-2 text-sm text-slate-500">
            We couldn't load the details for this manufacture
            customer.
          </p>

          <Link
            href="/manufacturer/customer"
            className="mt-6 flex items-center justify-center gap-2 rounded-xl bg-[#0f172a] px-6 py-3.5 text-sm font-semibold uppercase tracking-[0.1em] text-white transition-all hover:bg-slate-800 hover:shadow-lg active:scale-[0.98]"
          >
            <ArrowLeft size={18} />
            Back to Directory
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-full p-6 sm:p-10">

      {/* Back button */}
      <Link
        href="/manufacturer/customer"
        className="group mb-8 inline-flex items-center gap-2 text-sm font-medium text-slate-500 transition-colors hover:text-indigo-600"
      >
        <ArrowLeft
          size={16}
          className="transition-transform group-hover:-translate-x-1"
        />
        Back to Customers
      </Link>

      {/* Customer Header */}
      <div className="mb-8 rounded-3xl border border-slate-100 bg-white p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)]">

        <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">

          <div className="flex items-center gap-6">

            {/* Avatar */}
            <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl bg-indigo-50 text-3xl font-bold text-indigo-600">
              {customer.name.charAt(0).toUpperCase()}
            </div>

            <div>
              <h1 className="text-3xl font-bold tracking-tight text-[#0f172a]">
                {customer.name}
              </h1>

              <div className="mt-3 flex flex-wrap items-center gap-x-6 gap-y-2 text-sm font-medium text-slate-500">

                <span className="flex items-center gap-1.5">
                  <Hash size={16} className="text-slate-400" />
                  Code:
                  <span className="text-slate-700">
                    {customer.customer_code}
                  </span>
                </span>

                {customer.gstin_uin && (
                  <span className="flex items-center gap-1.5">
                    <FileText
                      size={16}
                      className="text-slate-400"
                    />
                    GSTIN:
                    <span className="text-slate-700">
                      {customer.gstin_uin}
                    </span>
                  </span>
                )}

              </div>
            </div>
          </div>

          <div className="flex shrink-0 items-center gap-3">
            <button className="flex h-12 items-center justify-center rounded-xl border border-slate-200 bg-slate-50 px-6 text-sm font-semibold text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-900">
              Edit Profile
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">

        {/* Customer Information */}
        <div className="flex flex-col gap-8">

          <div className="rounded-3xl border border-slate-100 bg-white p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)]">

            <h3 className="mb-6 text-lg font-semibold text-[#0f172a]">
              Contact Details
            </h3>

            <div className="space-y-6">

              {/* Contact */}
              <div>
                <div className="mb-2 flex items-center gap-2 font-mono text-[11px] font-medium uppercase tracking-[0.2em] text-slate-400">
                  <Phone size={14} />
                  Contact Person
                </div>

                <div className="text-base font-medium text-slate-700">
                  {customer.contact_person ||
                    "No contact specified"}
                </div>
              </div>

              {/* Address */}
              <div>
                <div className="mb-2 flex items-center gap-2 font-mono text-[11px] font-medium uppercase tracking-[0.2em] text-slate-400">
                  <MapPin size={14} />
                  Billing Address
                </div>

                <div className="text-base font-medium leading-relaxed text-slate-700">
                  {customer.address ||
                    "No address provided"}
                </div>
              </div>

              {/* State */}
              <div className="rounded-xl border border-slate-100 bg-slate-50 p-4">
                <div className="mb-1 font-mono text-[11px] font-medium uppercase tracking-[0.2em] text-slate-400">
                  Registered State ID
                </div>

                <div className="text-sm font-bold text-[#0f172a]">
                  {customer.state_id}
                </div>
              </div>

            </div>
          </div>
        </div>

        {/* Invoice History */}
        <div className="rounded-3xl border border-slate-100 bg-white p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] lg:col-span-2">

          <div className="mb-2 flex items-end justify-between border-b border-slate-100 pb-6">

            <div>
              <h3 className="text-xl font-semibold text-[#0f172a]">
                Invoice History
              </h3>

              <p className="mt-1.5 text-sm text-slate-500">
                Recent billing activity for {customer.name}
              </p>
            </div>

            <div className="flex h-9 items-center rounded-lg bg-indigo-50 px-3 text-sm font-bold text-indigo-700">
              {invoices.length}{" "}
              {invoices.length === 1
                ? "Record"
                : "Records"}
            </div>
          </div>

          <div className="divide-y divide-slate-100">

            {invoices.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-center">

                <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-50">
                  <FileText
                    size={28}
                    className="text-slate-400"
                  />
                </div>

                <h4 className="text-base font-medium text-[#0f172a]">
                  No invoices yet
                </h4>

                <p className="mt-1 text-sm text-slate-500">
                  There is no billing history associated
                  with this account.
                </p>
              </div>
            ) : (
              invoices.map((invoice) => (
                <Link
                  key={invoice.id}
                  href={`/manufacture/invoices/${invoice.id}`}
                  className="group -mx-2 flex flex-col justify-between gap-4 rounded-xl px-2 py-5 transition-colors hover:bg-slate-50/50 sm:flex-row sm:items-center"
                >

                  <div className="flex items-center gap-4">

                    <div className="relative flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-500 transition-colors group-hover:bg-indigo-50 group-hover:text-indigo-600">
                      <FileText
                        size={20}
                        fill="currentColor"
                        className="opacity-20"
                      />
                      <FileText
                        size={20}
                        className="absolute"
                      />
                    </div>

                    <div>
                      <div className="text-base font-bold text-[#0f172a] transition-colors group-hover:text-indigo-700">
                        {invoice.invoice_number}
                      </div>

                      <div className="mt-1 text-sm font-medium text-slate-500">
                        {invoice.invoice_date}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pl-16 sm:flex-col sm:items-end sm:justify-center sm:pl-0">

                    <div className="flex items-center gap-1 text-lg font-bold text-[#0f172a]">
                      <IndianRupee
                        size={16}
                        className="text-slate-400"
                      />

                      {Number(
                        invoice.grand_total
                      ).toLocaleString("en-IN", {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                    </div>

                    {invoice.vehicle_number && (
                      <div className="mt-1.5 flex items-center gap-1.5 rounded-md bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-500">
                        <Truck size={12} />
                        {invoice.vehicle_number}
                      </div>
                    )}

                  </div>
                </Link>
              ))
            )}

          </div>
        </div>
      </div>
    </div>
  );
}