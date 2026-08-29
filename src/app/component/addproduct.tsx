"use client";

import { FormEvent, useEffect, useState } from "react";
import {
  X,
  Loader2,
  Plus,
  ChevronRight,
} from "lucide-react";

import { createProduct } from "@/lib/api";

import type { CreateProductDTO } from "@/types/product";

const initialForm: CreateProductDTO = {
  product_code: "",
  name: "",
  hsn_sac: "",
  unit: "Piece",
};

interface AddProductProps {
  open: boolean;
  onClose: () => void;
  onSuccess?: () => void | Promise<void>;
}

export default function AddProduct({
  open,
  onClose,
  onSuccess,
}: AddProductProps) {
  const [form, setForm] =
    useState<CreateProductDTO>(initialForm);

  const [submitting, setSubmitting] =
    useState(false);

  const [error, setError] =
    useState<string | null>(null);

  useEffect(() => {
    if (!open) return;

    setForm(initialForm);
    setError(null);
  }, [open]);

  function updateField(
    field: keyof CreateProductDTO,
    value: string
  ) {
    setForm((previous) => ({
      ...previous,
      [field]: value,
    }));
  }

  async function handleCreateProduct(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    try {
      setSubmitting(true);
      setError(null);

      await createProduct({
        product_code: form.product_code.trim(),
        name: form.name.trim(),
        hsn_sac: form.hsn_sac?.trim() || null,
        unit: form.unit.trim(),
      });

      setForm(initialForm);

      onClose();

      if (onSuccess) {
        await onSuccess();
      }
    } catch (err) {
      console.error(err);

      setError(
        err instanceof Error
          ? err.message
          : "Failed to create product"
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
              Add Product
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Enter details to register a new product in the master.
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={submitting}
            className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-500 transition-colors hover:bg-slate-50 hover:text-slate-700 disabled:opacity-50"
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
              className="text-red-500 transition-colors hover:text-red-700"
            >
              <X size={18} />
            </button>
          </div>
        )}

        {/* Form */}
        <form
          onSubmit={handleCreateProduct}
          className="space-y-6 p-8"
        >
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">

            {/* Product Name */}
            <div className="sm:col-span-2">
              <label className="mb-2 block font-mono text-[11px] font-medium uppercase tracking-[0.2em] text-slate-500">
                Product Name *
              </label>

              <input
                required
                value={form.name}
                onChange={(event) =>
                  updateField(
                    "name",
                    event.target.value
                  )
                }
                placeholder="E.g. American Handle"
                className="h-[52px] w-full rounded-xl border border-slate-200 bg-white px-4 text-sm text-slate-700 outline-none transition-all placeholder:text-slate-400 focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600"
              />
            </div>

            {/* Product Code */}
            <div className="sm:col-span-2">
              <label className="mb-2 block font-mono text-[11px] font-medium uppercase tracking-[0.2em] text-slate-500">
                Product Code / SKU *
              </label>

              <input
                required
                value={form.product_code}
                onChange={(event) =>
                  updateField(
                    "product_code",
                    event.target.value
                  )
                }
                placeholder="E.g. HANDLE-001"
                className="h-[52px] w-full rounded-xl border border-slate-200 bg-white px-4 font-mono text-sm uppercase text-slate-700 outline-none transition-all placeholder:text-slate-400 focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600"
              />
            </div>

            {/* HSN / SAC */}
            <div>
              <label className="mb-2 block font-mono text-[11px] font-medium uppercase tracking-[0.2em] text-slate-500">
                HSN / SAC
              </label>

              <input
                value={form.hsn_sac ?? ""}
                onChange={(event) =>
                  updateField(
                    "hsn_sac",
                    event.target.value
                  )
                }
                placeholder="E.g. 8302"
                className="h-[52px] w-full rounded-xl border border-slate-200 bg-white px-4 font-mono text-sm text-slate-700 outline-none transition-all placeholder:text-slate-400 focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600"
              />
            </div>

            {/* Unit */}
            <div>
              <label className="mb-2 block font-mono text-[11px] font-medium uppercase tracking-[0.2em] text-slate-500">
                Unit *
              </label>

              <div className="relative">
                <select
                  required
                  value={form.unit}
                  onChange={(event) =>
                    updateField(
                      "unit",
                      event.target.value
                    )
                  }
                  className="h-[52px] w-full appearance-none rounded-xl border border-slate-200 bg-white px-4 text-sm text-slate-700 outline-none transition-all focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600"
                >
                  <option value="Piece">
                    Piece
                  </option>

                  <option value="Kg">
                    Kg
                  </option>

                  <option value="Meter">
                    Meter
                  </option>

                  <option value="Box">
                    Box
                  </option>

                  <option value="Set">
                    Set
                  </option>
                </select>

                <div className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-slate-400">
                  <ChevronRight
                    size={18}
                    className="rotate-90"
                  />
                </div>
              </div>
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
              disabled={submitting}
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
                  <Plus
                    size={18}
                    strokeWidth={2.5}
                  />
                  Create Product
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}