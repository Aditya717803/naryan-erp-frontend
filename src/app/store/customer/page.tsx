"use client";

import { FormEvent, useEffect, useState } from "react";
import Link from "next/link";
import {
  Search,
  Plus,
  X,
  Loader2,
  Users,
  UserPlus,
  MapPin,
  Phone,
  FileText,
  ChevronRight,
  UserRoundSearch
  
} from "lucide-react";

import { getCustomers, createCustomer, getStates } from "@/lib/api";
import type { Customer as CustomerType } from "@/types/customer";
import type { State as ApiState } from "@/lib/api";

interface CustomerForm {
  name: string;
  gstin_uin: string;
  contact_person: string;
  address: string;
  state_id: string;
}

const initialForm: CustomerForm = {
  name: "",
  gstin_uin: "",
  contact_person: "",
  address: "",
  state_id: "",
};

export default function CustomersPage() {
  const [customers, setCustomers] = useState<CustomerType[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  const [showAddCustomer, setShowAddCustomer] = useState(false);
  const [form, setForm] = useState<CustomerForm>(initialForm);

  const [states, setStates] = useState<ApiState[]>([]);
  const [loadingStates, setLoadingStates] = useState(false);

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function fetchCustomers(searchTerm = "") {
    try {
      setLoading(true);
      setError(null);

      const data = await getCustomers(searchTerm || undefined);

      setCustomers(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load customers");
    } finally {
      setLoading(false);
    }
  }

  async function loadStates() {
    try {
      setLoadingStates(true);
      const s = await getStates();
      setStates(s);
    } catch (err) {
      // non-fatal for showing modal
      console.error(err);
    } finally {
      setLoadingStates(false);
    }
  }

  useEffect(() => {
    fetchCustomers();
  }, []);

  async function handleCreateCustomer(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    try {
      setSubmitting(true);
      setError(null);

      await createCustomer({
        name: form.name.trim(),
        gstin_uin: form.gstin_uin.trim() || null,
        contact_person: form.contact_person.trim() || null,
        address: form.address.trim(),
        state_id: Number(form.state_id),
      });

      // Reset form
      setForm(initialForm);

      // Close modal
      setShowAddCustomer(false);

      // Reload customers
      await fetchCustomers(search);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create customer");
    } finally {
      setSubmitting(false);
    }
  }

  function updateField(field: keyof CustomerForm, value: string) {
    setForm((previous) => ({
      ...previous,
      [field]: value,
    }));
  }

  return (
    <div className="min-h-full p-6 sm:p-10">
      {/* Header */}

      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
            <h1 className=" flex items-center  gap-2 text-3xl font-mono tracking-tight text-[#5500ff]">
              <UserRoundSearch size= {36}/> Customers
            </h1>
            <p className="mt-1.5 bg-violet-100 text-sm text-slate-500 border rounded-3xl px-5 py-1">
              Manage your client directory and view invoice histories.
            </p>
          </div>
        

        <button
          type="button"
          onClick={() => {
            setError(null);
            setForm(initialForm);
            setShowAddCustomer(true);
            if (states.length === 0) loadStates();
          }}
          className="flex h-[48px] items-center justify-center gap-2 rounded-xl bg-[#0f172a] px-6 text-sm font-bold uppercase tracking-[0.1em] text-white transition-all hover:bg-slate-800 hover:shadow-lg hover:shadow-slate-900/20 active:scale-[0.98]"
        >
          <Plus size={18} strokeWidth={2.5} />
          Add Customer
        </button>
      </div>

      {/* Error */}
      {error && (
        <div className="mb-6 flex items-center justify-between rounded-xl border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-700">
          <span className="font-medium">{error}</span>
          <button type="button" onClick={() => setError(null)} className="text-red-500 hover:text-red-700 transition-colors">
            <X size={18} />
          </button>
        </div>
      )}

      {/* Search & Meta */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        {/* Search */}
        <div className="relative w-full max-w-md">
          <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-indigo-500" />
          <input
            type="text"
            value={search}
            onChange={(event) => {
              const value = event.target.value;
              setSearch(value);
              fetchCustomers(value);
            }}
            placeholder="Search customer, code or GSTIN..."
            className="h-[52px] w-full rounded-xl border border-slate-200 bg-white pl-12 pr-4 text-sm text-slate-700 outline-none transition-all placeholder:text-slate-400 focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 shadow-sm"
          />
        </div>

        {/* Customer count */}
        <div className="flex h-[52px] items-center gap-2 rounded-xl border border-slate-200 bg-white px-5 text-sm font-medium text-slate-600 shadow-sm">
          <Users size={18} className="text-indigo-600" fill="currentColor" />
          <span>
            {customers.length} {customers.length === 1 ? "Customer" : "Customers"}
          </span>
        </div>
      </div>

      {/* Customer list */}
      <div className="overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
        {loading ? (
          <div className="flex min-h-[300px] flex-col items-center justify-center gap-3">
            <Loader2 size={24} className="animate-spin text-indigo-600" />
            <span className="text-sm font-medium text-slate-500">
              Loading customers...
            </span>
          </div>
        ) : customers.length === 0 ? (
          <div className="flex min-h-[300px] flex-col items-center justify-center text-center p-8">
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-50">
              <Users size={28} className="text-slate-400" />
            </div>
            <h3 className="text-lg font-semibold text-[#0f172a]">No customers found</h3>
            <p className="mt-1 text-sm text-slate-500">
              Try adjusting your search or add a new customer to get started.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {customers.map((customer) => (
              <div key={customer.id} className="flex flex-col gap-4 p-5 transition-colors hover:bg-slate-50 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex min-w-0 items-center gap-5">
                  
                  {/* Avatar */}
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-lg font-bold text-indigo-600">
                    {customer.name.charAt(0).toUpperCase()}
                  </div>

                  {/* Main information */}
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-3">
                      <h3 className="truncate text-base font-semibold text-[#0f172a]">{customer.name}</h3>
                      <span className="rounded-md bg-slate-100 px-2 py-1 text-xs font-semibold tracking-wider text-slate-600">
                        {customer.customer_code}
                      </span>
                    </div>

                    <div className="mt-1.5 flex flex-wrap items-center gap-x-5 gap-y-2 text-xs font-medium text-slate-500">
                      {customer.gstin_uin && (
                        <span className="flex items-center gap-1.5">
                          <FileText size={14} className="text-slate-400" />
                          {customer.gstin_uin}
                        </span>
                      )}

                      {customer.contact_person && (
                        <span className="flex items-center gap-1.5">
                          <Phone size={14} className="text-slate-400" />
                          {customer.contact_person}
                        </span>
                      )}

                      <span className="flex items-center gap-1.5">
                        <MapPin size={14} className="text-slate-400" />
                        State: {customer.state_id}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Action */}
                <Link 
                  href={`/store/customer/${customer.id}`} 
                  className="mt-2 flex shrink-0 items-center justify-center gap-1.5 rounded-xl bg-white px-4 py-2.5 text-sm font-semibold text-slate-600 border border-slate-200 transition-all hover:bg-slate-50 hover:text-indigo-600 sm:mt-0"
                >
                  View Profile
                  <ChevronRight size={16} />
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add Customer Modal */}
      {showAddCustomer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4 backdrop-blur-sm">
          <div className="w-full max-w-2xl rounded-3xl bg-white shadow-2xl overflow-hidden">
            
            {/* Modal header */}
            <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50/50 px-8 py-6">
              <div>
                <h2 className="text-xl font-semibold text-[#0f172a]">Add Customer</h2>
                <p className="mt-1 text-sm text-slate-500">
                  Enter the required information to create a new profile.
                </p>
              </div>
              <button 
                type="button" 
                onClick={() => setShowAddCustomer(false)} 
                className="flex h-10 w-10 items-center justify-center rounded-xl bg-white border border-slate-200 text-slate-500 transition-colors hover:bg-slate-50 hover:text-slate-700"
              >
                <X size={20} />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleCreateCustomer} className="p-8">
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                
                {/* Name */}
                <div className="sm:col-span-2">
                  <label className="mb-2 block font-mono text-[11px] font-medium uppercase tracking-[0.2em] text-slate-500">
                    Customer Name *
                  </label>
                  <input 
                    required 
                    value={form.name} 
                    onChange={(event) => updateField("name", event.target.value)} 
                    placeholder="ABC Aluminium Pvt. Ltd." 
                    className="h-[52px] w-full rounded-xl border border-slate-200 bg-white px-4 text-sm text-slate-700 outline-none transition-all placeholder:text-slate-400 focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600" 
                  />
                </div>

                {/* GSTIN */}
                <div>
                  <label className="mb-2 block font-mono text-[11px] font-medium uppercase tracking-[0.2em] text-slate-500">
                    GSTIN / UIN
                  </label>
                  <input 
                    value={form.gstin_uin} 
                    onChange={(event) => updateField("gstin_uin", event.target.value)} 
                    placeholder="27XXXXXXXXXXXXZ" 
                    className="h-[52px] w-full rounded-xl border border-slate-200 bg-white px-4 text-sm uppercase text-slate-700 outline-none transition-all placeholder:text-slate-400 focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600" 
                  />
                </div>

                {/* Contact */}
                <div>
                  <label className="mb-2 block font-mono text-[11px] font-medium uppercase tracking-[0.2em] text-slate-500">
                    Contact Person
                  </label>
                  <input 
                    value={form.contact_person} 
                    onChange={(event) => updateField("contact_person", event.target.value)} 
                    placeholder="John Doe" 
                    className="h-[52px] w-full rounded-xl border border-slate-200 bg-white px-4 text-sm text-slate-700 outline-none transition-all placeholder:text-slate-400 focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600" 
                  />
                </div>

                {/* State */}
                <div className="sm:col-span-2">
                  <label className="mb-2 block font-mono text-[11px] font-medium uppercase tracking-[0.2em] text-slate-500">
                    State *
                  </label>
                  <div className="relative">
                    <select 
                      required 
                      value={form.state_id} 
                      onChange={(e) => updateField("state_id", e.target.value)} 
                      className="h-[52px] w-full appearance-none rounded-xl border border-slate-200 bg-white px-4 text-sm text-slate-700 outline-none transition-all focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600"
                    >
                      <option value="">Select State</option>
                      {states.map((s) => (
                        <option key={s.id} value={String(s.id)}>
                          {s.name}
                        </option>
                      ))}
                    </select>
                    {/* Custom Dropdown Arrow */}
                    <div className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-slate-400">
                      <ChevronRight size={18} className="rotate-90" />
                    </div>
                  </div>
                </div>

                {/* Address */}
                <div className="sm:col-span-2">
                  <label className="mb-2 block font-mono text-[11px] font-medium uppercase tracking-[0.2em] text-slate-500">
                    Billing Address *
                  </label>
                  <textarea 
                    required 
                    rows={3} 
                    value={form.address} 
                    onChange={(event) => updateField("address", event.target.value)} 
                    placeholder="Enter complete billing address" 
                    className="w-full resize-none rounded-xl border border-slate-200 bg-white p-4 text-sm text-slate-700 outline-none transition-all placeholder:text-slate-400 focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600" 
                  />
                </div>
              </div>

              {/* Actions */}
              <div className="mt-8 flex flex-col-reverse justify-end gap-3 border-t border-slate-100 pt-6 sm:flex-row">
                <button 
                  type="button" 
                  onClick={() => setShowAddCustomer(false)} 
                  className="flex h-[48px] items-center justify-center rounded-xl bg-slate-50 px-6 text-sm font-semibold text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-900"
                >
                  Cancel
                </button>

                <button 
                  type="submit" 
                  disabled={submitting} 
                  className="flex h-[48px] items-center justify-center gap-2 rounded-xl bg-[#0f172a] px-8 text-sm font-bold uppercase tracking-[0.1em] text-white transition-all hover:bg-slate-800 hover:shadow-lg hover:shadow-slate-900/20 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-70 disabled:hover:shadow-none"
                >
                  {submitting ? (
                    <>
                      <Loader2 size={18} className="animate-spin" />
                      Creating...
                    </>
                  ) : (
                    <>
                      <UserPlus size={18} strokeWidth={2.5} />
                      Create Customer
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}