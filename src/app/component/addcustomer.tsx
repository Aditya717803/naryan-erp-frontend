"use client";

import { FormEvent, useEffect, useState } from "react";
import {
  X,
  Loader2,
  UserPlus,
  ChevronRight,
} from "lucide-react";

import { createCustomer, getStates } from "@/lib/api";
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

interface AddCustomerProps {
  open: boolean;
  onClose: () => void;
  onSuccess?: () => void | Promise<void>;
}

export default function AddCustomer({
  open,
  onClose,
  onSuccess,
}: AddCustomerProps) {
  const [form, setForm] = useState<CustomerForm>(initialForm);
  const [states, setStates] = useState<ApiState[]>([]);
  const [loadingStates, setLoadingStates] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;

    setError(null);
    setForm(initialForm);

    async function loadStates() {
      try {
        setLoadingStates(true);

        const data = await getStates();
        setStates(data);
      } catch (err) {
        console.error(err);
        setError("Failed to load states");
      } finally {
        setLoadingStates(false);
      }
    }

    if (states.length === 0) {
      loadStates();
    }
  }, [open]);

  function updateField(
    field: keyof CustomerForm,
    value: string
  ) {
    setForm((previous) => ({
      ...previous,
      [field]: value,
    }));
  }

  async function handleCreateCustomer(
    event: FormEvent<HTMLFormElement>
  ) {
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

      setForm(initialForm);

      onClose();

      if (onSuccess) {
        await onSuccess();
      }
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to create customer"
      );
    } finally {
      setSubmitting(false);
    }
  }

  if (!open) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4 backdrop-blur-sm">
      <div className="w-full max-w-2xl overflow-hidden rounded-3xl bg-white shadow-2xl">

        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50/50 px-8 py-6">
          <div>
            <h2 className="text-xl font-semibold text-[#0f172a]">
              Add Customer
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Enter the required information to create a new profile.
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-500 transition-colors hover:bg-slate-50 hover:text-slate-700"
          >
            <X size={20} />
          </button>
        </div>

        {/* Error */}
        {error && (
          <div className="mx-8 mt-6 flex items-center justify-between rounded-xl border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-700">
            <span className="font-medium">
              {error}
            </span>

            <button
              type="button"
              onClick={() => setError(null)}
              className="text-red-500 hover:text-red-700"
            >
              <X size={18} />
            </button>
          </div>
        )}

        {/* Form */}
        <form
          onSubmit={handleCreateCustomer}
          className="p-8"
        >
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">

            {/* Customer Name */}
            <div className="sm:col-span-2">
              <label className="mb-2 block font-mono text-[11px] font-medium uppercase tracking-[0.2em] text-slate-500">
                Customer Name *
              </label>

              <input
                required
                value={form.name}
                onChange={(event) =>
                  updateField("name", event.target.value)
                }
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
                onChange={(event) =>
                  updateField("gstin_uin", event.target.value)
                }
                placeholder="27XXXXXXXXXXXXZ"
                className="h-[52px] w-full rounded-xl border border-slate-200 bg-white px-4 text-sm uppercase text-slate-700 outline-none transition-all placeholder:text-slate-400 focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600"
              />
            </div>

            {/* Contact Person */}
            <div>
              <label className="mb-2 block font-mono text-[11px] font-medium uppercase tracking-[0.2em] text-slate-500">
                Contact Person
              </label>

              <input
                value={form.contact_person}
                onChange={(event) =>
                  updateField(
                    "contact_person",
                    event.target.value
                  )
                }
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
                  onChange={(event) =>
                    updateField("state_id", event.target.value)
                  }
                  disabled={loadingStates}
                  className="h-[52px] w-full appearance-none rounded-xl border border-slate-200 bg-white px-4 text-sm text-slate-700 outline-none transition-all focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 disabled:cursor-not-allowed disabled:bg-slate-50"
                >
                  <option value="">
                    {loadingStates
                      ? "Loading states..."
                      : "Select State"}
                  </option>

                  {states.map((state) => (
                    <option
                      key={state.id}
                      value={String(state.id)}
                    >
                      {state.name}
                    </option>
                  ))}
                </select>

                <div className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-slate-400">
                  <ChevronRight
                    size={18}
                    className="rotate-90"
                  />
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
                onChange={(event) =>
                  updateField("address", event.target.value)
                }
                placeholder="Enter complete billing address"
                className="w-full resize-none rounded-xl border border-slate-200 bg-white p-4 text-sm text-slate-700 outline-none transition-all placeholder:text-slate-400 focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600"
              />
            </div>
          </div>

          {/* Actions */}
          <div className="mt-8 flex flex-col-reverse justify-end gap-3 border-t border-slate-100 pt-6 sm:flex-row">

            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              className="flex h-[48px] items-center justify-center rounded-xl bg-slate-50 px-6 text-sm font-semibold text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-900 disabled:opacity-50"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={submitting || loadingStates}
              className="flex h-[48px] items-center justify-center gap-2 rounded-xl bg-[#0f172a] px-8 text-sm font-bold uppercase tracking-[0.1em] text-white transition-all hover:bg-slate-800 hover:shadow-lg hover:shadow-slate-900/20 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-70"
            >
              {submitting ? (
                <>
                  <Loader2
                    size={18}
                    className="animate-spin"
                  />
                  Creating...
                </>
              ) : (
                <>
                  <UserPlus
                    size={18}
                    strokeWidth={2.5}
                  />
                  Create Customer
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}