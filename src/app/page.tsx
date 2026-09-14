"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  ArrowRight,
  Eye,
  EyeOff,
  Lock,
  User,
} from "lucide-react";
import { useRouter } from "next/navigation";

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

export default function LoginPage() {
  const router = useRouter();

  const [userId, setUserId] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (
  e: React.FormEvent<HTMLFormElement>,
) => {
  e.preventDefault();

  if (!userId.trim() || !password) {
    alert("Please enter User ID and Password.");
    return;
  }

  setLoading(true);

  try {
    const response = await fetch(
      "/api/auth/login",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          user_id: userId.trim(),
          password,
        }),
      },
    );

    const data = await response.json();

    if (!response.ok) {
      alert(
        data.detail ??
          "Invalid User ID or Password",
      );
      return;
    }

    router.replace("/billing");
  } catch (error) {
    console.error("Login error:", error);

    alert(
      "Unable to connect to the server.",
    );
  } finally {
    setLoading(false);
  }
};

  return (
    <div className="relative flex min-h-screen w-full items-center justify-center bg-slate-50 p-6 sm:p-12">
      {/* Background */}
      
      <div className="absolute inset-0 z-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:3rem_3rem] " />
      


      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="relative z-10 w-full max-w-[540px] rounded-2xl bg-white px-8 py-12 shadow-[0_8px_30px_rgb(0,0,0,0.04)] sm:border sm:border-slate-100 sm:px-12"
      >
           
        
        {/* Branding */}
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

        {/* Header */}
        <motion.div
          variants={item}
          className="mb-10 text-center"
        >
          <p className="mb-3 font-mono text-xl uppercase tracking-[0.25em] text-slate-500">
            Welcome back
          </p>

          <h1 className="text-3xl font-light tracking-tighter text-slate-900 sm:text-5xl">
            Sign in to{" "}
            <span className="font-mono text-5xl text-indigo-600">
               Portal
            </span>
          </h1>
        </motion.div>

        <form
          onSubmit={handleSubmit}
          className="flex flex-col gap-6"
        >
          {/* User ID */}
          <motion.div
            variants={item}
            className="flex flex-col gap-2"
          >
            <label
              htmlFor="userId"
              className="font-mono text-sm uppercase tracking-[0.2em] text-slate-500"
            >
              User ID
            </label>

            <div className="relative">
              <User className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-indigo-700 " />

              <input
                id="userId"
                type="text"
                autoComplete="username"
                placeholder="Enter your User ID"
                value={userId}
                onChange={(e) => setUserId(e.target.value)}
                className="h-14 w-full rounded-xl border border-slate-200 bg-slate-100 pl-11 pr-4 font-mono text-lg text-slate-900 outline-none transition-all placeholder:text-slate-400  focus:bg-indigo-100"
              />
            </div>
          </motion.div>

          {/* Password */}
          <motion.div
            variants={item}
            className="flex flex-col gap-2"
          >
            <label
              htmlFor="password"
              className="font-mono text-sm uppercase tracking-[0.2em] text-slate-500"
            >
              Password
            </label>

            <div className="relative">
              <Lock className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-indigo-600" />

              <input
                id="password"
                type={showPassword ? "text" : "password"}
                autoComplete="current-password"
                placeholder="••••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="h-14 w-full rounded-xl border border-slate-200 bg-slate-100 pl-11 pr-4 font-mono text-lg text-slate-900 outline-none transition-all placeholder:text-slate-400  focus:bg-indigo-100"
              />

              <button
                type="button"
                onClick={() =>
                  setShowPassword((prev) => !prev)
                }
                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-indigo-600"
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            </div>
          </motion.div>

          {/* Remember */}
          <motion.div
            variants={item}
            className="flex items-center justify-between"
          >
            <label className="flex cursor-pointer items-center gap-2 text-sm text-slate-600">
              <input
                type="checkbox"
                className="h-4 w-4 accent-indigo-600"
              />
              Remember me
            </label>

           
          </motion.div>

          {/* Login */}
          <motion.div variants={item}>
            <button
              type="submit"
              disabled={loading}
              className="group flex h-14 w-full items-center justify-center rounded-xl bg-slate-900 text-sm font-bold uppercase tracking-[0.15em] text-white transition-all hover:bg-slate-800 hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-70"
            >
              {loading ? "Signing In..." : "Sign In"}

              {!loading && (
                <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
              )}
            </button>
          </motion.div>

          <motion.p
            variants={item}
            className="text-center text-sm text-slate-500"
          >
            Need an account?{" "}
            <a
              href="https://wa.me/8999901788?text=Naryam%20Aluminium%20Ticket"
              className="font-medium text-slate-900 underline decoration-slate-300 underline-offset-4 hover:text-indigo-600"
            >
              Contact Developer
            </a>
          </motion.p>
        </form>

        {/* Footer */}
        <motion.div
          variants={item}
          className="mt-12 flex items-center justify-between border-t border-slate-100 pt-6 font-mono text-[10px] uppercase tracking-[0.2em] text-slate-400"
        >
          <span>© 2026 DeepByte Solutions</span>
          <span>Secured Businees Management</span>
        </motion.div>
      </motion.div>
    </div>
  );
}