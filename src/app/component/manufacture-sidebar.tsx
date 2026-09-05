"use client";

import { useState, useRef, useEffect } from "react";
import {
  motion,
  AnimatePresence,
  useReducedMotion,
} from "framer-motion";

import {
  LayoutDashboard,
  FileText,
  Package,
  Users,
  Settings,
  X,
  LogOut,
  ArrowRight,
  ChevronsLeft,
  Factory,
  User as UserIcon,
} from "lucide-react";

import { logout } from "@/lib/auth";
import { useRouter, usePathname } from "next/navigation";
import type { User } from "@/types/auth";

/* =========================================================
   STORE NAVIGATION
========================================================= */

export const SIDEBAR_ITEMS = [
  {
    id: "dashboard",
    label: "Dashboard",
    icon: LayoutDashboard,
    href: "/manufacturer",
  },
  {
    id: "invoices",
    label: "Invoices",
    icon: FileText,
    href: "/manufacturer/invoices",
    badge: 4,
  },
  {
    id: "inventory",
    label: "Inventory",
    icon: Package,
    href: "/manufacturer/inventory",
    badge: 2,
    badgeTone: "amber" as const,
  },
  {
    id: "customers",
    label: "Customers",
    icon: Users,
    href: "/manufacturer/customer",
  },
];

export const BOTTOM_ITEMS = [
  {
    id: "settings",
    label: "Settings",
    icon: Settings,
    href: "/store/settings",
  },
];

/* =========================================================
   TYPES
========================================================= */

interface SidebarProps {
  isMobileOpen: boolean;
  onCloseMobile: () => void;
}

/* =========================================================
   SIDEBAR
========================================================= */

export default function Sidebar({
  isMobileOpen,
  onCloseMobile,
}: SidebarProps) {
  const [collapsed, setCollapsed] = useState(false);
  const [signOutOpen, setSignOutOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const signOutRef = useRef<HTMLDivElement>(null);

  const prefersReducedMotion = useReducedMotion();

  const router = useRouter();
  const pathname = usePathname();

  const [user, setUser] = useState<User | null>(null);

  /* =========================================================
     FETCH CURRENT USER
  ========================================================= */

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await fetch("/api/auth/me", {
          method: "GET",
          credentials: "include",
          cache: "no-store",
        });

        const data = await response.json();

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

  /* =========================================================
     CLOSE SIGN OUT WHEN CLICKING OUTSIDE
  ========================================================= */

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (
        signOutRef.current &&
        !signOutRef.current.contains(e.target as Node)
      ) {
        setSignOutOpen(false);
      }
    };

    document.addEventListener("mousedown", onClick);

    return () => {
      document.removeEventListener("mousedown", onClick);
    };
  }, []);

  /* =========================================================
     NAVIGATION
  ========================================================= */

  const handleNavigation = (href: string) => {
    router.push(href);
    onCloseMobile();
  };

  /* =========================================================
     LOGOUT
  ========================================================= */

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

  /* =========================================================
     SIDEBAR ANIMATION
  ========================================================= */

  const springTransition = prefersReducedMotion
    ? { duration: 0.01 }
    : {
        type: "spring" as const,
        bounce: 0,
        duration: 0.35,
      };

  /* =========================================================
     SIDEBAR CONTENT
  ========================================================= */

  const SidebarInner = ({
    forceExpanded = false,
  }: {
    forceExpanded?: boolean;
  }) => {
    const isCollapsed = collapsed && !forceExpanded;

    const allNavItems = [
      ...SIDEBAR_ITEMS,
      ...BOTTOM_ITEMS,
    ];

    /* =======================================================
       NAVIGATION ITEM
    ======================================================= */

    const renderRow = (
      item: (typeof allNavItems)[number]
    ) => {
      const isActive = pathname === item.href;

      const Icon = item.icon;

      const hasBadge =
        "badge" in item && Boolean(item.badge);

      return (
        <div
          key={item.id}
          className="group/item relative"
        >
          <button
            type="button"
            onClick={() => handleNavigation(item.href)}
            aria-current={
              isActive ? "page" : undefined
            }
            className={`group relative flex w-full items-center gap-3 px-4 py-2.5 transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-600 focus-visible:ring-offset-1 ${
              isActive
                ? "bg-indigo-50/60"
                : "hover:bg-slate-50"
            } ${
              isCollapsed
                ? "justify-center px-0"
                : ""
            }`}
          >
            {/* Active indicator */}

            <span
              className={`absolute left-0 top-1/2 h-8 w-1 -translate-y-1/2 rounded-r-full transition-all duration-200 ${
                isActive
                  ? "bg-indigo-600"
                  : "bg-transparent"
              }`}
            />

            {/* =================================================
                ICON CONTAINER
            ================================================= */}

            <div
              className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg transition-all duration-200 ${
                isActive
                  ? "bg-indigo-100 text-indigo-600"
                  : "bg-slate-50 text-slate-500 group-hover:bg-indigo-50 group-hover:text-indigo-600"
              }`}
            >
              <Icon
                className="h-[18px] w-[18px]"
                strokeWidth={
                  isActive ? 1.8 : 1.7
                }
              />
            </div>

            {/* =================================================
                LABEL
            ================================================= */}

            {!isCollapsed && (
              <span
                className={`whitespace-nowrap text-sm ${
                  isActive
                    ? "font-semibold text-slate-900"
                    : "font-normal text-slate-600"
                }`}
              >
                {item.label}
              </span>
            )}

            {/* =================================================
                BADGE
            ================================================= */}

        

            {/* Collapsed badge */}

            {isCollapsed && hasBadge && (
              <span
                className={`absolute right-2 top-2 h-2 w-2 rounded-full ring-2 ring-white ${
                  "badgeTone" in item &&
                  item.badgeTone === "amber"
                    ? "bg-amber-500"
                    : "bg-indigo-600"
                }`}
              />
            )}
          </button>

          {/* ===================================================
              COLLAPSED TOOLTIP
          =================================================== */}

          {isCollapsed && (
            <span className="pointer-events-none absolute left-full top-1/2 z-50 ml-3 -translate-y-1/2 whitespace-nowrap rounded-lg bg-slate-900 px-3 py-1.5 text-xs font-medium text-white opacity-0 shadow-lg transition-opacity group-hover/item:opacity-100">
              {item.label}

              {hasBadge
                ? ` · ${item.badge}`
                : ""}
            </span>
          )}
        </div>
      );
    };

    return (
      <div className="relative flex h-full flex-col bg-white">
        {/* ===================================================
            SUBTLE BACKGROUND GRID
        =================================================== */}

        <svg
          className="pointer-events-none absolute inset-0 h-full w-full opacity-[0.025]"
          aria-hidden="true"
        >
          <defs>
            <pattern
              id="storeDraftGrid"
              width="22"
              height="22"
              patternUnits="userSpaceOnUse"
            >
              <path
                d="M 22 0 L 0 0 0 22"
                fill="none"
                stroke="#0F172A"
                strokeWidth="1"
              />
            </pattern>
          </defs>

          <rect
            width="100%"
            height="100%"
            fill="url(#storeDraftGrid)"
          />
        </svg>

        {/* ===================================================
            BRAND
        =================================================== */}
<div
          className={`relative mx-4 mt-6 border border-slate-200 p-3 transition-all bg-slate-100/70 ${
            isCollapsed
              ? "mx-2 px-2"
              : ""
          }`}
        >
          {/* Top-left */}

          <span className="absolute left-0 top-0 h-2 w-2 border-l border-t border-indigo-600" />

          {/* Top-right */}

          <span className="absolute right-0 top-0 h-2 w-2 border-r border-t border-indigo-600" />

          {/* Bottom-left */}

          <span className="absolute bottom-0 left-0 h-2 w-2 border-b border-l border-indigo-600" />

          {/* Bottom-right */}

          <span className="absolute bottom-0 right-0 h-2 w-2 border-b border-r border-indigo-600" />

          <div
            className={`flex items-center ${
              isCollapsed
                ? "justify-center"
                : "gap-3"
            }`}
          >
            {/* Logo */}

            <div className="flex h-10 w-10 rounded-4xl items-center justify-center  text-xs font-semibold tracking-tight text-white bg-indigo-100 border border-black">
              <Factory className="h-[25px] w-[25px] text-black"/>
            </div>

            {!isCollapsed && (
              <div className="ml-2 min-w-0 leading-tight">
                <p className="truncate text-xl font-mono text-indigo-700 ">
                  Narayan
                </p>

                <p className="truncate  text-[16px]  font-semibold   text-slate-500">
                   Manufacture
                </p>
              </div>
            )}
          </div>

         
        </div>

        {/* ===================================================
            NAVIGATION
        =================================================== */}

        <div className="flex-1 overflow-y-auto overflow-x-hidden pt-6">
          {!isCollapsed && (
            <p className="mb-2 px-4 font-mono text-[10px] uppercase tracking-wide text-slate-400">
              Navigation
            </p>
          )}

          <nav className="border-t border-slate-900/10">
            {SIDEBAR_ITEMS.map(renderRow)}
          </nav>
        </div>

        {/* ===================================================
            COLLAPSE BUTTON
        =================================================== */}

        <div className="hidden border-t border-slate-900/10 lg:block">
          <button
            type="button"
            onClick={() =>
              setCollapsed((value) => !value)
            }
            aria-expanded={!collapsed}
            aria-label={
              collapsed
                ? "Expand sidebar"
                : "Collapse sidebar"
            }
            className={`flex w-full items-center gap-2 py-2.5 pl-4 text-slate-400 transition-colors hover:bg-slate-50 hover:text-slate-600 ${
              isCollapsed
                ? "justify-center pl-0"
                : ""
            }`}
          >
            <ChevronsLeft
              className={`h-5 w-5 shrink-0 transition-transform ${
                collapsed
                  ? "rotate-180"
                  : ""
              }`}
            />

            {!isCollapsed && (
              <span className="font-mono text-xs uppercase tracking-wide">
                Collapse
              </span>
            )}
          </button>
        </div>

        {/* ===================================================
            BOTTOM AREA
        =================================================== */}

        <div className="border-t border-slate-900/10 p-4">
          {/* =================================================
              MANUFACTURE
          ================================================= */}

          <a
            href="/store"
            onClick={onCloseMobile}
            aria-label="Switch to Manufacture"
            className={`group relative flex items-center overflow-hidden rounded-xl bg-[#0F172B] text-white shadow-sm transition-all duration-200 hover:bg-[#17223A] hover:shadow-md ${
              isCollapsed
                ? "mx-auto h-11 w-11 justify-center"
                : "w-full gap-3 px-3 py-2.5"
            }`}
          >
            {/* Subtle hover layer */}

            <span className="pointer-events-none absolute inset-0 bg-white/[0.04] opacity-0 transition-opacity duration-200 group-hover:opacity-100" />

            {/* Factory icon */}

            <div
              className={`relative flex shrink-0 items-center justify-center rounded-lg border border-white/10 bg-white/[0.06] ${
                isCollapsed
                  ? "h-8 w-8"
                  : "h-9 w-9"
              }`}
            >
              <Factory
                className={
                  isCollapsed
                    ? "h-[17px] w-[17px]"
                    : "h-[18px] w-[18px]"
                }
                strokeWidth={1.7}
              />
            </div>

            {/* Manufacture text */}

            {!isCollapsed && (
              <div className="relative min-w-0 flex-1 leading-tight">
                <p className="font-mono text-[9px] uppercase tracking-[0.14em] text-white/45">
                  Switch module
                </p>

                <p className="mt-0.5 truncate text-sm font-semibold tracking-wide text-white">
                  Store
                </p>
              </div>
            )}

            {/* Arrow */}

            {!isCollapsed && (
              <ArrowRight className="relative h-4 w-4 shrink-0 text-white/50 transition-all duration-200 group-hover:translate-x-1 group-hover:text-white" />
            )}

            {/* Collapsed tooltip */}

            {isCollapsed && (
              <span className="pointer-events-none absolute left-full z-50 ml-3 whitespace-nowrap rounded-lg bg-[#0F172B] px-3 py-2 text-xs font-medium text-white opacity-0 shadow-lg transition-opacity group-hover:opacity-100">
                Switch to Manufacture
              </span>
            )}
          </a>

          {/* =================================================
              SYSTEM
          ================================================= */}

          {!isCollapsed && (
            <p className="mb-2 mt-4 px-1 font-mono text-[10px] uppercase tracking-wide text-slate-400">
              System
            </p>
          )}

          <nav className="border-t border-slate-900/10">
            {BOTTOM_ITEMS.map(renderRow)}
          </nav>

          {/* =================================================
              USER ACCOUNT
          ================================================= */}

          <div
            className="relative mt-4"
            ref={signOutRef}
          >
            <div
              className={`flex items-center gap-3 rounded-xl border border-slate-100 bg-slate-50/50 p-3 ${
                isCollapsed
                  ? "justify-center"
                  : ""
              }`}
            >
              {/* =================================================
                  USER ICON
              ================================================= */}

              <button
                type="button"
                onClick={() =>
                  setSignOutOpen(
                    (prev) => !prev
                  )
                }
                title="Account options"
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-indigo-100 text-indigo-700 transition hover:bg-indigo-200"
              >
                <UserIcon
                  className="h-5 w-5"
                  fill="currentColor"
                />
              </button>

              {/* =================================================
                  USER INFORMATION
              ================================================= */}

              {!isCollapsed && (
                <>
                  <div className="flex min-w-0 flex-1 flex-col overflow-hidden text-left">
                    <span className="truncate text-sm font-bold text-slate-900">
                      {user?.name ?? "User"}
                    </span>

                    <span className="truncate text-xs font-medium text-slate-500">
                      {user?.user_id ?? "User"}
                    </span>
                  </div>

                  {/* =================================================
                      SIGN OUT BUTTON
                  ================================================= */}

                  <button
                    type="button"
                    onClick={() =>
                      setSignOutOpen(true)
                    }
                    aria-label="Sign out"
                    title="Sign out"
                    className="shrink-0 rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-red-50 hover:text-red-600"
                  >
                    <LogOut className="h-4 w-4" />
                  </button>
                </>
              )}
            </div>

            {/* =================================================
                SIGN OUT CONFIRMATION
            ================================================= */}

            <AnimatePresence>
              {signOutOpen && (
                <motion.div
                  initial={{
                    opacity: 0,
                    y: 6,
                    scale: 0.97,
                  }}
                  animate={{
                    opacity: 1,
                    y: 0,
                    scale: 1,
                  }}
                  exit={{
                    opacity: 0,
                    y: 6,
                    scale: 0.97,
                  }}
                  transition={
                    prefersReducedMotion
                      ? { duration: 0.01 }
                      : { duration: 0.15 }
                  }
                  className={`absolute bottom-full z-50 mb-2 overflow-hidden rounded-xl border border-slate-200 bg-white p-3 shadow-xl ${
                    isCollapsed
                      ? "left-0 w-56"
                      : "left-0 w-full min-w-[220px]"
                  }`}
                >
                  <p className="mb-3 text-sm text-slate-600">
                    Sign out of{" "}
                    {user?.name
                      ? user.user_id
                      : "your account"}
                    ?
                  </p>

                  <div className="flex gap-2">
                    <button
                      type="button"
                      disabled={isLoggingOut}
                      onClick={() =>
                        setSignOutOpen(false)
                      }
                      className="flex-1 rounded-lg border border-slate-200 py-2 text-xs font-semibold text-slate-600 transition-colors hover:bg-slate-50 disabled:opacity-50"
                    >
                      Cancel
                    </button>

                    <button
                      type="button"
                      disabled={isLoggingOut}
                      onClick={handleLogout}
                      className="flex-1 rounded-lg bg-red-600 py-2 text-xs font-semibold text-white transition-colors hover:bg-red-700 disabled:opacity-50"
                    >
                      {isLoggingOut
                        ? "Signing out..."
                        : "Sign out"}
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

  /* =========================================================
     DESKTOP + MOBILE
  ========================================================= */

  return (
    <>
      {/* =====================================================
          DESKTOP SIDEBAR
      ===================================================== */}

      <motion.aside
        animate={{
          width: collapsed ? 88 : 280,
        }}
        transition={springTransition}
        className="hidden shrink-0 overflow-hidden border-r border-slate-200 bg-white lg:block"
      >
        <SidebarInner />
      </motion.aside>

      {/* =====================================================
          MOBILE SIDEBAR
      ===================================================== */}

      <AnimatePresence>
        {isMobileOpen && (
          <>
            {/* Overlay */}

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={onCloseMobile}
              className="fixed inset-0 z-40 bg-slate-900/20 backdrop-blur-sm lg:hidden"
            />

            {/* Mobile sidebar */}

            <motion.aside
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={
                prefersReducedMotion
                  ? { duration: 0.01 }
                  : {
                      type: "spring",
                      bounce: 0,
                      duration: 0.4,
                    }
              }
              className="fixed inset-y-0 left-0 z-50 w-[280px] border-r border-slate-200 bg-white shadow-2xl lg:hidden"
            >
              <SidebarInner forceExpanded />

              {/* Close button */}

              <button
                type="button"
                onClick={onCloseMobile}
                aria-label="Close menu"
                className="absolute right-4 top-6 flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 text-slate-500 transition-colors hover:bg-slate-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-600"
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