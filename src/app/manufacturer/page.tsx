"use client";

import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import {
  AlertTriangle,
  ArrowDownRight,
  ArrowRight,
  ArrowUpRight,
  Boxes,
  FileText,
  IndianRupee,
  Package,
  RefreshCw,
  ShoppingCart,
  Users,
  LayoutDashboard,
} from "lucide-react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import {
  getManufactureDashboard,
  type DashboardData,
} from "@/lib/api";

const cardVariants = {
  hidden: { opacity: 0, y: 18 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.45 },
  },
};

const chartTooltipStyle = {
  borderRadius: "12px",
  border: "1px solid #e2e8f0",
  boxShadow: "0 10px 30px rgba(15, 23, 42, 0.08)",
};

function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value);
}

function formatDate(date: string) {
  return new Date(date).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
  });
}

export default function ManufactureDashboardPage() {
  const router = useRouter();

  const [dashboard, setDashboard] =
    useState<DashboardData | null>(null);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  const loadDashboard = async () => {
    try {
      setLoading(true);
      setError("");

      const data =
        await getManufactureDashboard();

      setDashboard(data);
    } catch (err) {
      console.error(
        "Manufacture Dashboard error:",
        err,
      );

      setError(
        err instanceof Error
          ? err.message
          : "Unable to load dashboard",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboard();
  }, []);

  const inventoryData = useMemo(() => {
    if (!dashboard) return [];

    const healthy = Math.max(
      dashboard.summary.total_products -
        dashboard.summary.low_stock_count -
        dashboard.summary.out_of_stock_count,
      0,
    );

    return [
      {
        name: "Healthy",
        value: healthy,
      },
      {
        name: "Low Stock",
        value:
          dashboard.summary.low_stock_count,
      },
      {
        name: "Out of Stock",
        value:
          dashboard.summary.out_of_stock_count,
      },
    ];
  }, [dashboard]);

  const inventoryHealth = useMemo(() => {
    if (
      !dashboard ||
      dashboard.summary.total_products === 0
    ) {
      return 0;
    }

    const healthy = Math.max(
      dashboard.summary.total_products -
        dashboard.summary.low_stock_count -
        dashboard.summary.out_of_stock_count,
      0,
    );

    return Math.round(
      (healthy /
        dashboard.summary.total_products) *
        100,
    );
  }, [dashboard]);

  /*
  |--------------------------------------------------------------------------
  | Loading
  |--------------------------------------------------------------------------
  */

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 p-6 sm:p-8">
        <div className="mx-auto max-w-7xl animate-pulse space-y-6">
          <div className="h-24 rounded-2xl bg-white" />

          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {[1, 2, 3, 4].map((item) => (
              <div
                key={item}
                className="h-36 rounded-2xl bg-white"
              />
            ))}
          </div>

          <div className="h-[390px] rounded-2xl bg-white" />

          <div className="grid gap-6 lg:grid-cols-2">
            <div className="h-[360px] rounded-2xl bg-white" />
            <div className="h-[360px] rounded-2xl bg-white" />
          </div>
        </div>
      </div>
    );
  }

  /*
  |--------------------------------------------------------------------------
  | Error
  |--------------------------------------------------------------------------
  */

  if (error || !dashboard) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 p-6">
        <div className="w-full max-w-md rounded-2xl border border-red-100 bg-white p-8 text-center shadow-sm">
          <AlertTriangle className="mx-auto mb-4 h-10 w-10 text-red-500" />

          <h2 className="text-xl font-semibold text-slate-900">
            Dashboard unavailable
          </h2>

          <p className="mt-2 text-sm text-slate-500">
            {error ||
              "Unable to load dashboard data."}
          </p>

          <button
            onClick={loadDashboard}
            className="mt-6 inline-flex items-center gap-2 rounded-xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
          >
            <RefreshCw className="h-4 w-4" />
            Try Again
          </button>
        </div>
      </div>
    );
  }

  const { summary } = dashboard;

  return (
    <main className="min-h-screen">
      <div className="mx-auto max-w-7xl sm:p-8">

        {/* =====================================================
            HEADER
        ====================================================== */}

        <motion.header
          initial={{
            opacity: 0,
            y: -12,
          }}
          animate={{
            opacity: 1,
            y: 0,
          }}
          className="mb-7"
        >
          <div className="flex w-full items-center justify-between">

            <div className="flex items-center gap-4">
              <div>
                <h1 className="flex items-center gap-2 text-3xl font-mono tracking-tight text-[#5500ff]">
                  <LayoutDashboard size={36} />
                  Dashboard
                </h1>

                <p className="mt-1.5 inline-block rounded-3xl border bg-violet-100 px-5 py-1 text-sm text-slate-500">
                  View and monitor your Manufacturing ERP Dashboard
                </p>
              </div>
            </div>

            <button
              onClick={loadDashboard}
              className="group inline-flex h-11 items-center justify-center gap-2 rounded-3xl bg-indigo-950 px-4 text-sm font-semibold text-white backdrop-blur-sm transition-all duration-300 ease-out hover:scale-[1.02] hover:shadow-2xl"
            >
              Refresh

              <RefreshCw className="h-4 w-4 transition-transform duration-500 ease-in-out group-hover:rotate-180" />
            </button>

          </div>
        </motion.header>

        {/* =====================================================
            KPI CARDS
        ====================================================== */}

        <motion.section
          initial="hidden"
          animate="show"
          className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4"
        >
          {[
            {
              label: "Today's Sales",
              value: formatCurrency(
                summary.today_sales,
              ),
              icon: IndianRupee,
              iconClass:
                "bg-emerald-50 text-emerald-600 group-hover:bg-emerald-100/70 group-hover:text-emerald-700 group-hover-shadow-lg",
              badge: "Today",
              badgeClass:
                "text-emerald-600 bg-emerald-50",
              arrow: ArrowUpRight,
            },

            {
              label: "Today's Invoices",
              value:
                summary.today_invoice_count.toLocaleString(
                  "en-IN",
                ),
              icon: FileText,
              iconClass:
                "bg-blue-50 text-blue-600 group-hover:bg-blue-100/70 group-hover:text-blue-700 group-hover-shadow-lg",
              badge: "Billing",
              badgeClass:
                "text-blue-600 bg-blue-50",
            },

            {
              label: "Total Customers",
              value:
                summary.total_customers.toLocaleString(
                  "en-IN",
                ),
              icon: Users,
              iconClass:
                "bg-violet-50 text-violet-600 group-hover:bg-violet-100/80 group-hover:text-violet-700 group-hover-shadow-lg",
              badge: "Customers",
              badgeClass:
                "text-violet-600 bg-violet-50",
            },

            {
              label: "Low Stock",
              value:
                summary.low_stock_count.toLocaleString(
                  "en-IN",
                ),
              icon: AlertTriangle,
              iconClass:
                "bg-amber-50 text-amber-600 group-hover:bg-amber-100/70 group-hover:text-amber-700 group-hover-shadow-lg",
              badge:
                summary.low_stock_count > 0
                  ? "Attention"
                  : "All clear",
              badgeClass:
                summary.low_stock_count > 0
                  ? "text-amber-600 bg-amber-50"
                  : "text-emerald-600 bg-emerald-50",
            },
          ].map((card) => {
            const Icon = card.icon;
            const Arrow = card.arrow;

            return (
              <motion.div
                key={card.label}
                variants={cardVariants}
                className="group rounded-xl border border-slate-200 bg-white p-5 shadow-md transition hover:-translate-y-0.5 hover:shadow-lg"
              >
                <div className="flex items-start justify-between">

                  <div
                    className={`flex h-11 w-11 items-center justify-center rounded-xl ${card.iconClass}`}
                  >
                    <Icon className="h-5 w-5" />
                  </div>

                  <span
                    className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide ${card.badgeClass}`}
                  >
                    {Arrow && (
                      <Arrow className="h-3 w-3" />
                    )}

                    {card.badge}
                  </span>

                </div>

                <p className="mt-5 text-md text-slate-500 group-hover:text-slate-800">
                  {card.label}
                </p>

                <p className="mt-1 text-2xl font-bold tracking-tight text-slate-900/70">
                  {card.value}
                </p>
              </motion.div>
            );
          })}
        </motion.section>

        {/* =====================================================
            QUICK ACTIONS
        ====================================================== */}

        <motion.section
          initial={{
            opacity: 0,
            y: 18,
          }}
          animate={{
            opacity: 1,
            y: 0,
          }}
          transition={{
            delay: 0.15,
          }}
          className="mt-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
        >
          <div className="mb-4">
            <h2 className="text-base font-semibold text-slate-900">
              Quick Actions
            </h2>

            <p className="mt-1 text-xs text-slate-500">
              Jump directly into common manufacturing operations.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {[
              {
                label: "New Invoice",
                icon: FileText,
                path: "/manufacturer/invoices/create",
              },
              {
                label: "Add Customer",
                icon: Users,
                path: "/manufacturer/customer/create",
              },
              {
                label: "Add Product",
                icon: Package,
                path: "/manufacturer/inventory/create",
              },
              {
                label: "Inventory",
                icon: Boxes,
                path: "/manufacturer/inventory",
              },
            ].map((action) => {
              const Icon = action.icon;

              return (
                <button
                  key={action.label}
                  onClick={() =>
                    router.push(action.path)
                  }
                  className="group flex items-center gap-3 rounded-xl border-slate-200 bg-slate-50 p-3 text-left transition hover:border-indigo-200 hover:bg-indigo-50/50"
                >
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-slate-200 text-slate-600 transition group-hover:bg-indigo-100 group-hover:text-indigo-600">
                    <Icon className="h-4 w-4" />
                  </div>

                  <span className="text-xs font-semibold text-slate-700">
                    {action.label}
                  </span>

                  <ArrowRight className="ml-auto h-3.5 w-3.5 text-slate-600 transition group-hover:translate-x-0.5 group-hover:text-indigo-500" />
                </button>
              );
            })}
          </div>
        </motion.section>

        {/* =====================================================
            SALES OVERVIEW
        ====================================================== */}

        <motion.section
          initial={{
            opacity: 0,
            y: 18,
          }}
          animate={{
            opacity: 1,
            y: 0,
          }}
          transition={{
            delay: 0.2,
          }}
          className="mt-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6"
        >
          <div className="mb-5 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-slate-900">
                Sales Overview
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Sales performance over the last 7 days.
              </p>
            </div>

            <span className="rounded-lg bg-indigo-50 px-3 py-1.5 text-[10px] font-bold tracking-wider text-indigo-600">
              7 DAYS
            </span>
          </div>

          <div className="h-[320px]">
            {dashboard.sales_trend.length ===
            0 ? (
              <div className="flex h-full items-center justify-center text-sm text-slate-400">
                No sales data available.
              </div>
            ) : (
              <ResponsiveContainer
                width="100%"
                height="100%"
              >
                <AreaChart
                  data={dashboard.sales_trend}
                  margin={{
                    top: 10,
                    right: 10,
                    left: 0,
                    bottom: 5,
                  }}
                >
                  <defs>
                    <linearGradient
                      id="manufactureSalesFill"
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="1"
                    >
                      <stop
                        offset="0%"
                        stopColor="#6366f1"
                        stopOpacity={0.25}
                      />
                      <stop
                        offset="100%"
                        stopColor="#6366f1"
                        stopOpacity={0.02}
                      />
                    </linearGradient>
                  </defs>

                  <CartesianGrid
                    strokeDasharray="3 3"
                    vertical={false}
                    stroke="#e2e8f0"
                  />

                  <XAxis
                    dataKey="date"
                    tickFormatter={formatDate}
                    tickLine={false}
                    axisLine={false}
                    fontSize={12}
                    tick={{
                      fill: "#64748b",
                    }}
                  />

                  <YAxis
                    tickLine={false}
                    axisLine={false}
                    fontSize={12}
                    tick={{
                      fill: "#64748b",
                    }}
                    tickFormatter={(value) =>
                      `₹${Number(
                        value,
                      ).toLocaleString("en-IN")}`
                    }
                  />

                  <Tooltip
                    contentStyle={
                      chartTooltipStyle
                    }
                    formatter={(value) => [
                      formatCurrency(
                        Number(value),
                      ),
                      "Sales",
                    ]}
                    labelFormatter={(label) =>
                      new Date(
                        String(label),
                      ).toLocaleDateString(
                        "en-IN",
                        {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        },
                      )
                    }
                  />

                  <Area
                    type="monotone"
                    dataKey="sales"
                    stroke="#4f46e5"
                    strokeWidth={3}
                    fill="url(#manufactureSalesFill)"
                    activeDot={{
                      r: 6,
                    }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>
        </motion.section>

        {/* =====================================================
            TOP PRODUCTS + INVENTORY
        ====================================================== */}

        <div className="mt-6 grid gap-6 lg:grid-cols-2">

          {/* Top Products */}

          <motion.section
            initial={{
              opacity: 0,
              y: 18,
            }}
            animate={{
              opacity: 1,
              y: 0,
            }}
            transition={{
              delay: 0.3,
            }}
            className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6"
          >
            <div className="mb-5 flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold text-slate-900">
                  Top Products
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  Best-selling products by quantity.
                </p>
              </div>

              <ShoppingCart className="h-5 w-5 text-indigo-500" />
            </div>

            <div className="h-[300px]">
              {dashboard.top_products.length ===
              0 ? (
                <div className="flex h-full items-center justify-center text-sm text-slate-400">
                  No product sales available.
                </div>
              ) : (
                <ResponsiveContainer
                  width="100%"
                  height="100%"
                >
                  <BarChart
                    data={dashboard.top_products}
                    layout="vertical"
                    margin={{
                      top: 5,
                      right: 10,
                      left: 20,
                      bottom: 5,
                    }}
                  >
                    <CartesianGrid
                      strokeDasharray="3 3"
                      horizontal={false}
                      stroke="#e2e8f0"
                    />

                    <XAxis
                      type="number"
                      tickLine={false}
                      axisLine={false}
                      fontSize={11}
                    />

                    <YAxis
                      type="category"
                      dataKey="name"
                      width={105}
                      tickLine={false}
                      axisLine={false}
                      fontSize={11}
                    />

                    <Tooltip
                      contentStyle={
                        chartTooltipStyle
                      }
                      formatter={(value) => [
                        value,
                        "Units Sold",
                      ]}
                    />

                    <Bar
                      dataKey="quantity_sold"
                      fill="#6366f1"
                      radius={[
                        0,
                        7,
                        7,
                        0,
                      ]}
                      barSize={20}
                    />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
          </motion.section>

          {/* Inventory Health */}

          <motion.section
            initial={{
              opacity: 0,
              y: 18,
            }}
            animate={{
              opacity: 1,
              y: 0,
            }}
            transition={{
              delay: 0.4,
            }}
            className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6"
          >
            <div className="mb-2">
              <h2 className="text-lg font-semibold text-slate-900">
                Inventory Health
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Current product availability.
              </p>
            </div>

            <div className="relative h-[245px]">
              {summary.total_products ===
              0 ? (
                <div className="flex h-full items-center justify-center text-sm text-slate-400">
                  No inventory available.
                </div>
              ) : (
                <>
                  <ResponsiveContainer
                    width="100%"
                    height="100%"
                  >
                    <PieChart>
                      <Pie
                        data={inventoryData}
                        dataKey="value"
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        innerRadius={72}
                        outerRadius={101}
                        paddingAngle={4}
                        stroke="none"
                      >
                        <Cell fill="#10b981" />
                        <Cell fill="#f59e0b" />
                        <Cell fill="#ef4444" />
                      </Pie>

                      <Tooltip
                        contentStyle={
                          chartTooltipStyle
                        }
                      />
                    </PieChart>
                  </ResponsiveContainer>

                  <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-3xl font-bold text-slate-900">
                      {inventoryHealth}%
                    </span>

                    <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                      Healthy
                    </span>
                  </div>
                </>
              )}
            </div>

            <div className="grid grid-cols-3 gap-3">
              {[
                {
                  label: "Healthy",
                  value: Math.max(
                    summary.total_products -
                      summary.low_stock_count -
                      summary.out_of_stock_count,
                    0,
                  ),
                  dot: "bg-emerald-500",
                },
                {
                  label: "Low Stock",
                  value:
                    summary.low_stock_count,
                  dot: "bg-amber-500",
                },
                {
                  label: "Out",
                  value:
                    summary.out_of_stock_count,
                  dot: "bg-red-500",
                },
              ].map((item) => (
                <div
                  key={item.label}
                  className="rounded-xl bg-slate-50 p-3 text-center"
                >
                  <div
                    className={`mx-auto mb-1.5 h-2 w-2 rounded-full ${item.dot}`}
                  />

                  <p className="text-xs text-slate-500">
                    {item.label}
                  </p>

                  <p className="mt-0.5 text-sm font-bold text-slate-900">
                    {item.value}
                  </p>
                </div>
              ))}
            </div>
          </motion.section>
        </div>

        {/* =====================================================
            RECENT INVOICES + STOCK ALERTS
        ====================================================== */}

        <div className="mt-6 grid gap-6 lg:grid-cols-2">

          {/* Recent Invoices */}

          <motion.section
            initial={{
              opacity: 0,
              y: 18,
            }}
            animate={{
              opacity: 1,
              y: 0,
            }}
            transition={{
              delay: 0.5,
            }}
            className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6"
          >
            <div className="mb-5 flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold text-slate-900">
                  Recent Invoices
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  Latest manufacturing billing activity.
                </p>
              </div>

              <FileText className="h-5 w-5 text-slate-400" />
            </div>

            <div className="space-y-3">
              {dashboard.recent_invoices.length ===
              0 ? (
                <div className="py-10 text-center">
                  <FileText className="mx-auto h-8 w-8 text-slate-300" />

                  <p className="mt-3 text-sm text-slate-400">
                    No invoices found.
                  </p>
                </div>
              ) : (
                dashboard.recent_invoices.map(
                  (invoice) => (
                    <button
                      key={invoice.id}
                      onClick={() =>
                        router.push(
                          `/manufacturer/invoices/${invoice.id}`,
                        )
                      }
                      className="flex w-full items-center justify-between rounded-xl border border-slate-100 p-4 text-left transition hover:border-indigo-100 hover:bg-indigo-50/30"
                    >
                      <div className="flex min-w-0 items-center gap-3">

                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600">
                          <FileText className="h-4 w-4" />
                        </div>

                        <div className="min-w-0">
                          <p className="font-mono text-xs font-bold text-indigo-600">
                            {invoice.invoice_number}
                          </p>

                          <p className="mt-1 truncate text-sm font-semibold text-slate-900">
                            {invoice.customer_name}
                          </p>

                          <p className="mt-1 text-xs text-slate-400">
                            {formatDate(
                              invoice.invoice_date,
                            )}
                          </p>
                        </div>

                      </div>

                      <div className="ml-3 flex items-center gap-3">
                        <p className="whitespace-nowrap text-sm font-bold text-slate-900">
                          {formatCurrency(
                            invoice.grand_total,
                          )}
                        </p>

                        <ArrowRight className="h-4 w-4 text-slate-300" />
                      </div>
                    </button>
                  ),
                )
              )}
            </div>
          </motion.section>

          {/* Stock Alerts */}

          <motion.section
            initial={{
              opacity: 0,
              y: 18,
            }}
            animate={{
              opacity: 1,
              y: 0,
            }}
            transition={{
              delay: 0.6,
            }}
            className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6"
          >
            <div className="mb-5 flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold text-slate-900">
                  Stock Alerts
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  Products requiring attention.
                </p>
              </div>

              <AlertTriangle className="h-5 w-5 text-amber-500" />
            </div>

            <div className="space-y-3">
              {dashboard.low_stock_products.length ===
              0 ? (
                <div className="flex flex-col items-center py-10 text-center">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-50">
                    <Boxes className="h-6 w-6 text-emerald-500" />
                  </div>

                  <p className="mt-3 text-sm font-semibold text-slate-900">
                    Inventory looks good
                  </p>

                  <p className="mt-1 text-xs text-slate-400">
                    No products are currently low on stock.
                  </p>
                </div>
              ) : (
                dashboard.low_stock_products.map(
                  (product) => {
                    const outOfStock =
                      product.quantity === 0;

                    return (
                      <div
                        key={product.id}
                        className={`flex items-center justify-between rounded-xl border p-4 ${
                          outOfStock
                            ? "border-red-100 bg-red-50/40"
                            : "border-amber-100 bg-amber-50/30"
                        }`}
                      >
                        <div className="flex min-w-0 items-center gap-3">

                          <div
                            className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${
                              outOfStock
                                ? "bg-red-100 text-red-600"
                                : "bg-amber-100 text-amber-600"
                            }`}
                          >
                            <Package className="h-4 w-4" />
                          </div>

                          <div className="min-w-0">
                            <p className="truncate text-sm font-semibold text-slate-900">
                              {product.name}
                            </p>

                            <p className="mt-1 font-mono text-[10px] text-slate-400">
                              {product.product_code}
                            </p>
                          </div>

                        </div>

                        <div className="ml-3 text-right">
                          <p
                            className={`text-sm font-bold ${
                              outOfStock
                                ? "text-red-600"
                                : "text-amber-600"
                            }`}
                          >
                            {product.quantity}
                          </p>

                          <p className="text-[10px] uppercase text-slate-400">
                            {product.unit}
                          </p>
                        </div>
                      </div>
                    );
                  },
                )
              )}
            </div>
          </motion.section>
        </div>

        {/* =====================================================
            FOOTER STATS
        ====================================================== */}

        <motion.div
          initial={{
            opacity: 0,
            y: 18,
          }}
          animate={{
            opacity: 1,
            y: 0,
          }}
          transition={{
            delay: 0.7,
          }}
          className="mt-6 grid gap-4 sm:grid-cols-2"
        >
          <div className="flex items-center justify-between rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center gap-3">

              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
                <ShoppingCart className="h-5 w-5" />
              </div>

              <div>
                <p className="text-xs text-slate-500">
                  Total Stock
                </p>

                <p className="mt-0.5 text-lg font-semibold text-slate-900">
                  {summary.total_stock.toLocaleString(
                    "en-IN",
                  )}{" "}
                  units
                </p>
              </div>

            </div>

            <ArrowUpRight className="h-4 w-4 text-emerald-500" />
          </div>

          <div className="flex items-center justify-between rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center gap-3">

              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-50 text-red-600">
                <Package className="h-5 w-5" />
              </div>

              <div>
                <p className="text-xs text-slate-500">
                  Out of Stock
                </p>

                <p className="mt-0.5 text-lg font-semibold text-slate-900">
                  {summary.out_of_stock_count}{" "}
                  products
                </p>
              </div>

            </div>

            <ArrowDownRight className="h-4 w-4 text-red-500" />
          </div>
        </motion.div>

      </div>
    </main>
  );
}