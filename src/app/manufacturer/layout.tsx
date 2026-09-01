"use client";

import { useState } from "react";
import Sidebar from "@/app/component/manufacture-sidebar";
import Navbar from "@/app/component/manufacture-navbar";

export default function StoreLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  return (
    <div 
      className="
        flex h-screen overflow-hidden bg-slate-50 
        bg-[linear-gradient(to_right,rgba(148,163,184,0.15)_1px,transparent_1px),linear-gradient(to_bottom,rgba(148,163,184,0.15)_1px,transparent_1px)] 
        bg-[size:50px_50px]
      "
    >
      <Sidebar
        isMobileOpen={isMobileOpen}
        onCloseMobile={() => setIsMobileOpen(false)}
      />

      <div className="flex min-w-0 flex-1 flex-col">
        <Navbar onMenuClick={() => setIsMobileOpen(true)} />

        <main className="min-h-0 flex-1 overflow-y-auto overflow-x-hidden">
          <div className="mx-auto max-w-7xl p-6 lg:p-3">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}