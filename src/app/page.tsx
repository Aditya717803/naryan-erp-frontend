"use client";

import { motion } from "framer-motion";
import { Settings, Clock, Mail, ArrowRight } from "lucide-react";

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1, delayChildren: 0.1 },
  },
};

const item = {
  hidden: { y: 20, opacity: 0 },
  show: {
    y: 0,
    opacity: 1,
    transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] },
  },
};

export default function MaintenancePage() {
  return (
    <div className="relative flex min-h-screen w-full flex-col items-center justify-center bg-slate-50 p-6 sm:p-12">
      {/* Subtle Grid Background */}
      <div className="pointer-events-none absolute inset-0 z-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:3rem_3rem]" />

      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="relative z-10 w-full max-w-[500px] overflow-hidden rounded-3xl border border-slate-100 bg-white/90 p-8 shadow-[0_8px_30px_rgb(0,0,0,0.06)] backdrop-blur-md sm:p-12 text-center"
      >
        {/* Brand */}
        <motion.div variants={item} className="mb-8 flex flex-col items-center">
          <span className="font-mono text-sm font-semibold tracking-[0.25em] text-[#0f172a]">
            NARAYAN ALUMINIUM
          </span>
        </motion.div>

        {/* Animated Gear Icon */}
        <motion.div variants={item} className="mb-8 flex justify-center">
          <div className="relative flex h-24 w-24 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600 shadow-inner">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 8, ease: "linear" }}
            >
              <Settings size={40} strokeWidth={1.5} />
            </motion.div>
          </div>
        </motion.div>

        {/* Headings */}
        <motion.div variants={item} className="mb-8">
          <p className="mb-3 font-mono text-[11px] font-bold uppercase tracking-[0.25em] text-indigo-600">
            System Update
          </p>
          <h1 className="text-3xl font-light tracking-tight text-[#0f172a] sm:text-4xl">
            Under <span className="font-medium">Maintenance</span>
          </h1>
          <p className="mt-4 text-sm leading-relaxed text-slate-500">
            We are currently upgrading our database and deploying performance improvements to the portal. The system will be back online shortly.
          </p>
        </motion.div>

        {/* Status Info */}
        <motion.div variants={item} className="mb-10 rounded-2xl border border-slate-100 bg-slate-50/50 p-5 text-left">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-white shadow-sm text-slate-400">
              <Clock size={20} />
            </div>
            <div>
              <p className="font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">
                Estimated Downtime
              </p>
              <p className="mt-0.5 text-sm font-semibold text-slate-700">
                Approximately 5 hours
              </p>
            </div>
          </div>
        </motion.div>

        {/* Actions */}
        <motion.div variants={item} className="flex flex-col gap-3 sm:flex-row">
          <button 
            type="button"
            onClick={() => window.location.reload()}
            className="group flex h-[52px] flex-1 items-center justify-center gap-2 rounded-xl bg-[#0f172a] px-6 text-sm font-bold uppercase tracking-[0.1em] text-white transition-all hover:bg-slate-800 hover:shadow-lg hover:shadow-slate-900/20 active:scale-[0.98]"
          >
            Refresh Page
            <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
          </button>
          
          <a
            href="mailto:support@narayanaluminium.com"
            className="flex h-[52px] flex-1 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-6 text-sm font-bold uppercase tracking-[0.1em] text-slate-600 transition-colors hover:bg-slate-50 hover:text-slate-900"
          >
            <Mail size={16} />
            Contact IT
          </a>
        </motion.div>
      </motion.div>

      {/* Footer */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8, duration: 0.5 }}
        className="relative z-10 mt-12 text-center font-mono text-[10px] uppercase tracking-[0.2em] text-slate-400"
      >
        <span>© 2026 Narayan Aluminium</span>
        <span className="mx-3">·</span>
        <span>All systems offline</span>
      </motion.div>
    </div>
  );
}