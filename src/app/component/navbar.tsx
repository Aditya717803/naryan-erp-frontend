"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Menu,
  Search,
  MapPin,
  Bell,
  ChevronDown,
  Check,
  X,
  Loader2,
  Trash2,
} from "lucide-react";
import { usePathname, useRouter } from "next/navigation";

import {
  getNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  deleteNotification,
  deleteAllNotifications,
} from "@/lib/api";

import type { Notification } from "@/types/notification";

interface NavbarProps {
  onMenuClick: () => void;
  locationName?: string;
}

// ---------------------------------------------------------
// Page titles
// ---------------------------------------------------------

const PAGE_TITLES: Record<string, string> = {
  "/store": "Store Dashboard",
  "/store/invoices": "Store Invoices",
  "/store/inventory": "Store Inventory",
  "/store/customer": "Store Customers Page",
  "/store/settings": "Settings",
};

// ---------------------------------------------------------
// Locations
// ---------------------------------------------------------

const LOCATIONS = [
  "E 2-200 Sector",
  "Rewara Paraspur",
];

// ---------------------------------------------------------
// Search items
// ---------------------------------------------------------

const SEARCH_ITEMS = [
  // =========================
  // QUICK ACTIONS
  // =========================

  {
    title: "Add Customer",
    description: "Create a new customer",
    keywords: [
      "add customer",
      "new customer",
      "create customer",
      "customer",
      "client",
    ],
    path: "/store/customer/create",
    category: "Quick Actions",
  },

  {
    title: "Create Invoice",
    description: "Create a new sales invoice",
    keywords: [
      "create invoice",
      "new invoice",
      "invoice",
      "bill",
      "billing",
    ],
    path: "/store/invoices/create",
    category: "Quick Actions",
  },

  {
    title: "Add Product",
    description: "Add a new product to inventory",
    keywords: [
      "add product",
      "new product",
      "create product",
      "product",
      "item",
    ],
    path: "/store/inventory/create",
    category: "Quick Actions",
  },

  // =========================
  // PAGES
  // =========================

  {
    title: "Dashboard",
    description: "View your ERP dashboard",
    keywords: [
      "dashboard",
      "home",
      "main",
    ],
    path: "/store",
    category: "Pages",
  },

  {
    title: "Invoices",
    description: "View and manage invoices",
    keywords: [
      "invoices",
      "invoice list",
      "bills",
      "billing",
    ],
    path: "/store/invoices",
    category: "Pages",
  },

  {
    title: "Customers",
    description: "Manage customers and customer details",
    keywords: [
      "customers",
      "customer list",
      "clients",
    ],
    path: "/store/customer",
    category: "Pages",
  },

  {
    title: "Inventory",
    description: "Manage products and stock",
    keywords: [
      "inventory",
      "stock",
      "products",
      "items",
    ],
    path: "/store/inventory",
    category: "Pages",
  },

];

export default function Navbar({
  onMenuClick,
  locationName = "E 2-200 Sector A",
}: NavbarProps) {
  const pathname = usePathname();
  const router = useRouter();

  // ---------------------------------------------------------
  // General state
  // ---------------------------------------------------------

  const [scrolled, setScrolled] = useState(false);

  const [mobileSearchOpen, setMobileSearchOpen] =
    useState(false);

  const [locationOpen, setLocationOpen] =
    useState(false);

  const [notifOpen, setNotifOpen] =
    useState(false);

  const [activeLocation, setActiveLocation] =
    useState(locationName);

  // ---------------------------------------------------------
  // Search state
  // ---------------------------------------------------------

  const [searchQuery, setSearchQuery] =
    useState("");

  // ---------------------------------------------------------
  // Notifications
  // ---------------------------------------------------------

  const [notifications, setNotifications] =
    useState<Notification[]>([]);

  const [notificationsLoading, setNotificationsLoading] =
    useState(false);

  const [notificationActionLoading, setNotificationActionLoading] =
    useState<number | null>(null);

  const [clearingAll, setClearingAll] =
    useState(false);

  // ---------------------------------------------------------
  // Refs
  // ---------------------------------------------------------

  const locationRef =
    useRef<HTMLDivElement>(null);

  const notifRef =
    useRef<HTMLDivElement>(null);

  const searchRef =
    useRef<HTMLDivElement>(null);

  // ---------------------------------------------------------
  // Page title
  // ---------------------------------------------------------

  const activeTitle =
    PAGE_TITLES[pathname] || "Page";

  // ---------------------------------------------------------
  // Search results
  // ---------------------------------------------------------

  const searchResults = SEARCH_ITEMS.filter((item) => {
    const query = searchQuery.trim().toLowerCase();

    if (!query) {
      return false;
    }

    return (
      item.title.toLowerCase().includes(query) ||
      item.description.toLowerCase().includes(query) ||
      item.keywords.some((keyword) =>
        keyword.toLowerCase().includes(query)
      )
    );
  });

  // ---------------------------------------------------------
  // Search select
  // ---------------------------------------------------------

  const handleSearchSelect = (path: string) => {
    setSearchQuery("");
    setMobileSearchOpen(false);

    router.push(path);
  };

  // ---------------------------------------------------------
  // Unread notification count
  // ---------------------------------------------------------

  const unreadCount =
    notifications.filter(
      (notification) => !notification.is_read,
    ).length;

  // ---------------------------------------------------------
  // Load notifications
  // ---------------------------------------------------------

  async function loadNotifications() {
    try {
      setNotificationsLoading(true);

      const data = await getNotifications();

      setNotifications(data);
    } catch (error) {
      console.error(
        "Failed to load notifications:",
        error,
      );
    } finally {
      setNotificationsLoading(false);
    }
  }

  useEffect(() => {
    loadNotifications();
  }, []);

  // ---------------------------------------------------------
  // Mark notification as read
  // ---------------------------------------------------------

  async function handleNotificationClick(
    notification: Notification,
  ) {
    if (notification.is_read) {
      return;
    }

    try {
      setNotificationActionLoading(
        notification.id,
      );

      const updated =
        await markNotificationAsRead(
          notification.id,
        );

      setNotifications((previous) =>
        previous.map((item) =>
          item.id === updated.id
            ? updated
            : item,
        ),
      );
    } catch (error) {
      console.error(
        "Failed to mark notification as read:",
        error,
      );
    } finally {
      setNotificationActionLoading(null);
    }
  }

  // ---------------------------------------------------------
  // Delete notification
  // ---------------------------------------------------------

  async function handleDeleteNotification(
    notificationId: number,
  ) {
    try {
      setNotificationActionLoading(
        notificationId,
      );

      await deleteNotification(
        notificationId,
      );

      setNotifications((previous) =>
        previous.filter(
          (notification) =>
            notification.id !== notificationId,
        ),
      );
    } catch (error) {
      console.error(
        "Failed to delete notification:",
        error,
      );
    } finally {
      setNotificationActionLoading(null);
    }
  }

  // ---------------------------------------------------------
  // Mark all as read
  // ---------------------------------------------------------

  async function handleMarkAllAsRead() {
    if (unreadCount === 0) {
      return;
    }

    try {
      setClearingAll(true);

      await markAllNotificationsAsRead();

      setNotifications((previous) =>
        previous.map((notification) => ({
          ...notification,
          is_read: true,
        })),
      );
    } catch (error) {
      console.error(
        "Failed to mark all notifications as read:",
        error,
      );
    } finally {
      setClearingAll(false);
    }
  }

  // ---------------------------------------------------------
  // Delete all notifications
  // ---------------------------------------------------------

  async function handleDeleteAllNotifications() {
    if (notifications.length === 0) {
      return;
    }

    try {
      setClearingAll(true);

      await deleteAllNotifications();

      setNotifications([]);
    } catch (error) {
      console.error(
        "Failed to clear notifications:",
        error,
      );
    } finally {
      setClearingAll(false);
    }
  }

  // ---------------------------------------------------------
  // Format notification time
  // ---------------------------------------------------------

  function formatNotificationTime(
    dateString: string,
  ): string {
    const date = new Date(dateString);

    const now = new Date();

    const difference =
      now.getTime() - date.getTime();

    const seconds =
      Math.floor(difference / 1000);

    const minutes =
      Math.floor(seconds / 60);

    const hours =
      Math.floor(minutes / 60);

    const days =
      Math.floor(hours / 24);

    if (seconds < 60) {
      return "Just now";
    }

    if (minutes < 60) {
      return `${minutes}m ago`;
    }

    if (hours < 24) {
      return `${hours}h ago`;
    }

    if (days === 1) {
      return "Yesterday";
    }

    if (days < 7) {
      return `${days}d ago`;
    }

    return date.toLocaleDateString(
      "en-IN",
      {
        day: "numeric",
        month: "short",
        year: "numeric",
      },
    );
  }

  // ---------------------------------------------------------
  // Shadow on scroll
  // ---------------------------------------------------------

  useEffect(() => {
    const onScroll = () =>
      setScrolled(window.scrollY > 4);

    onScroll();

    window.addEventListener(
      "scroll",
      onScroll,
    );

    return () =>
      window.removeEventListener(
        "scroll",
        onScroll,
      );
  }, []);

  // ---------------------------------------------------------
  // Close popovers on outside click
  // ---------------------------------------------------------

  useEffect(() => {
    const onClick = (event: MouseEvent) => {
      const target =
        event.target as Node;

      if (
        locationRef.current &&
        !locationRef.current.contains(target)
      ) {
        setLocationOpen(false);
      }

      if (
        notifRef.current &&
        !notifRef.current.contains(target)
      ) {
        setNotifOpen(false);
      }

      if (
        searchRef.current &&
        !searchRef.current.contains(target)
      ) {
        setSearchQuery("");
      }
    };

    document.addEventListener(
      "mousedown",
      onClick,
    );

    return () =>
      document.removeEventListener(
        "mousedown",
        onClick,
      );
  }, []);

  // ---------------------------------------------------------
  // Render
  // ---------------------------------------------------------

  return (
    <header
      className={`sticky top-0 z-30 flex h-20 items-center justify-between border-b bg-white/80 px-6 backdrop-blur-md transition-shadow sm:px-10 ${
        scrolled
          ? "border-slate-200 shadow-sm"
          : "border-transparent"
      }`}
    >
      {/* =====================================================
          LEFT
      ====================================================== */}

      <div className="flex items-center gap-4">

        {/* Mobile Menu */}

        <button
          type="button"
          onClick={onMenuClick}
          className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 text-slate-500 transition-colors hover:bg-slate-50 hover:text-slate-900 lg:hidden"
          aria-label="Open menu"
        >
          <Menu className="h-5 w-5" />
        </button>

        {/* Page Title */}

        <div className="flex flex-col">
          <h1 className="text-xl font-mono capitalize tracking-tight text-indigo-700 sm:text-2xl">
            {activeTitle}
          </h1>

          <span className="hidden font-mono text-[10px] uppercase tracking-[0.2em] text-slate-400 sm:block">
            Narayan Aluminium · {activeLocation}
          </span>
        </div>
      </div>

      {/* =====================================================
          RIGHT
      ====================================================== */}

      <div className="flex items-center gap-2 sm:gap-4">

        {/* =================================================
            DESKTOP SEARCH
        ================================================= */}

        <div
          ref={searchRef}
          className="relative hidden md:block"
        >
          <Search className="pointer-events-none absolute left-3 top-1/2 z-10 h-4 w-4 -translate-y-1/2 text-slate-400" />

          <input
            type="text"
            value={searchQuery}
            onChange={(e) =>
              setSearchQuery(e.target.value)
            }
            placeholder="Search invoices, items, customers..."
            className="h-10 w-56 rounded-full border border-slate-200 bg-slate-50 pl-10 pr-4 text-sm text-slate-900 outline-none transition-all placeholder:text-slate-400 focus:w-72 focus:border-indigo-600 focus:bg-white focus:ring-1 focus:ring-indigo-600 lg:w-64"
          />

          {/* Search Dropdown */}

          <AnimatePresence>
            {searchQuery.trim() && (
              <motion.div
                initial={{
                  opacity: 0,
                  y: -5,
                  scale: 0.98,
                }}
                animate={{
                  opacity: 1,
                  y: 0,
                  scale: 1,
                }}
                exit={{
                  opacity: 0,
                  y: -5,
                  scale: 0.98,
                }}
                transition={{
                  duration: 0.15,
                }}
                className="absolute right-0 top-12 z-50 w-80 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl"
              >
                {searchResults.length > 0 ? (
                  <div className="p-2">

                    <p className="px-3 py-2 text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">
                      Search Results
                    </p>

                    {searchResults.map((item) => (
                      <button
                        key={item.path}
                        type="button"
                        onClick={() =>
                          handleSearchSelect(
                            item.path,
                          )
                        }
                        className="flex w-full items-start gap-3 rounded-xl px-3 py-3 text-left transition-colors hover:bg-indigo-50"
                      >
                        <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600">
                          <Search className="h-4 w-4" />
                        </div>

                        <div className="min-w-0">
                          <p className="text-sm font-semibold text-slate-800">
                            {item.title}
                          </p>

                          <p className="mt-0.5 text-xs text-slate-400">
                            {item.description}
                          </p>
                        </div>
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className="px-5 py-8 text-center">
                    <Search className="mx-auto h-5 w-5 text-slate-300" />

                    <p className="mt-2 text-sm font-semibold text-slate-600">
                      No results found
                    </p>

                    <p className="mt-1 text-xs text-slate-400">
                      Try another search term
                    </p>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* =================================================
            MOBILE SEARCH BUTTON
        ================================================= */}

        <button
          type="button"
          onClick={() =>
            setMobileSearchOpen(true)
          }
          className="flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 text-slate-500 transition-colors hover:bg-slate-50 hover:text-indigo-600 md:hidden"
          aria-label="Search"
        >
          <Search className="h-4.5 w-4.5" />
        </button>

        {/* =================================================
            LOCATION
        ================================================= */}

        <div
          className="relative hidden sm:block"
          ref={locationRef}
        >
          <button
            type="button"
            onClick={() =>
              setLocationOpen(
                (value) => !value,
              )
            }
            className={`flex h-10 items-center gap-2 rounded-full border pl-1.5 pr-3 transition-colors ${
              locationOpen
                ? "border-indigo-600 bg-indigo-50/50"
                : "border-slate-200 bg-white hover:bg-slate-50"
            }`}
          >
            <div className="flex h-7 w-7 items-center justify-center rounded-full bg-indigo-50">
              <MapPin className="h-3.5 w-3.5 text-indigo-600" />
            </div>

            <span className="font-mono text-[10px] font-bold uppercase tracking-widest text-slate-600">
              {activeLocation}
            </span>

            <ChevronDown
              className={`h-3.5 w-3.5 text-slate-400 transition-transform ${
                locationOpen
                  ? "rotate-180"
                  : ""
              }`}
            />
          </button>

          <AnimatePresence>
            {locationOpen && (
              <motion.div
                initial={{
                  opacity: 0,
                  y: -6,
                  scale: 0.97,
                }}
                animate={{
                  opacity: 1,
                  y: 0,
                  scale: 1,
                }}
                exit={{
                  opacity: 0,
                  y: -6,
                  scale: 0.97,
                }}
                transition={{
                  duration: 0.15,
                }}
                className="absolute right-0 top-12 w-52 overflow-hidden rounded-xl border border-slate-100 bg-white p-1.5 shadow-xl"
              >
                <p className="px-3 pb-1.5 pt-1 font-mono text-[10px] uppercase tracking-[0.2em] text-slate-400">
                  Switch location
                </p>

                {LOCATIONS.map((loc) => (
                  <button
                    key={loc}
                    type="button"
                    onClick={() => {
                      setActiveLocation(loc);
                      setLocationOpen(false);
                    }}
                    className="flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-sm font-medium text-slate-600 transition-colors hover:bg-slate-50 hover:text-slate-900"
                  >
                    {loc}

                    {loc === activeLocation && (
                      <Check className="h-4 w-4 text-indigo-600" />
                    )}
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="hidden h-6 w-px bg-slate-200 sm:block" />

        {/* =================================================
            NOTIFICATIONS
        ================================================= */}

        <div
          className="relative"
          ref={notifRef}
        >
          <button
            type="button"
            onClick={() => {
              setNotifOpen(
                (value) => !value,
              );

              if (!notifOpen) {
                loadNotifications();
              }
            }}
            className={`relative flex h-10 w-10 items-center justify-center rounded-full border transition-colors ${
              notifOpen
                ? "border-indigo-600 bg-indigo-50/50 text-indigo-600"
                : "border-slate-200 text-slate-500 hover:bg-slate-50 hover:text-indigo-600"
            }`}
            aria-label="Notifications"
          >
            <Bell className="h-5 w-5" />

            {unreadCount > 0 && (
              <span className="absolute right-2 top-2 flex h-2 w-2 rounded-full bg-indigo-600 ring-2 ring-white" />
            )}
          </button>

          <AnimatePresence>
            {notifOpen && (
              <motion.div
                initial={{
                  opacity: 0,
                  y: -6,
                  scale: 0.97,
                }}
                animate={{
                  opacity: 1,
                  y: 0,
                  scale: 1,
                }}
                exit={{
                  opacity: 0,
                  y: -6,
                  scale: 0.97,
                }}
                transition={{
                  duration: 0.15,
                }}
                className="absolute right-0 top-12 w-[360px] overflow-hidden rounded-xl border border-slate-100 bg-white shadow-xl"
              >
                {/* Header */}

                <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-slate-900">
                      Notifications
                    </span>

                    {unreadCount > 0 && (
                      <span className="rounded-full bg-indigo-50 px-2 py-0.5 font-mono text-[10px] font-bold text-indigo-600">
                        {unreadCount} new
                      </span>
                    )}
                  </div>

                  {notifications.length > 0 && (
                    <div className="flex items-center gap-2">
                      {unreadCount > 0 && (
                        <button
                          type="button"
                          onClick={
                            handleMarkAllAsRead
                          }
                          disabled={
                            clearingAll
                          }
                          className="text-[11px] font-semibold text-slate-500 transition-colors hover:text-indigo-600 disabled:opacity-50"
                        >
                          Mark all read
                        </button>
                      )}

                      <button
                        type="button"
                        onClick={
                          handleDeleteAllNotifications
                        }
                        disabled={
                          clearingAll
                        }
                        className="text-[11px] font-semibold text-red-500 transition-colors hover:text-red-600 disabled:opacity-50"
                      >
                        Clear all
                      </button>
                    </div>
                  )}
                </div>

                {/* Notification List */}

                <div className="max-h-80 overflow-y-auto">
                  {notificationsLoading ? (
                    <div className="flex min-h-[160px] items-center justify-center">
                      <Loader2
                        className="animate-spin text-indigo-600"
                        size={20}
                      />
                    </div>
                  ) : notifications.length === 0 ? (
                    <div className="flex min-h-[180px] flex-col items-center justify-center px-6 text-center">
                      <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-slate-50">
                        <Bell
                          size={20}
                          className="text-slate-400"
                        />
                      </div>

                      <p className="text-sm font-semibold text-slate-700">
                        No notifications
                      </p>

                      <p className="mt-1 text-xs text-slate-400">
                        You're all caught up.
                      </p>
                    </div>
                  ) : (
                    notifications.map(
                      (notification) => (
                        <div
                          key={notification.id}
                          className={`group flex items-start gap-3 border-b border-slate-50 px-4 py-3 transition-colors last:border-0 hover:bg-slate-50 ${
                            !notification.is_read
                              ? "bg-indigo-50/20"
                              : ""
                          }`}
                        >
                          {/* Unread */}

                          <button
                            type="button"
                            onClick={() =>
                              handleNotificationClick(
                                notification,
                              )
                            }
                            disabled={
                              notificationActionLoading ===
                              notification.id
                            }
                            className="mt-1.5 shrink-0 disabled:cursor-wait"
                            aria-label={
                              notification.is_read
                                ? "Notification read"
                                : "Mark notification as read"
                            }
                          >
                            <span
                              className={`block h-2 w-2 rounded-full ${
                                notification.is_read
                                  ? "bg-slate-200"
                                  : "bg-indigo-600"
                              }`}
                            />
                          </button>

                          {/* Content */}

                          <button
                            type="button"
                            onClick={() =>
                              handleNotificationClick(
                                notification,
                              )
                            }
                            disabled={
                              notificationActionLoading ===
                              notification.id
                            }
                            className="min-w-0 flex-1 text-left disabled:cursor-wait"
                          >
                            <span
                              className={`block text-sm ${
                                notification.is_read
                                  ? "font-medium text-slate-600"
                                  : "font-semibold text-slate-800"
                              }`}
                            >
                              {notification.title}
                            </span>

                            <span className="mt-1 block text-xs leading-relaxed text-slate-400">
                              {notification.message}
                            </span>

                            <span className="mt-1.5 block text-[10px] font-medium text-slate-400">
                              {formatNotificationTime(
                                notification.created_at,
                              )}
                            </span>
                          </button>

                          {/* Delete */}

                          <button
                            type="button"
                            onClick={() =>
                              handleDeleteNotification(
                                notification.id,
                              )
                            }
                            disabled={
                              notificationActionLoading ===
                              notification.id
                            }
                            className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-slate-300 opacity-0 transition-all hover:bg-red-50 hover:text-red-500 group-hover:opacity-100 disabled:cursor-wait disabled:opacity-50"
                            aria-label="Clear notification"
                          >
                            {notificationActionLoading ===
                            notification.id ? (
                              <Loader2
                                size={14}
                                className="animate-spin"
                              />
                            ) : (
                              <Trash2 size={14} />
                            )}
                          </button>
                        </div>
                      ),
                    )
                  )}
                </div>

                {/* Footer */}

                {notifications.length > 0 && (
                  <div className="border-t border-slate-100 px-4 py-2.5">
                    <button
                      type="button"
                      onClick={() =>
                        setNotifOpen(false)
                      }
                      className="w-full text-center text-xs font-semibold text-indigo-600 hover:text-indigo-700"
                    >
                      Close
                    </button>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* =====================================================
          MOBILE SEARCH
      ====================================================== */}

      <AnimatePresence>
        {mobileSearchOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-40 flex items-center gap-3 bg-white px-4 md:hidden"
          >
            <Search className="h-4.5 w-4.5 shrink-0 text-slate-400" />

            <div className="relative flex-1">
              <input
                autoFocus
                type="text"
                value={searchQuery}
                onChange={(e) =>
                  setSearchQuery(e.target.value)
                }
                placeholder="Search invoices, items, customers..."
                className="h-10 w-full border-none bg-transparent text-sm text-slate-900 outline-none placeholder:text-slate-400"
              />

              {/* Mobile Search Dropdown */}

              <AnimatePresence>
                {searchQuery.trim() && (
                  <motion.div
                    initial={{
                      opacity: 0,
                      y: -5,
                    }}
                    animate={{
                      opacity: 1,
                      y: 0,
                    }}
                    exit={{
                      opacity: 0,
                      y: -5,
                    }}
                    className="absolute left-0 right-0 top-12 z-50 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl"
                  >
                    {searchResults.length > 0 ? (
                      <div className="p-2">
                        <p className="px-3 py-2 text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">
                          Search Results
                        </p>

                        {searchResults.map(
                          (item) => (
                            <button
                              key={item.path}
                              type="button"
                              onClick={() =>
                                handleSearchSelect(
                                  item.path,
                                )
                              }
                              className="flex w-full items-start gap-3 rounded-xl px-3 py-3 text-left transition-colors hover:bg-indigo-50"
                            >
                              <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600">
                                <Search className="h-4 w-4" />
                              </div>

                              <div className="min-w-0">
                                <p className="text-sm font-semibold text-slate-800">
                                  {item.title}
                                </p>

                                <p className="mt-0.5 text-xs text-slate-400">
                                  {item.description}
                                </p>
                              </div>
                            </button>
                          ),
                        )}
                      </div>
                    ) : (
                      <div className="px-5 py-8 text-center">
                        <Search className="mx-auto h-5 w-5 text-slate-300" />

                        <p className="mt-2 text-sm font-semibold text-slate-600">
                          No results found
                        </p>

                        <p className="mt-1 text-xs text-slate-400">
                          Try another search term
                        </p>
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <button
              type="button"
              onClick={() => {
                setMobileSearchOpen(false);
                setSearchQuery("");
              }}
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-slate-100 text-slate-500"
              aria-label="Close search"
            >
              <X className="h-4 w-4" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}