"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { motion, useReducedMotion } from "framer-motion";
import {
  Building2,
  Factory,
  MapPin,
  CheckCircle2,
  Circle,
  Check,
  ArrowRight,
  ArrowLeft,
  FileText,
} from "lucide-react";
import {
  getSelectedStore,
  getStoredUser,
  saveSelectedStore,
} from "@/lib/auth";
import type { BillingLocation, StoreType, User } from "@/types/auth";

const locations: BillingLocation[] = [
  {
    id: "store",
    name: "Retail Store",
    subtitle: "Front-desk counter billing",
    address: "Andheri East, Mumbai, MH",
    gstin: "27AABCS4567K1Z2",
    features: ["Point-of-sale invoices", "Walk-in customer GSTIN", "Daily sales register"],
  },
  {
    id: "plant",
    name: "Manufacturing Plant",
    subtitle: "Factory dispatch billing",
    address: "Peenya Industrial Area, Bangalore, KA",
    gstin: "29AABCT1234F1Z5",
    features: ["E-way bill & vehicle details", "HSN-coded bulk items", "Dispatch destination notes"],
  },
];

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08, delayChildren: 0.1 } },
};

const item = {
  hidden: { y: 20, opacity: 0 },
  show: { y: 0, opacity: 1, transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] as const } },
};

export default function BillingPage() {
  const router = useRouter();
  const shouldReduceMotion = useReducedMotion();
  const [selectedStore, setSelectedStore] = useState<StoreType | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    setUser(getStoredUser());
    setSelectedStore(getSelectedStore());
  }, [router]);

  const activeLocation = useMemo(
    () => locations.find((location) => location.id === selectedStore) ?? null,
    [selectedStore],
  );

 const handleContinue = () => {
  if (!selectedStore) return;

  saveSelectedStore(selectedStore);

  router.push("/store");
};

  if (!isMounted) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-slate-300 border-t-indigo-600" />
      </div>
    );
  }

  return (
    <div className="relative flex min-h-screen w-full flex-col items-center justify-center bg-slate-50 p-6 sm:p-12">
      <div className="absolute inset-0 z-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:3rem_3rem]" />
       <motion.div
                variants={item}
                className="mb-6 flex flex-col items-center text-center "
              >
                <span className="text-xl text-indigo-700 font-medium uppercase tracking-[0.3em]">
                  NARAYAN
                </span>
                <span className="text-xs text-slate-600 font-mono tracking-[0.3em]">
                  Aluminium  
                </span>
              </motion.div>
      <motion.div
        variants={shouldReduceMotion ? undefined : container}
        initial="hidden"
        animate="show"
        className="relative z-10 w-full max-w-5xl"
      >
        {/* Header Section */}
        <motion.div variants={item} className="mb-10 text-center sm:mb-16">
  
          <p className="mb-3 font-mono text-xs uppercase tracking-[0.25em] text-slate-500">
            Step 1 of 2
          </p>
          <h1 className="text-3xl font-light tracking-tighter text-slate-900 sm:text-5xl">
            Where are you <span className="font-mono text-indigo-600">billing from?</span>
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-sm text-slate-500 sm:text-base">
            Select a facility to automatically load its GSTIN, active invoice series, and designated item catalogue.
          </p>
        
        </motion.div>

        {/* Location Cards */}
        <div className="grid gap-6 md:grid-cols-2">
          {locations.map((location) => {
            const active = selectedStore === location.id;
            return (
              <motion.button
                variants={item}
                key={location.id}
                type="button"
                onClick={() => setSelectedStore(location.id as StoreType)}
                aria-pressed={active}
                className={`group relative flex flex-col justify-between overflow-hidden rounded-2xl border p-8 text-left transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-600 focus-visible:ring-offset-2 ${
                  active
                    ? "border-indigo-600 bg-indigo-50/30 shadow-lg shadow-indigo-600/10 ring-1 ring-indigo-600"
                    : "border-slate-200 bg-white hover:border-indigo-300 hover:shadow-md"
                }`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div
                    className={`flex h-14 w-14 items-center justify-center rounded-xl transition-colors ${
                      active
                        ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/20"
                        : "bg-slate-100 text-slate-500 group-hover:bg-indigo-50 group-hover:text-indigo-600"
                    }`}
                  >
                    {location.id === "store" ? (
                      <Building2 className="h-7 w-7" />
                    ) : (
                      <Factory className="h-7 w-7" />
                    )}
                  </div>
                  <div className="text-slate-400 transition-colors">
                    {active ? (
                      <CheckCircle2 className="h-7 w-7 text-indigo-600" />
                    ) : (
                      <Circle className="h-7 w-7 group-hover:text-indigo-300" />
                    )}
                  </div>
                </div>

                <div className="mt-8">
                  <h2 className="text-2xl font-semibold tracking-tight text-slate-900">
                    {location.name}
                  </h2>
                  <p className="mt-1 text-sm font-medium text-indigo-600/80">{location.subtitle}</p>

                  <div className="mt-6 flex flex-col gap-3 rounded-xl bg-slate-50 p-4 text-sm text-slate-600">
                    <div className="flex items-start gap-3">
                      <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-slate-400" />
                      <span>{location.address}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <FileText className="h-4 w-4 shrink-0 text-slate-400" />
                      <span className="font-mono text-xs font-semibold tracking-wider text-slate-700">
                        GSTIN: {location.gstin}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="mt-8 space-y-3">
                  {location.features.map((feature) => (
                    <div key={feature} className="flex items-center gap-3 text-sm text-slate-600">
                      <div
                        className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full ${
                          active ? "bg-indigo-100 text-indigo-600" : "bg-slate-100 text-slate-400"
                        }`}
                      >
                        <Check className="h-3 w-3" />
                      </div>
                      {feature}
                    </div>
                  ))}
                </div>
              </motion.button>
            );
          })}
        </div>

        {/* Action Bar */}
        <motion.div
          variants={item}
          className="mt-10 flex flex-col-reverse gap-4 sm:flex-row sm:items-center sm:justify-between"
        >
          <button
            type="button"
            onClick={() => router.push("/")}
            className="group flex h-14 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-6 text-sm font-semibold text-slate-600 transition-all hover:border-slate-300 hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-600 focus-visible:ring-offset-2"
          >
            <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
            Back to sign in
          </button>

          <button
            type="button"
            disabled={!selectedStore}
            onClick={handleContinue}
            className="group flex h-14 items-center justify-center gap-2 rounded-xl bg-slate-900 px-8 text-sm font-bold uppercase tracking-[0.1em] text-white transition-all hover:bg-slate-800 hover:shadow-lg hover:shadow-slate-900/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-600 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:shadow-none"
          >
            Continue as {activeLocation?.name ?? "location"}
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </button>
        </motion.div>
      </motion.div>
    </div>
  );
}