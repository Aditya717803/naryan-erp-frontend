"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import {
  Box,
  Package,
  Plus,
  Search,
  X,
  Loader2,
  AlertCircle,
  ChevronRight,
  PlusCircle,
  MinusCircle,
  History,
  ArrowUp,
  ArrowDown,
  Filter,
  Pencil,
} from "lucide-react";

import {
  getManufactureProducts,
  createManufactureProduct,
  updateManufactureProduct,
  getManufactureInventory,
  addManufactureStock,
  removeManufactureStock,
  addManufactureBundleCount,
  removeManufactureBundleCount,
  getManufactureInventoryTransactions,
} from "@/lib/api";

import type {
  Product,
  CreateProductDTO,
  UpdateProductDTO,
} from "@/types/product";

import type {
  Inventory,
  InventoryTransaction,
} from "@/types/inventory";

const initialForm: CreateProductDTO = {
  product_code: "",
  name: "",
  hsn_sac: "",
  unit: "Piece",
};

type StockFilter = "all" | "in-stock" | "low-stock" | "out-of-stock";
type SortFilter = "name-asc" | "name-desc" | "stock-asc" | "stock-desc";

export default function InventoryPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [inventory, setInventory] = useState<Inventory[]>([]);
  const [search, setSearch] = useState("");
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [unitFilter, setUnitFilter] = useState("all");
  const [stockFilter, setStockFilter] = useState<StockFilter>("all");
  const [sortFilter, setSortFilter] = useState<SortFilter>("name-asc");

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const [showAddProduct, setShowAddProduct] =
    useState(false);
  const [editingProduct, setEditingProduct] =
    useState<Product | null>(null);

  const [form, setForm] =
    useState<CreateProductDTO>(initialForm);

  // Stock modal
  const [stockModal, setStockModal] = useState<{
    type: "add" | "remove";
    product: Product;
  } | null>(null);

  const [stockQuantity, setStockQuantity] = useState("");
  const [bundleQuantity, setBundleQuantity] = useState("");
  const [stockNote, setStockNote] = useState("");
  const [stockSubmitting, setStockSubmitting] = useState(false);

  // History modal
  const [historyProduct, setHistoryProduct] =
    useState<Product | null>(null);

  const [transactions, setTransactions] =
    useState<InventoryTransaction[]>([]);

  const [historyLoading, setHistoryLoading] =
    useState(false);

  async function loadInventory(searchTerm = "") {
    try {
      setLoading(true);
      setError(null);

      const [productData, inventoryData] =
        await Promise.all([
          getManufactureProducts(searchTerm.trim() || undefined),
          getManufactureInventory(),
        ]);

      setProducts(productData);
      setInventory(inventoryData);
    } catch (err) {
      console.error(err);

      setError(
        err instanceof Error
          ? err.message
          : "Failed to load inventory",
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadInventory();
  }, []);

  function getProductStock(productId: number): number {
    const item = inventory.find(
      (entry) => entry.product_id === productId,
    );

    return item?.quantity ?? 0;
  }

  function getProductBundleCount(productId: number): number {
    const item = inventory.find(
      (entry) => entry.product_id === productId,
    );

    return item?.bundle_count ?? 0;
  }

  const unitOptions = useMemo(
    () =>
      Array.from(
        new Map(
          products.map((product) => {
            const value = product.unit.trim().toLowerCase();
            return [value, product.unit.trim()];
          }),
        ).entries(),
      ).sort((first, second) => first[1].localeCompare(second[1])),
    [products],
  );

  const filteredProducts = useMemo(() => {
    const result = products.filter((product) => {
      const unit = product.unit.trim().toLowerCase();
      const stock = getProductStock(product.id);
      const matchesUnit =
        unitFilter === "all" || unit === unitFilter;
      const matchesStock =
        stockFilter === "all" ||
        (stockFilter === "in-stock" && stock >= 10) ||
        (stockFilter === "low-stock" && stock > 0 && stock < 10) ||
        (stockFilter === "out-of-stock" && stock === 0);

      return matchesUnit && matchesStock;
    });

    return result.sort((first, second) => {
      if (sortFilter === "stock-asc") {
        return getProductStock(first.id) - getProductStock(second.id);
      }

      if (sortFilter === "stock-desc") {
        return getProductStock(second.id) - getProductStock(first.id);
      }

      const comparison = first.name.localeCompare(second.name);
      return sortFilter === "name-desc" ? -comparison : comparison;
    });
  }, [products, inventory, unitFilter, stockFilter, sortFilter]);

  function clearFilters() {
    setUnitFilter("all");
    setStockFilter("all");
    setSortFilter("name-asc");
  }

  function updateField(
    field: keyof CreateProductDTO,
    value: string,
  ) {
    setForm((previous) => ({
      ...previous,
      [field]: value,
    }));
  }

  async function handleCreateProduct(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    try {
      setSubmitting(true);
      setError(null);

      if (editingProduct) {
        const data: UpdateProductDTO = {
          name: form.name.trim(),
          hsn_sac: form.hsn_sac?.trim() || null,
          unit: form.unit.trim(),
        };
        const updated = await updateManufactureProduct(
          editingProduct.id,
          data,
        );
        setProducts((current) =>
          current.map((product) =>
            product.id === updated.id ? updated : product,
          ),
        );
        setSuccess("Product updated successfully.");
      } else {
        await createManufactureProduct({
          product_code: form.product_code.trim(),
          name: form.name.trim(),
          hsn_sac: form.hsn_sac?.trim() || null,
          unit: form.unit.trim(),
        });
        await loadInventory(search);
        setSuccess("Product created successfully.");
      }

      setForm(initialForm);
      setShowAddProduct(false);
      setEditingProduct(null);
    } catch (err) {
      console.error(err);

      setError(
        err instanceof Error
          ? err.message
          : "Failed to create product",
      );
    } finally {
      setSubmitting(false);
    }
  }

  function openEditProduct(product: Product) {
    setError(null);
    setSuccess(null);
    setEditingProduct(product);
    setForm({
      product_code: product.product_code,
      name: product.name,
      hsn_sac: product.hsn_sac ?? "",
      unit: product.unit,
    });
    setShowAddProduct(true);
  }

  function handleSearchSubmit(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();
    loadInventory(search);
  }

  function openStockModal(
    type: "add" | "remove",
    product: Product,
  ) {
    setError(null);
    setStockQuantity("");
    setBundleQuantity("");
    setStockNote("");

    setStockModal({
      type,
      product,
    });
  }

  function closeStockModal() {
    if (stockSubmitting) return;

    setStockModal(null);
    setStockQuantity("");
    setBundleQuantity("");
    setStockNote("");
  }

  async function handleStockAdjustment(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    if (!stockModal) return;

    const adjustingBundles = bundleQuantity !== "";
    if (
      stockQuantity !== "" &&
      adjustingBundles
    ) {
      setError(
        stockModal.type === "add"
          ? "Only stock or bundles can be added at a time."
          : "Only stock or bundles can be removed at a time.",
      );
      return;
    }

    if (stockQuantity === "" && !adjustingBundles) {
      setError(
        stockModal.type === "add"
          ? "Enter a stock quantity or bundle quantity to add."
          : "Enter a stock quantity or bundle quantity to remove.",
      );
      return;
    }

    if (adjustingBundles) {
      const count = Number(bundleQuantity);
      if (!Number.isInteger(count) || count <= 0) {
        setError("Bundle quantity must be a positive whole number.");
        return;
      }
      const availableBundles = getProductBundleCount(stockModal.product.id);
      if (stockModal.type === "remove" && count > availableBundles) {
        setError(`Cannot remove more than ${availableBundles} bundles.`);
        return;
      }
    }

    const quantity = Number(stockQuantity);

    const isKg =
      stockModal.product.unit.trim().toLowerCase() === "kg";

    if (
      !adjustingBundles &&
      (quantity <= 0 || (!isKg && !Number.isInteger(quantity)))
    ) {
      setError(
        isKg
          ? "Quantity must be greater than zero."
          : `Quantity for ${stockModal.product.unit} must be a whole number.`,
      );
      return;
    }

    try {
      setStockSubmitting(true);
      setError(null);

      if (adjustingBundles) {
        const data = {
          count: Number(bundleQuantity),
          note: stockNote.trim() || null,
        };
        const updated =
          stockModal.type === "add"
            ? await addManufactureBundleCount(
                stockModal.product.id,
                data,
              )
            : await removeManufactureBundleCount(
                stockModal.product.id,
                data,
              );
        setInventory((current) =>
          current.some((entry) => entry.product_id === stockModal.product.id)
            ? current.map((entry) =>
                entry.product_id === stockModal.product.id ? updated : entry,
              )
            : [...current, updated],
        );
      } else if (stockModal.type === "add") {
        await addManufactureStock(
          stockModal.product.id,
          {
            quantity,
            note: stockNote.trim() || null,
          },
        );
      } else {
        await removeManufactureStock(
          stockModal.product.id,
          {
            quantity,
            note: stockNote.trim() || null,
          },
        );
      }

      closeStockModal();
      await loadInventory(search);
    } catch (err) {
      console.error(err);

      setError(
        err instanceof Error
          ? err.message
          : "Failed to update stock",
      );
    } finally {
      setStockSubmitting(false);
    }
  }

  async function openHistory(product: Product) {
    try {
      setHistoryProduct(product);
      setTransactions([]);
      setHistoryLoading(true);
      setError(null);

      const data =
        await getManufactureInventoryTransactions(product.id);

      setTransactions(data);
    } catch (err) {
      console.error(err);

      setError(
        err instanceof Error
          ? err.message
          : "Failed to load stock history",
      );
    } finally {
      setHistoryLoading(false);
    }
  }

  function closeHistory() {
    setHistoryProduct(null);
    setTransactions([]);
  }

  return (
    <div className="relative min-h-full p-6 sm:p-10">
      {/* Subtle Grid Background */}
      <div className="pointer-events-none absolute inset-0 z-0 " />

      <div className="relative z-10">
        {/* Header */}
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className=" flex items-center  gap-2 text-3xl font-mono tracking-tight text-[#5500ff]">
              <Box size= {36}/> Inventory
              
            </h1>
            <p className="mt-1.5 bg-violet-100 text-sm text-slate-500 border rounded-3xl px-5 py-1">
              Manage products and available stock.
            </p>
          </div>

          <button
            type="button"
            onClick={() => {
              setError(null);
              setSuccess(null);
              setEditingProduct(null);
              setForm(initialForm);
              setShowAddProduct(true);
            }}
            className="flex h-[48px] items-center justify-center gap-2 rounded-xl bg-[#0f172a] px-6 text-sm font-bold uppercase tracking-[0.1em] text-white transition-all hover:bg-slate-800 hover:shadow-lg hover:shadow-slate-900/20 active:scale-[0.98]"
          >
            <Plus size={18} strokeWidth={2.5} />
            Add Product
          </button>
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
        {success && (
          <div className="mb-6 rounded-xl border border-emerald-200 bg-emerald-50 px-5 py-4 text-sm font-medium text-emerald-700">
            {success}
          </div>
        )}

        {/* Search & Meta */}
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          {/* Search Form */}
          <div className="flex w-full flex-wrap items-start gap-3">
            <form
              onSubmit={handleSearchSubmit}
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
            placeholder="Search Product Name..."
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

            {/* Product count */}
            <div className="flex h-[52px] items-center gap-2 rounded-xl border border-slate-200 bg-white/80 px-5 text-sm font-medium text-slate-600 shadow-sm backdrop-blur-sm">
              <Package
                size={18}
                className="text-black"
                
              />
              <span>
                {filteredProducts.length}{" "}
                {filteredProducts.length === 1
                  ? "Product"
                  : "Products"}
              </span>
            </div>
          </div>

          {filtersOpen && (
            <div className="mt-4 grid w-full grid-cols-1 gap-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:grid-cols-3">
              <label className="flex flex-col gap-2 text-xs font-semibold uppercase tracking-[0.15em] text-slate-500">
                Unit
                <select
                  value={unitFilter}
                  onChange={(event) => setUnitFilter(event.target.value)}
                  className="h-10 rounded-xl border border-slate-200 bg-white px-3 text-sm font-normal normal-case tracking-normal text-slate-700 outline-none focus:border-indigo-600"
                >
                  <option value="all">All</option>
                  {unitOptions.map(([value, label]) => (
                    <option key={value} value={value}>
                      {label}
                    </option>
                  ))}
                </select>
              </label>
              <label className="flex flex-col gap-2 text-xs font-semibold uppercase tracking-[0.15em] text-slate-500">
                Stock Status
                <select
                  value={stockFilter}
                  onChange={(event) => setStockFilter(event.target.value as StockFilter)}
                  className="h-10 rounded-xl border border-slate-200 bg-white px-3 text-sm font-normal normal-case tracking-normal text-slate-700 outline-none focus:border-indigo-600"
                >
                  <option value="all">All</option>
                  <option value="in-stock">In Stock</option>
                  <option value="low-stock">Low Stock</option>
                  <option value="out-of-stock">Out of Stock</option>
                </select>
              </label>
              <label className="flex flex-col gap-2 text-xs font-semibold uppercase tracking-[0.15em] text-slate-500">
                Sort By
                <select
                  value={sortFilter}
                  onChange={(event) => setSortFilter(event.target.value as SortFilter)}
                  className="h-10 rounded-xl border border-slate-200 bg-white px-3 text-sm font-normal normal-case tracking-normal text-slate-700 outline-none focus:border-indigo-600"
                >
                  <option value="name-asc">Product Name (A-Z)</option>
                  <option value="name-desc">Product Name (Z-A)</option>
                  <option value="stock-asc">Stock: Low to High</option>
                  <option value="stock-desc">Stock: High to Low</option>
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

        {/* Products table */}
        <div className="overflow-hidden rounded-3xl border border-slate-100 bg-white/90 shadow-[0_8px_30px_rgb(0,0,0,0.06)] backdrop-blur-md">
          {loading ? (
            <div className="flex min-h-[350px] flex-col items-center justify-center gap-3">
              <Loader2
                size={24}
                className="animate-spin text-indigo-600"
              />
              <span className="text-sm font-medium text-slate-500">
                Loading inventory...
              </span>
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="flex min-h-[350px] flex-col items-center justify-center p-8 text-center">
              <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-50">
                <Package
                  size={28}
                  className="text-slate-400"
                />
              </div>
              <h3 className="text-lg font-semibold text-[#0f172a]">
                No products found
              </h3>
              <p className="mt-1 text-sm text-slate-500">
                Add a product or try adjusting your search terms.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[1000px] text-left text-sm">
                <thead className="border-b border-slate-100 bg-slate-50/50">
                  <tr>
                    <th className="px-6 py-4 font-mono text-[11px] font-semibold uppercase tracking-[0.15em] text-slate-500">
                      Product
                    </th>
                    <th className="px-6 py-4 font-mono text-[11px] font-semibold uppercase tracking-[0.15em] text-slate-500">
                      Code / SKU
                    </th>
                    <th className="px-6 py-4 font-mono text-[11px] font-semibold uppercase tracking-[0.15em] text-slate-500">
                      HSN/SAC
                    </th>
                    <th className="px-6 py-4 font-mono text-[11px] font-semibold uppercase tracking-[0.15em] text-slate-500">
                      Unit
                    </th>
                    <th className="px-6 py-4 font-mono text-[11px] font-semibold uppercase tracking-[0.15em] text-slate-500">
                      Available Stock
                    </th>
                    <th className="px-6 py-4 font-mono text-[11px] font-semibold uppercase tracking-[0.15em] text-slate-500">
                      Bundles
                    </th>
                    <th className="px-6 py-4 text-right font-mono text-[11px] font-semibold uppercase tracking-[0.15em] text-slate-500">
                      Actions
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-100/60">
                  {filteredProducts.map((product) => {
                    const stock = getProductStock(product.id);

                    return (
                      <tr
                        key={product.id}
                        className="transition-colors hover:bg-slate-50/50"
                      >
                        {/* Product */}
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-4">
                            <div className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
                              <Package
                                size={18}
                                fill="currentColor"
                                className="opacity-20"
                              />
                              <Package
                                size={18}
                                className="absolute"
                              />
                            </div>
                            <div className="font-semibold text-[#0f172a]">
                              {product.name}
                            </div>
                          </div>
                        </td>

                        {/* SKU */}
                        <td className="px-6 py-4">
                          <span className="rounded-md bg-slate-100 px-2 py-1 font-mono text-xs font-semibold tracking-wider text-slate-600">
                            {product.product_code}
                          </span>
                        </td>

                        {/* HSN */}
                        <td className="px-6 py-4 font-medium text-slate-500">
                          {product.hsn_sac || "-"}
                        </td>

                        {/* Unit */}
                        <td className="px-6 py-4 font-medium text-slate-500">
                          {product.unit}
                        </td>

                        {/* Stock */}
                        <td className="px-6 py-4">
                          <span
                            className={`inline-flex min-w-[70px] justify-center rounded-lg px-3 py-1.5 font-mono text-sm font-bold ${
                              stock === 0
                                ? "bg-red-50 text-red-600"
                                : stock < 10
                                  ? "bg-amber-50 text-amber-600"
                                  : "bg-emerald-50 text-emerald-600"
                            }`}
                          >
                            {stock}
                          </span>
                        </td>

                        {/* Bundles */}
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <span className="min-w-8 text-center font-mono text-sm font-bold text-slate-700">
                              {inventory.find((entry) => entry.product_id === product.id)?.bundle_count ?? 0}
                            </span>
                          </div>
                        </td>

                        {/* Actions */}
                        <td className="px-6 py-4">
                          <div className="flex justify-end gap-2">
                            <button
                              type="button"
                              onClick={() => openEditProduct(product)}
                              title="Edit product"
                              className="flex h-9 items-center gap-1.5 rounded-lg bg-indigo-50 px-3 text-xs font-semibold text-indigo-600 transition-colors hover:bg-indigo-100"
                            >
                              <Pencil size={15} />
                              Edit
                            </button>
                            <button
                              type="button"
                              onClick={() =>
                                openStockModal(
                                  "add",
                                  product,
                                )
                              }
                              title="Add stock"
                              className="flex h-9 items-center gap-1.5 rounded-lg bg-emerald-50 px-3 text-xs font-semibold text-emerald-600 transition-colors hover:bg-emerald-100"
                            >
                              <PlusCircle size={15} />
                              Add
                            </button>

                            <button
                              type="button"
                              onClick={() =>
                                openStockModal(
                                  "remove",
                                  product,
                                )
                              }
                              title="Remove stock"
                              className="flex h-9 items-center gap-1.5 rounded-lg bg-red-50 px-3 text-xs font-semibold text-red-600 transition-colors hover:bg-red-100"
                            >
                              <MinusCircle size={15} />
                              Remove
                            </button>

                            <button
                              type="button"
                              onClick={() =>
                                openHistory(product)
                              }
                              title="View stock history"
                              className="flex h-9 items-center gap-1.5 rounded-lg bg-slate-100 px-3 text-xs font-semibold text-slate-600 transition-colors hover:bg-slate-200"
                            >
                              <History size={15} />
                              History
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* =====================================================
          ADD PRODUCT MODAL
      ====================================================== */}
      {showAddProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4 backdrop-blur-sm">
          <div className="w-full max-w-2xl overflow-hidden rounded-3xl bg-white shadow-2xl">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50/50 px-8 py-6">
              <div>
                <h2 className="text-xl font-semibold text-[#0f172a]">
                  {editingProduct ? "Edit Product" : "Add Product"}
                </h2>
                <p className="mt-1 text-sm text-slate-500">
                  {editingProduct
                    ? "Update product master details."
                    : "Enter details to register a new product in the master."}
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setShowAddProduct(false);
                  setEditingProduct(null);
                }}
                disabled={submitting}
                className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-500 transition-colors hover:bg-slate-50 hover:text-slate-700"
              >
                <X size={20} />
              </button>
            </div>

            {/* Form */}
            <form
              onSubmit={handleCreateProduct}
              className="space-y-6 p-8"
            >
              {error && (
                <div role="alert" className="rounded-xl border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-700">
                  {error}
                </div>
              )}
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                {/* Product name */}
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
                        event.target.value,
                      )
                    }
                    placeholder="E.g. American Handle"
                    className="h-[52px] w-full rounded-xl border border-slate-200 bg-white px-4 text-sm text-slate-700 outline-none transition-all placeholder:text-slate-400 focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600"
                  />
                </div>

                {/* Product code */}
                {!editingProduct && <div className="sm:col-span-2">
                  <label className="mb-2 block font-mono text-[11px] font-medium uppercase tracking-[0.2em] text-slate-500">
                    Product Code / SKU *
                  </label>
                  <input
                    required
                    value={form.product_code}
                    onChange={(event) =>
                      updateField(
                        "product_code",
                        event.target.value,
                      )
                    }
                    placeholder="E.g. HANDLE-001"
                    className="h-[52px] w-full rounded-xl border border-slate-200 bg-white px-4 font-mono text-sm uppercase text-slate-700 outline-none transition-all placeholder:text-slate-400 focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600"
                  />
                </div>}

                {/* HSN */}
                <div>
                  <label className="mb-2 block font-mono text-[11px] font-medium uppercase tracking-[0.2em] text-slate-500">
                    HSN / SAC
                  </label>
                  <input
                    value={form.hsn_sac ?? ""}
                    onChange={(event) =>
                      updateField(
                        "hsn_sac",
                        event.target.value,
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
                      value={form.unit}
                      onChange={(event) =>
                        updateField(
                          "unit",
                          event.target.value,
                        )
                      }
                      className="h-[52px] w-full appearance-none rounded-xl border border-slate-200 bg-white px-4 text-sm text-slate-700 outline-none transition-all focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600"
                    >
                      <option value="Piece">Piece</option>
                      <option value="Kg">Kg</option>
                      <option value="Meter">Meter</option>
                      <option value="Box">Box</option>
                      <option value="Set">Set</option>
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
                  onClick={() => {
                    setShowAddProduct(false);
                    setEditingProduct(null);
                  }}
                  disabled={submitting}
                  className="flex h-[48px] items-center justify-center rounded-xl bg-slate-50 px-6 text-sm font-semibold text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-900"
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
                      {editingProduct ? "Saving..." : "Creating..."}
                    </>
                  ) : (
                    <>
                      {editingProduct ? (
                        <Pencil size={18} />
                      ) : (
                        <Plus size={18} strokeWidth={2.5} />
                      )}
                      {editingProduct ? "Save Changes" : "Create Product"}
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =====================================================
          ADD / REMOVE STOCK MODAL
      ====================================================== */}
      {stockModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4 backdrop-blur-sm">
          <div className="w-full max-w-lg overflow-hidden rounded-3xl bg-white shadow-2xl">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50/50 px-8 py-6">
              <div>
                <div className="flex items-center gap-3">
                  {stockModal.type === "add" ? (
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                      <ArrowUp size={19} />
                    </div>
                  ) : (
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-50 text-red-600">
                      <ArrowDown size={19} />
                    </div>
                  )}
                  <div>
                    <h2 className="text-xl font-semibold text-[#0f172a]">
                      {stockModal.type === "add"
                        ? "Add Stock"
                        : "Remove Stock"}
                    </h2>
                    <p className="mt-1 text-sm text-slate-500">
                      {stockModal.product.name}
                    </p>
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={closeStockModal}
                disabled={stockSubmitting}
                className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-500 transition-colors hover:bg-slate-50 hover:text-slate-700 disabled:opacity-50"
              >
                <X size={20} />
              </button>
            </div>

            {/* Form */}
            <form
              onSubmit={handleStockAdjustment}
              className="space-y-6 p-8"
            >
              {error && (
                <div
                  role="alert"
                  className="flex items-center gap-3 rounded-xl border border-red-200 bg-red-50/80 px-5 py-4 text-sm text-red-700"
                >
                  <AlertCircle size={18} />
                  <span className="font-medium">{error}</span>
                </div>
              )}

              {/* Current stock */}
              <div className="rounded-2xl border border-slate-100 bg-slate-50 p-5">
                <div className="text-[11px] font-medium uppercase tracking-[0.2em] text-slate-400">
                  Current Stock
                </div>
                <div className="mt-2 flex items-baseline gap-2">
                  <span className="text-3xl font-semibold text-[#0f172a]">
                    {getProductStock(
                      stockModal.product.id,
                    )}
                  </span>
                  <span className="text-sm font-medium text-slate-500">
                    {stockModal.product.unit}
                  </span>
                </div>
              </div>

              {/* Quantity */}
              <div>
                <label className="mb-2 block font-mono text-[11px] font-medium uppercase tracking-[0.2em] text-slate-500">
                  Quantity *
                </label>
                <input
                  required={bundleQuantity === ""}
                  type="number"
                  min="1"
                  step={
                    stockModal.product.unit.trim().toLowerCase() === "kg"
                      ? "0.1"
                      : "1"
                  }
                  inputMode={
                    stockModal.product.unit.trim().toLowerCase() === "kg"
                      ? "decimal"
                      : "numeric"
                  }
                  value={stockQuantity}
                  onChange={(event) =>
                    setStockQuantity(
                      event.target.value,
                    )
                  }
                  placeholder="Enter quantity"
                  className="h-[52px] w-full rounded-xl border border-slate-200 bg-white px-4 text-sm text-slate-700 outline-none transition-all placeholder:text-slate-400 focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600"
                />
              </div>

              {/* Note */}
              <div>
                <label className="mb-2 block font-mono text-[11px] font-medium uppercase tracking-[0.2em] text-slate-500">
                  Note
                </label>
                <textarea
                  value={stockNote}
                  onChange={(event) =>
                    setStockNote(
                      event.target.value,
                    )
                  }
                  rows={3}
                  maxLength={500}
                  placeholder={
                    stockModal.type === "add"
                      ? "E.g. New stock received"
                      : "E.g. Damaged products"
                  }
                  className="w-full resize-none rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 outline-none transition-all placeholder:text-slate-400 focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600"
                />
              </div>

              <div className="rounded-2xl border border-slate-100 bg-slate-50 p-5">
                <div className="text-[11px] font-medium uppercase tracking-[0.2em] text-slate-400">
                  Bundle
                </div>
                <div className="mt-4">
                  <div className="mb-2 text-[11px] font-medium uppercase tracking-[0.2em] text-slate-400">
                    Current Bundle
                  </div>
                  <div className="text-3xl font-semibold text-[#0f172a]">
                    {getProductBundleCount(stockModal.product.id)}
                  </div>
                </div>
                <div className="mt-4">
                  <label className="mb-2 block font-mono text-[11px] font-medium uppercase tracking-[0.2em] text-slate-500">
                    Bundle Quantity
                  </label>
                  <input
                    type="number"
                    min="1"
                    step="1"
                    max={
                      stockModal.type === "remove"
                        ? getProductBundleCount(stockModal.product.id)
                        : undefined
                    }
                    inputMode="numeric"
                    value={bundleQuantity}
                    onChange={(event) =>
                      setBundleQuantity(event.target.value)
                    }
                    placeholder="Enter bundle quantity"
                    className="h-[52px] w-full rounded-xl border border-slate-200 bg-white px-4 text-sm text-slate-700 outline-none transition-all placeholder:text-slate-400 focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600"
                  />
                </div>
              </div>

              {/* Actions */}
              <div className="flex flex-col-reverse justify-end gap-3 border-t border-slate-100 pt-6 sm:flex-row">
                <button
                  type="button"
                  onClick={closeStockModal}
                  disabled={stockSubmitting}
                  className="flex h-[48px] items-center justify-center rounded-xl bg-slate-50 px-6 text-sm font-semibold text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-900 disabled:opacity-50"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={stockSubmitting}
                  className={`flex h-[48px] items-center justify-center gap-2 rounded-xl px-8 text-sm font-bold uppercase tracking-[0.1em] text-white transition-all active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-70 ${
                    stockModal.type === "add"
                      ? "bg-emerald-600 hover:bg-emerald-700"
                      : "bg-red-600 hover:bg-red-700"
                  }`}
                >
                  {stockSubmitting ? (
                    <>
                      <Loader2
                        size={18}
                        className="animate-spin"
                      />
                      Updating...
                    </>
                  ) : stockModal.type === "add" ? (
                    <>
                      <PlusCircle size={18} />
                      Add Stock
                    </>
                  ) : (
                    <>
                      <MinusCircle size={18} />
                      Remove Stock
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =====================================================
          STOCK HISTORY MODAL
      ====================================================== */}
      {historyProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4 backdrop-blur-sm">
          <div className="w-full max-w-3xl overflow-hidden rounded-3xl bg-white shadow-2xl">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50/50 px-8 py-6">
              <div>
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
                    <History size={19} />
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold text-[#0f172a]">
                      Stock History
                    </h2>
                    <p className="mt-1 text-sm text-slate-500">
                      {historyProduct.name}{" "}
                      ·{" "}
                      {historyProduct.product_code}
                    </p>
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={closeHistory}
                className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-500 transition-colors hover:bg-slate-50 hover:text-slate-700"
              >
                <X size={20} />
              </button>
            </div>

            {/* History */}
            <div className="max-h-[500px] overflow-y-auto">
              {historyLoading ? (
                <div className="flex min-h-[300px] flex-col items-center justify-center gap-3">
                  <Loader2
                    size={24}
                    className="animate-spin text-indigo-600"
                  />
                  <span className="text-sm font-medium text-slate-500">
                    Loading history...
                  </span>
                </div>
              ) : transactions.length === 0 ? (
                <div className="flex min-h-[300px] flex-col items-center justify-center p-8 text-center">
                  <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-50">
                    <History
                      size={24}
                      className="text-slate-400"
                    />
                  </div>
                  <h3 className="text-lg font-semibold text-[#0f172a]">
                    No stock history
                  </h3>
                  <p className="mt-1 text-sm text-slate-500">
                    No inventory transactions have been recorded for this product.
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead className="sticky top-0 border-b border-slate-100 bg-slate-50/90 backdrop-blur-md">
                      <tr>
                        <th className="px-8 py-4 font-mono text-[11px] font-semibold uppercase tracking-[0.15em] text-slate-500">
                          Date
                        </th>
                        <th className="px-6 py-4 font-mono text-[11px] font-semibold uppercase tracking-[0.15em] text-slate-500">
                          Type
                        </th>
                        <th className="px-6 py-4 font-mono text-[11px] font-semibold uppercase tracking-[0.15em] text-slate-500">
                          Quantity
                        </th>
                        <th className="px-6 py-4 font-mono text-[11px] font-semibold uppercase tracking-[0.15em] text-slate-500">
                          Note
                        </th>
                      </tr>
                    </thead>

                    <tbody className="divide-y divide-slate-100/60">
                      {transactions.map(
                        (transaction) => {
                          const isIncoming =
                            transaction.transaction_type ===
                              "ADJUSTMENT_IN" ||
                            transaction.transaction_type ===
                              "PURCHASE" ||
                            transaction.transaction_type ===
                              "SALE_RETURN" ||
                            transaction.transaction_type ===
                              "BUNDLE_ADJUSTMENT_IN";
                          const isStockAdjustment =
                            transaction.transaction_type === "ADJUSTMENT_IN" ||
                            transaction.transaction_type === "ADJUSTMENT_OUT";
                          const transactionLabel =
                            transaction.transaction_type === "ADJUSTMENT_IN"
                              ? "Stock Added"
                              : transaction.transaction_type === "ADJUSTMENT_OUT"
                                ? "Stock Removed"
                                : transaction.transaction_type ===
                                    "BUNDLE_ADJUSTMENT_IN"
                                  ? "Bundle Added"
                                  : transaction.transaction_type ===
                                      "BUNDLE_ADJUSTMENT_OUT"
                                    ? "Bundle Removed"
                                    : transaction.transaction_type.replace(
                                        /_/g,
                                        " ",
                                      );

                          return (
                            <tr
                              key={transaction.id}
                              className="transition-colors hover:bg-slate-50/50"
                            >
                              <td className="whitespace-nowrap px-8 py-4 text-sm text-slate-500">
                                {new Date(
                                  transaction.created_at,
                                ).toLocaleString(
                                  "en-IN",
                                  {
                                    dateStyle: "medium",
                                    timeStyle: "short",
                                  },
                                )}
                              </td>

                              <td className="px-6 py-4">
                                <span
                                  className={`inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-semibold ${
                                    isIncoming
                                      ? "bg-emerald-50 text-emerald-600"
                                      : "bg-red-50 text-red-600"
                                  }`}
                                >
                                  {isIncoming ? (
                                    <ArrowUp size={13} />
                                  ) : (
                                    <ArrowDown size={13} />
                                  )}
                                  {transactionLabel}
                                </span>
                              </td>

                              <td
                                className={`px-6 py-4 font-mono text-sm font-bold ${
                                  isIncoming
                                    ? "text-emerald-600"
                                    : "text-red-600"
                                }`}
                              >
                                {isIncoming
                                  ? "+"
                                  : "-"}
                                {transaction.quantity}
                                {isStockAdjustment &&
                                  ` ${historyProduct?.unit ?? ""}`}
                              </td>

                              <td className="px-6 py-4 text-sm text-slate-500">
                                {transaction.note || "-"}
                              </td>
                            </tr>
                          );
                        },
                      )}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="flex justify-end border-t border-slate-100 px-8 py-5">
              <button
                type="button"
                onClick={closeHistory}
                className="flex h-[44px] items-center justify-center rounded-xl bg-slate-50 px-6 text-sm font-semibold text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-900"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}