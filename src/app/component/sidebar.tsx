"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard,
  FileText,
  Package,
  Users,
  Settings,
  X,
  LogOut,
  User as UserIcon,
  ChevronsLeft,
} from "lucide-react";
import { logout } from "@/lib/auth";
import { useRouter, usePathname } from "next/navigation";
import type { User } from "@/types/auth";

export const SIDEBAR_ITEMS = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard, href: "/store" },
  { id: "invoices", label: "Invoices", icon: FileText, href: "/store/invoices", badge: 4 },
  { id: "inventory", label: "Inventory", icon: Package, href: "/store/inventory", badge: 2, badgeTone: "amber" as const },
  { id: "customers", label: "Customers", icon: Users, href: "/store/customer" },
];

export const BOTTOM_ITEMS = [
  { id: "settings", label: "Settings", icon: Settings, href: "/store/settings" },
];

interface SidebarProps {
  isMobileOpen: boolean;
  onCloseMobile: () => void;
}

export default function Sidebar({ isMobileOpen, onCloseMobile }: SidebarProps) {
  const [collapsed, setCollapsed] = useState(false);
  const [signOutOpen, setSignOutOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const signOutRef = useRef<HTMLDivElement>(null);

  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
  const fetchUser = async () => {
    try {
      const response = await fetch("/api/auth/me", {
        method: "GET",
        credentials: "include",
        cache: "no-store",
      });

      console.log("ME STATUS:", response.status);

      const data = await response.json();

      console.log("ME RESPONSE:", data);

      if (!response.ok) {
        console.error("Failed to load user:", data);
        return;
      }

      setUser(data);
    } catch (error) {
      console.error("Failed to fetch user:", error);
    }
  };

  fetchUser();
}, []);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (signOutRef.current && !signOutRef.current.contains(e.target as Node)) {
        setSignOutOpen(false);
      }
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  const handleNavigation = (href: string) => {
    router.push(href);
    onCloseMobile();
  };

  const handleLogout = async () => {
    try {
      setIsLoggingOut(true);
      await logout();
      setSignOutOpen(false);
      onCloseMobile();
      router.replace("/");
      router.refresh();
    } catch (error) {
      console.error("Logout failed:", error);
    } finally {
      setIsLoggingOut(false);
    }
  };

  const SidebarInner = ({ forceExpanded = false }: { forceExpanded?: boolean }) => {
    const isCollapsed = collapsed && !forceExpanded;

    return (
      <div className="flex h-full flex-col bg-white">
        {/* Brand */}
        <div className="flex items-center justify-between px-8 pb-8 pt-10">
          <div
            className={`flex flex-col items-start overflow-hidden transition-all ${
              isCollapsed ? "w-0 opacity-0" : "w-auto opacity-100"
            }`}
          >
            <span className="whitespace-nowrap text-lg font-medium uppercase tracking-[0.25em] text-indigo-700">
              NARAYAN
            </span>
            <span className="whitespace-nowrap font-mono text-[10px] tracking-[0.3em] text-slate-500">
              ALUMINIUM
            </span>
          </div>
          {isCollapsed && (
            <span className="text-lg font-bold text-indigo-700">N</span>
          )}
        </div>

        <div className="flex-1 overflow-y-auto overflow-x-hidden py-4">
          {/* Main Menu */}
          <div className="mb-8">
            <p
              className={`mb-4 whitespace-nowrap px-8 font-mono text-[10px] uppercase tracking-[0.2em] text-slate-400 transition-opacity ${
                isCollapsed ? "opacity-0" : "opacity-100"
              }`}
            >
              Main Menu
            </p>
            <nav className="space-y-1 px-4">
              {SIDEBAR_ITEMS.map((item) => {
                const isActive = pathname === item.href;
                const Icon = item.icon;
                return (
                  <div key={item.id} className="group/item relative">
                    <button
                      onClick={() => handleNavigation(item.href)}
                      aria-current={isActive ? "page" : undefined}
                      className={`group relative flex w-full items-center gap-3 rounded-xl px-4 py-3.5 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-600 focus-visible:ring-offset-2 ${
                        isActive
                          ? "bg-indigo-50/50 text-indigo-700"
                          : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
                      } ${isCollapsed ? "justify-center px-0" : ""}`}
                    >
                      <Icon
                        className={`h-5 w-5 shrink-0 transition-colors ${
                          isActive
                            ? "text-indigo-600"
                            : "text-slate-400 group-hover:text-slate-600"
                        }`}
                        fill={isActive ? "currentColor" : "none"}
                        strokeWidth={isActive ? 1.5 : 2}
                      />
                      {!isCollapsed && (
                        <span
                          className={`whitespace-nowrap text-sm ${
                            isActive ? "font-bold" : "font-medium"
                          }`}
                        >
                          {item.label}
                        </span>
                      )}

                      {!isCollapsed && item.badge && (
                        <span
                          className={`ml-auto rounded-full px-2 py-0.5 font-mono text-[10px] font-bold ${
                            item.badgeTone === "amber"
                              ? "bg-amber-50 text-amber-700"
                              : "bg-indigo-600 text-white"
                          }`}
                        >
                          {item.badge}
                        </span>
                      )}

                      {isCollapsed && item.badge && (
                        <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-indigo-600 ring-2 ring-white" />
                      )}

                      {isActive && (
                        <motion.div
                          layoutId="activeTab"
                          transition={{ type: "spring", bounce: 0, duration: 0.4 }}
                          className="absolute left-0 top-1/2 h-8 w-1 -translate-y-1/2 rounded-r-full bg-indigo-600"
                        />
                      )}
                    </button>

                    {/* Tooltip when collapsed */}
                    {isCollapsed && (
                      <span className="pointer-events-none absolute left-full top-1/2 z-50 ml-3 -translate-y-1/2 whitespace-nowrap rounded-lg bg-slate-900 px-2.5 py-1.5 text-xs font-medium text-white opacity-0 shadow-lg transition-opacity group-hover/item:opacity-100">
                        {item.label}
                        {item.badge ? ` · ${item.badge}` : ""}
                      </span>
                    )}
                  </div>
                );
              })}
            </nav>
          </div>
        </div>

        {/* Collapse toggle — desktop only */}
        <div className="hidden px-4 lg:block">
          <button
            onClick={() => setCollapsed((v) => !v)}
            className="mb-2 flex w-full items-center gap-3 rounded-xl px-4 py-2.5 text-slate-400 transition-colors hover:bg-slate-50 hover:text-slate-600"
          >
            <ChevronsLeft
              className={`h-4 w-4 shrink-0 transition-transform ${
                collapsed ? "rotate-180" : ""
              }`}
            />
            {!isCollapsed && (
              <span className="whitespace-nowrap text-xs font-medium">
                Collapse
              </span>
            )}
          </button>
        </div>

        {/* Bottom Actions */}
        <div className="border-t border-slate-100 p-4">
          <p
            className={`mb-4 whitespace-nowrap px-4 pt-2 font-mono text-[10px] uppercase tracking-[0.2em] text-slate-400 transition-opacity ${
              isCollapsed ? "opacity-0" : "opacity-100"
            }`}
          >
            System
          </p>
          <nav className="mb-4 space-y-1">
            {BOTTOM_ITEMS.map((item) => {
              const isActive = pathname === item.href;
              const Icon = item.icon;
              return (
                <div key={item.id} className="group/item relative">
                  <button
                    onClick={() => handleNavigation(item.href)}
                    aria-current={isActive ? "page" : undefined}
                    className={`group flex w-full items-center gap-3 rounded-xl px-4 py-3 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-600 focus-visible:ring-offset-2 ${
                      isActive
                        ? "bg-indigo-50/50 text-indigo-700"
                        : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
                    } ${isCollapsed ? "justify-center px-0" : ""}`}
                  >
                    <Icon
                      className="h-5 w-5 shrink-0 text-slate-400 group-hover:text-slate-600"
                      fill={isActive ? "currentColor" : "none"}
                    />
                    {!isCollapsed && (
                      <span className="whitespace-nowrap text-sm font-medium">
                        {item.label}
                      </span>
                    )}
                  </button>
                  {isCollapsed && (
                    <span className="pointer-events-none absolute left-full top-1/2 z-50 ml-3 -translate-y-1/2 whitespace-nowrap rounded-lg bg-slate-900 px-2.5 py-1.5 text-xs font-medium text-white opacity-0 shadow-lg transition-opacity group-hover/item:opacity-100">
                      {item.label}
                    </span>
                  )}
                </div>
              );
            })}
          </nav>

          {/* User Profile Summary */}
          <div className="relative" ref={signOutRef}>
            <div
              className={`flex items-center gap-3 rounded-xl border border-slate-100 bg-slate-50/50 p-3 ${
                isCollapsed ? "justify-center" : ""
              }`}
            >
              <button
                type="button"
                onClick={() => setSignOutOpen((prev) => !prev)}
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-indigo-100 text-indigo-700 transition hover:bg-indigo-200"
                title="Account options"
              >
                <UserIcon className="h-5 w-5" fill="currentColor" />
              </button>

              {!isCollapsed && (
                <>
                  <div className="flex flex-1 flex-col overflow-hidden text-left">
                    <span className="truncate text-sm font-bold text-slate-900">
                      {user?.name ?? "User"}
                    </span>
                    <span className="truncate text-xs font-medium text-slate-500">
                      {user?.user_id ?? "User"}
                    </span>
                  </div>
                  <button
                    onClick={() => setSignOutOpen(true)}
                    aria-label="Sign out"
                    className="shrink-0 rounded p-1 text-slate-400 transition-colors hover:bg-red-50 hover:text-red-600"
                  >
                    <LogOut className="h-4 w-4" />
                  </button>
                </>
              )}
            </div>

            {/* Logout Confirmation Popover */}
            <AnimatePresence>
              {signOutOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 6, scale: 0.97 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 6, scale: 0.97 }}
                  transition={{ duration: 0.15 }}
                  className={`absolute bottom-full z-50 mb-2 overflow-hidden rounded-xl border border-slate-100 bg-white p-3 shadow-xl ${
                    isCollapsed
                      ? "left-0 w-56"
                      : "left-0 w-full min-w-[220px]"
                  }`}
                >
                  <p className="mb-3 text-sm text-slate-600">
                    Sign out of {user?.name ? user.user_id : "your account"}?
                  </p>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      disabled={isLoggingOut}
                      onClick={() => setSignOutOpen(false)}
                      className="flex-1 rounded-lg border border-slate-200 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-50 disabled:opacity-50"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      disabled={isLoggingOut}
                      onClick={handleLogout}
                      className="flex-1 rounded-lg bg-red-600 py-1.5 text-xs font-semibold text-white transition hover:bg-red-700 disabled:opacity-50"
                    >
                      {isLoggingOut ? "Signing out..." : "Sign out"}
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    );
  };

  return (
    <>
      {/* DESKTOP SIDEBAR */}
      <motion.aside
        animate={{ width: collapsed ? 88 : 280 }}
        transition={{ type: "spring", bounce: 0, duration: 0.35 }}
        className="hidden shrink-0 overflow-hidden border-r border-slate-200 bg-white lg:block"
      >
        <SidebarInner />
      </motion.aside>

      {/* MOBILE SIDEBAR OVERLAY */}
      <AnimatePresence>
        {isMobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={onCloseMobile}
              className="fixed inset-0 z-40 bg-slate-900/20 backdrop-blur-sm lg:hidden"
            />
            <motion.aside
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", bounce: 0, duration: 0.4 }}
              className="fixed inset-y-0 left-0 z-50 w-[280px] border-r border-slate-200 bg-white shadow-2xl lg:hidden"
            >
              <SidebarInner forceExpanded />
              <button
                onClick={onCloseMobile}
                aria-label="Close menu"
                className="absolute right-4 top-10 flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 text-slate-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-600"
              >
                <X className="h-4 w-4" />
              </button>
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
}