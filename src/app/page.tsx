"use client";

import { motion } from "framer-motion";
import {
  ArrowRight,
  CheckCircle2,
  RefreshCw,
  Wrench,
} from "lucide-react";

const container = {
  hidden: {},
  show: {
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.1,
    },
  },
};

const item = {
  hidden: {
    y: 20,
    opacity: 0,
  },
  show: {
    y: 0,
    opacity: 1,
    transition: {
      duration: 0.6,
      ease: [0.16, 1, 0.3, 1] as const,
    },
  },
};

export default function MaintenancePage() {
  return (
    <div className="relative flex min-h-screen w-full items-center justify-center bg-slate-50 p-6 sm:p-12">
      {/* Background */}
      <div className="absolute inset-0 z-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:3rem_3rem]" />

      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="relative z-10 w-full max-w-[600px] rounded-2xl bg-white px-8 py-12 shadow-[0_8px_30px_rgb(0,0,0,0.04)] sm:border sm:border-slate-100 sm:px-12"
      >
        {/* Branding */}
        <motion.div
          variants={item}
          className="mb-8 flex flex-col items-center text-center"
        >
          <span className="text-xl font-medium uppercase tracking-[0.3em] text-indigo-700">
            NARAYAN
          </span>

          <span className="font-mono text-xs tracking-[0.3em] text-slate-600">
            Aluminium
          </span>
        </motion.div>

        {/* Maintenance Icon */}
        <motion.div
          variants={item}
          className="mx-auto mb-7 flex h-20 w-20 items-center justify-center rounded-2xl bg-indigo-50"
        >
          <motion.div
            animate={{ rotate: [0, 8, -8, 0] }}
            transition={{
              duration: 2.5,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          >
            <Wrench
              className="h-9 w-9 text-indigo-600"
              strokeWidth={1.8}
            />
          </motion.div>
        </motion.div>

        {/* Header */}
        <motion.div
          variants={item}
          className="mb-8 text-center"
        >
          <p className="mb-3 font-mono text-sm uppercase tracking-[0.25em] text-indigo-600">
            System Maintenance
          </p>

          <h1 className="text-3xl font-light tracking-tighter text-slate-900 sm:text-5xl">
            We&apos;ll be{" "}
            <span className="font-mono text-4xl text-indigo-600 sm:text-5xl">
              Back Soon
            </span>
          </h1>

          <p className="mx-auto mt-5 max-w-md text-sm leading-7 text-slate-500 sm:text-base">
            The NARAYAN Aluminium management portal is currently undergoing
            scheduled maintenance and system improvements.
          </p>
        </motion.div>

        {/* Status */}
        <motion.div
          variants={item}
          className="rounded-xl border border-slate-200 bg-slate-50 p-5"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="relative flex h-3 w-3">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-indigo-400 opacity-60" />
                <span className="relative inline-flex h-3 w-3 rounded-full bg-indigo-600" />
              </span>

              <span className="font-mono text-xs font-medium uppercase tracking-[0.12em] text-slate-700">
                Maintenance in progress
              </span>
            </div>

            <span className="font-mono text-[10px] uppercase tracking-wider text-slate-400">
              Updating
            </span>
          </div>

          {/* Progress */}
          <div className="mt-5 h-1.5 overflow-hidden rounded-full bg-slate-200">
            <motion.div
              initial={{ x: "-100%" }}
              animate={{ x: "100%" }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut",
              }}
              className="h-full w-1/2 rounded-full bg-slate-800"
            />
          </div>

          <p className="mt-3 font-mono text-[10px] uppercase tracking-wider text-slate-400">
            Please check back shortly
          </p>
        </motion.div>

        {/* Improvements */}
        <motion.div
          variants={item}
          className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2"
        >
          <div className="flex items-center gap-3 rounded-xl border border-slate-100 bg-white p-4">
            <CheckCircle2
              className="h-5 w-5 flex-shrink-0 text-indigo-600"
              strokeWidth={1.8}
            />

            <div>
              <p className="text-xs font-semibold text-slate-700">
                Undergoing Database Migration 
              </p>

              <p className="mt-1 text-[10px] text-slate-400">
                Your information is secure
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 rounded-xl border border-slate-100 bg-white p-4">
            <Wrench
              className="h-5 w-5 flex-shrink-0 text-indigo-600"
              strokeWidth={1.8}
            />

            <div>
              <p className="text-xs font-semibold text-slate-700">
                System Upgrade
              </p>

              <p className="mt-1 text-[10px] text-slate-400">
                Improving system performance
              </p>
            </div>
          </div>
        </motion.div>

        {/* Refresh */}
        <motion.div
          variants={item}
          className="mt-7 flex justify-center"
        >
          <button
            type="button"
            onClick={() => window.location.reload()}
            className="group flex h-12 items-center justify-center rounded-xl bg-slate-900 px-6 text-xs font-bold uppercase tracking-[0.15em] text-white transition-all hover:bg-slate-800 hover:shadow-lg"
          >
            Check Again

            <RefreshCw className="ml-2 h-4 w-4 transition-transform duration-500 group-hover:rotate-180" />
          </button>
        </motion.div>

        {/* Footer */}
        <motion.div
          variants={item}
          className="mt-10 flex items-center justify-between border-t border-slate-100 pt-6 font-mono text-[10px] uppercase tracking-[0.15em] text-slate-400"
        >
          <span>© 2026 DeepByte Solutions</span>

          <span>Secured Business Management</span>
        </motion.div>
      </motion.div>
    </div>
  );
}