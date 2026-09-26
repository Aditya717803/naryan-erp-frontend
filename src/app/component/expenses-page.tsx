"use client";

import { FormEvent, useEffect, useState } from "react";
import {
  CalendarDays,
  Loader2,
  Pencil,
  Plus,
  Receipt,
  Trash2,
  X,
} from "lucide-react";

import { createExpense, deleteExpense, getExpenses, updateExpense } from "@/lib/api";
import type { Expense, ExpenseInput } from "@/types/expense";

const PAGE_SIZE = 5;

interface ExpenseForm {
  date: string;
  description: string;
  amount: string;
}

const emptyForm: ExpenseForm = {
  date: "",
  description: "",
  amount: "",
};

function todayAsInputValue() {
  const today = new Date();
  return `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;
}

function formatAmount(value: number | string) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(Number(value));
}

function formatDate(value: string) {
  return new Date(`${value}T00:00:00`).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export default function ExpensesPage() {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [editing, setEditing] = useState<Expense | null>(null);
  const [form, setForm] = useState<ExpenseForm>(emptyForm);
  const [submitting, setSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  async function loadInitialExpenses() {
    try {
      setLoading(true);
      setError(null);
      const data = await getExpenses(PAGE_SIZE + 1, 0);
      setExpenses(data.slice(0, PAGE_SIZE));
      setHasMore(data.length > PAGE_SIZE);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to load expenses.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadInitialExpenses();
  }, []);

  async function handleLoadMore() {
    try {
      setLoadingMore(true);
      setError(null);
      const data = await getExpenses(PAGE_SIZE + 1, expenses.length);
      setExpenses((current) => [...current, ...data.slice(0, PAGE_SIZE)]);
      setHasMore(data.length > PAGE_SIZE);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to load more expenses.");
    } finally {
      setLoadingMore(false);
    }
  }

  function openCreateForm() {
    setEditing(null);
    setForm({ ...emptyForm, date: todayAsInputValue() });
    setError(null);
    setSuccess(null);
  }

  function openEditForm(expense: Expense) {
    setEditing(expense);
    setForm({
      date: expense.date,
      description: expense.description,
      amount: String(expense.amount),
    });
    setError(null);
    setSuccess(null);
  }

  function closeForm() {
    if (submitting) return;
    setEditing(null);
    setForm(emptyForm);
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const amount = Number(form.amount);
    if (!form.date) {
      setError("Date is required.");
      return;
    }
    if (!form.description.trim()) {
      setError("Description is required.");
      return;
    }
    if (!Number.isFinite(amount) || amount <= 0) {
      setError("Amount must be a positive number.");
      return;
    }

    const payload: ExpenseInput = {
      date: form.date,
      description: form.description.trim(),
      amount,
    };

    try {
      setSubmitting(true);
      setError(null);
      if (editing) {
        await updateExpense(editing.id, payload);
        setSuccess("Expense updated successfully.");
      } else {
        await createExpense(payload);
        setSuccess("Expense added successfully.");
      }
      setEditing(null);
      setForm(emptyForm);
      await loadInitialExpenses();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to save expense.");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete(expense: Expense) {
    if (!window.confirm(`Delete expense "${expense.description}"?`)) return;
    try {
      setDeletingId(expense.id);
      setError(null);
      setSuccess(null);
      await deleteExpense(expense.id);
      setExpenses((current) => current.filter((item) => item.id !== expense.id));
      setSuccess("Expense deleted successfully.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to delete expense.");
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <div className="min-h-full p-6 sm:p-10">
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="flex items-center gap-2 text-3xl font-mono tracking-tight text-[#5500ff]">
            <Receipt className="h-10 w-10 rounded-4xl bg-indigo-100 p-1 text-black" />
            Expenses
          </h1>
          <p className="mt-1.5 rounded-3xl border bg-violet-100 px-5 py-1 text-sm text-slate-500">
            Record and manage business expenses.
          </p>
        </div>
        <button
          type="button"
          onClick={openCreateForm}
          className="flex h-[48px] items-center justify-center gap-2 rounded-xl bg-[#0f172a] px-6 text-sm font-bold uppercase tracking-[0.1em] text-white transition-all hover:bg-slate-800 hover:shadow-lg hover:shadow-slate-900/20 active:scale-[0.98]"
        >
          <Plus size={18} strokeWidth={2.5} />
          Add Expense
        </button>
      </div>

      {error && (
        <div role="alert" className="mb-6 flex items-center justify-between rounded-xl border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-700">
          <span className="font-medium">{error}</span>
          <button type="button" onClick={() => setError(null)} aria-label="Dismiss error">
            <X size={18} />
          </button>
        </div>
      )}
      {success && (
        <div role="status" className="mb-6 flex items-center justify-between rounded-xl border border-emerald-200 bg-emerald-50 px-5 py-4 text-sm font-medium text-emerald-700">
          <span>{success}</span>
          <button type="button" onClick={() => setSuccess(null)} aria-label="Dismiss success">
            <X size={18} />
          </button>
        </div>
      )}

      <div className="overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
        {loading ? (
          <div className="flex min-h-[300px] flex-col items-center justify-center gap-3">
            <Loader2 size={24} className="animate-spin text-indigo-600" />
            <span className="text-sm font-medium text-slate-500">Loading expenses...</span>
          </div>
        ) : expenses.length === 0 ? (
          <div className="flex min-h-[300px] flex-col items-center justify-center p-8 text-center">
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-50">
              <Receipt size={28} className="text-slate-400" />
            </div>
            <h2 className="text-lg font-semibold text-[#0f172a]">No expenses yet</h2>
            <p className="mt-1 text-sm text-slate-500">Add an expense to get started.</p>
          </div>
        ) : (
          <>
            <div className="hidden grid-cols-[minmax(140px,0.8fr)_minmax(220px,2fr)_minmax(130px,1fr)_120px] gap-4 border-b border-slate-100 bg-slate-50 px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500 sm:grid">
              <span>Date</span><span>Description</span><span>Amount</span><span className="text-right">Actions</span>
            </div>
            <div className="divide-y divide-slate-100">
              {expenses.map((expense) => (
                <div key={expense.id} className="grid gap-3 p-5 transition-colors hover:bg-slate-50 sm:grid-cols-[minmax(140px,0.8fr)_minmax(220px,2fr)_minmax(130px,1fr)_120px] sm:items-center sm:gap-4 sm:px-6">
                  <div className="flex items-center gap-2 text-sm text-slate-600">
                    <CalendarDays size={16} className="text-indigo-500 sm:hidden" />
                    <span className="sm:hidden font-medium text-slate-400">Date:</span>
                    {formatDate(expense.date)}
                  </div>
                  <div className="min-w-0 break-words text-sm font-semibold text-[#0f172a]">{expense.description}</div>
                  <div className="text-sm font-semibold text-slate-700">
                    <span className="mr-2 font-medium text-slate-400 sm:hidden">Amount:</span>
                    {formatAmount(expense.amount)}
                  </div>
                  <div className="flex justify-end gap-2">
                    <button type="button" onClick={() => openEditForm(expense)} className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-slate-200 px-3 text-xs font-semibold text-slate-600 transition-colors hover:border-indigo-200 hover:bg-indigo-50 hover:text-indigo-700" aria-label={`Edit ${expense.description}`}>
                      <Pencil size={14} /> <span className="sm:hidden">Edit</span>
                    </button>
                    <button type="button" onClick={() => handleDelete(expense)} disabled={deletingId === expense.id} className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-red-100 px-3 text-xs font-semibold text-red-600 transition-colors hover:bg-red-50 disabled:opacity-50" aria-label={`Delete ${expense.description}`}>
                      {deletingId === expense.id ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}
                      <span className="sm:hidden">Delete</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      {!loading && expenses.length > 0 && hasMore && (
        <div className="mt-6 flex justify-center">
          <button type="button" onClick={handleLoadMore} disabled={loadingMore} className="flex h-11 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-6 text-sm font-semibold text-slate-700 shadow-sm transition-colors hover:border-indigo-200 hover:bg-indigo-50 hover:text-indigo-700 disabled:cursor-not-allowed disabled:opacity-60">
            {loadingMore && <Loader2 size={16} className="animate-spin" />}
            {loadingMore ? "Loading..." : "Load More"}
          </button>
        </div>
      )}

      {(editing !== null || form.date !== "") && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4" onMouseDown={(event) => {
          if (event.target === event.currentTarget) closeForm();
        }}>
          <div role="dialog" aria-modal="true" aria-labelledby="expense-form-title" className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl sm:p-8">
            <div className="mb-6 flex items-start justify-between">
              <div>
                <h2 id="expense-form-title" className="text-xl font-semibold text-slate-900">{editing ? "Edit Expense" : "Add Expense"}</h2>
                <p className="mt-1 text-sm text-slate-500">Enter the expense details below.</p>
              </div>
              <button type="button" onClick={closeForm} disabled={submitting} aria-label="Close form" className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700"><X size={18} /></button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-5">
              <label className="block text-sm font-medium text-slate-700">
                Date
                <input type="date" required value={form.date} onChange={(event) => setForm((current) => ({ ...current, date: event.target.value }))} className="mt-2 h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none transition focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500" />
              </label>
              <label className="block text-sm font-medium text-slate-700">
                Description
                <input type="text" required maxLength={500} value={form.description} onChange={(event) => setForm((current) => ({ ...current, description: event.target.value }))} placeholder="What was this expense for?" className="mt-2 h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none transition placeholder:text-slate-400 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500" />
              </label>
              <label className="block text-sm font-medium text-slate-700">
                Amount
                <input type="number" required min="0.01" step="0.01" value={form.amount} onChange={(event) => setForm((current) => ({ ...current, amount: event.target.value }))} placeholder="0.00" className="mt-2 h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none transition placeholder:text-slate-400 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500" />
              </label>
              {error && <p role="alert" className="text-sm font-medium text-red-600">{error}</p>}
              <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={closeForm} disabled={submitting} className="h-11 rounded-xl border border-slate-200 px-5 text-sm font-semibold text-slate-600 hover:bg-slate-50 disabled:opacity-50">Cancel</button>
                <button type="submit" disabled={submitting} className="flex h-11 items-center justify-center gap-2 rounded-xl bg-[#0f172a] px-5 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60">
                  {submitting && <Loader2 size={16} className="animate-spin" />}
                  {submitting ? "Saving..." : editing ? "Save Changes" : "Save Expense"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
