"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
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

// 🔴 Change this to your expected maintenance end time
const END_TIME = new Date("2026-09-22T13:00:00");

export default function Maintenance() {
  const [timeLeft, setTimeLeft] = useState({
    hours: 0,
    minutes: 0,
    seconds: 0,
  });

  useEffect(() => {
    const calculateTimeLeft = () => {
      const difference = END_TIME.getTime() - new Date().getTime();

      if (difference <= 0) {
        setTimeLeft({
          hours: 0,
          minutes: 0,
          seconds: 0,
        });
        return;
      }

      const hours = Math.floor(difference / (1000 * 60 * 60));
      const minutes = Math.floor(
        (difference % (1000 * 60 * 60)) / (1000 * 60)
      );
      const seconds = Math.floor((difference % (1000 * 60)) / 1000);

      setTimeLeft({
        hours,
        minutes,
        seconds,
      });
    };

    calculateTimeLeft();

    const timer = setInterval(calculateTimeLeft, 1000);

    return () => clearInterval(timer);
  }, []);

  const formatTime = (value: number) =>
    value.toString().padStart(2, "0");

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

        {/* Maintenance Illustration */}
        <motion.div
          variants={item}
          className="relative mb-8 w-fit"
        >
          <div className="text-[90px] sm:text-[130px] font-black leading-none tracking-tighter text-slate-200 select-none whitespace-pre-wrap">
            Server Down⚠️
          </div>
        </motion.div>

        {/* Message */}
        <motion.div variants={item}>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">
            Updating Latest Changes including Backend.
          </h1>

          <p className="mt-3 max-w-md mx-auto text-slate-500 leading-6">
            The Narayan Aluminium system is currently undergoing scheduled
            maintenance. We'll be back shortly.
          </p>
        </motion.div>

        {/* Countdown Timer */}
        <motion.div variants={item} className="mt-8">
          <p className="text-sm font-medium text-slate-500 mb-3">
            Estimated time remaining
          </p>

          <div className="flex justify-center items-center gap-3">
            {/* Hours */}
            <div className="bg-white border border-slate-200 rounded-xl shadow-sm px-5 py-4 min-w-[80px]">
              <div className="text-3xl sm:text-4xl font-bold text-slate-900 font-mono">
                {formatTime(timeLeft.hours)}
              </div>

              <div className="text-xs text-slate-400 uppercase tracking-wider mt-1">
                Hours
              </div>
            </div>

            <span className="text-2xl font-bold text-slate-400">
              :
            </span>

            {/* Minutes */}
            <div className="bg-white border border-slate-200 rounded-xl shadow-sm px-5 py-4 min-w-[80px]">
              <div className="text-3xl sm:text-4xl font-bold text-slate-900 font-mono">
                {formatTime(timeLeft.minutes)}
              </div>

              <div className="text-xs text-slate-400 uppercase tracking-wider mt-1">
                Minutes
              </div>
            </div>

            <span className="text-2xl font-bold text-slate-400">
              :
            </span>

            {/* Seconds */}
            <div className="bg-white border border-slate-200 rounded-xl shadow-sm px-5 py-4 min-w-[80px]">
              <div className="text-3xl sm:text-4xl font-bold text-indigo-700 font-mono">
                {formatTime(timeLeft.seconds)}
              </div>

              <div className="text-xs text-slate-400 uppercase tracking-wider mt-1">
                Seconds
              </div>
            </div>
          </div>
        </motion.div>

        {/* Status */}
        <motion.div
          variants={item}
          className="mt-6 flex items-center justify-center gap-2"
        >
          <span className="relative flex h-3 w-3">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-indigo-400 opacity-75" />

            <span className="relative inline-flex h-3 w-3 rounded-full bg-indigo-600" />
          </span>

          <span className="text-sm text-slate-500">
            Maintenance in progress
          </span>
        </motion.div>

        {/* Actions */}
        <motion.div
          variants={item}
          className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3"
        >
          <button
            onClick={() => window.location.reload()}
            className="w-full sm:w-auto px-6 py-3 rounded-xl border border-slate-200 bg-white text-slate-700 font-medium hover:bg-slate-100 transition-all duration-200 shadow-sm"
          >
            ↻ Refresh Page
          </button>

          <Link
            href="/store"
            className="w-full sm:w-auto px-6 py-3 rounded-xl bg-slate-900 text-white font-medium hover:bg-slate-800 transition-all duration-200 shadow-lg shadow-slate-900/10"
          >
            Back to Dashboard →
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

