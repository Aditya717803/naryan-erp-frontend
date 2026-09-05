"use client";

import Link from "next/link";
import { motion, type Variants } from "framer-motion";

const container: Variants = {
  hidden: {},
  show: {
    transition: {
      staggerChildren: 0.12,
    },
  },
};

const item: Variants = {
  hidden: {
    opacity: 0,
    y: 20,
  },
  show: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
      ease: "easeOut",
    },
  },
};

export default function NotFound() {
  return (
    <main className="min-h-screen bg-slate-50 flex items-center justify-center px-6 overflow-hidden">
      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="w-full max-w-2xl text-center"
      >
        {/* Brand */}
        <motion.div
          variants={item}
          className="mb-6 flex flex-col items-center text-center"
        >
          <span className="lg:text-4xl sm:text-xl text-indigo-700 font-medium uppercase tracking-[0.3em]">
            NARAYAN
          </span>

          <span className="lg:text-2xl sm:text-xl text-slate-600 font-mono tracking-[0.3em]">
            Aluminium
          </span>
        </motion.div>

        {/* 404 Illustration */}
        <motion.div
          variants={item}
          className="relative mx-auto mb-8 w-fit"
        >
          <div className="text-[120px] sm:text-[160px] font-black leading-none tracking-tighter text-slate-200 select-none">
            404
          </div>

          {/* Floating Box */}
          <motion.div
            animate={{
              y: [0, -10, 0],
              rotate: [3, 0, 3],
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: "easeInOut",
            }}
            className="absolute inset-0 flex items-center justify-center"
          >
            <div className="h-20 w-20 sm:h-24 sm:w-24 rounded-3xl bg-slate-50 shadow-xl border border-slate-200 flex items-center justify-center">
              <span className="text-4xl sm:text-5xl">📦</span>
            </div>
          </motion.div>
        </motion.div>

        {/* Message */}
        <motion.div variants={item}>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">
            Looks like this page left the warehouse.
          </h1>

          <p className="mt-3 max-w-md mx-auto text-slate-500 leading-6">
            The resource you're looking for doesn't exist, may have been
            moved, or is no longer available in your workspace.
          </p>
        </motion.div>

        {/* Actions */}
        <motion.div
          variants={item}
          className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3"
        >
          <button
            onClick={() => window.history.back()}
            className="w-full sm:w-auto px-6 py-3 rounded-xl border border-slate-200 bg-white text-slate-700 font-medium hover:bg-slate-100 transition-all duration-200 shadow-sm"
          >
            ← Go Back
          </button>

          <Link
            href="/store"
            className="w-full sm:w-auto px-6 py-3 rounded-xl bg-slate-900 text-white font-medium hover:bg-slate-800 transition-all duration-200 shadow-lg shadow-slate-900/10"
          >
            Go to Dashboard →
          </Link>
        </motion.div>

        {/* Footer */}
        <motion.div
          variants={item}
          className="mt-12 text-xs text-slate-400"
        >
          DeepByte Solutions • Business Management System
        </motion.div>
      </motion.div>
    </main>
  );
}