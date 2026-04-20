"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/lib/auth";
import { motion, AnimatePresence } from "framer-motion";
import {
  HeartPulse,
  LayoutDashboard,
  Upload,
  Users,
  Zap,
  LogOut,
  User,
  Loader2,
} from "lucide-react";

const navItems = [
  { href: "/hospital", icon: LayoutDashboard, label: "Dashboard" },
  { href: "/hospital#upload", icon: Upload, label: "Data Upload" },
  { href: "/hospital#doctors", icon: Users, label: "Manage Doctors" },
  { href: "/hospital#credits", icon: Zap, label: "Credits" },
];

export default function HospitalLayout({ children }: { children: React.ReactNode }) {
  const { user, isLoading, logout } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && (!user || user.role !== "HOSPITAL_ADMIN")) {
      router.push("/login");
    }
  }, [user, isLoading, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-teal-500 animate-spin" />
      </div>
    );
  }

  if (!user || user.role !== "HOSPITAL_ADMIN") return null;

  return (
    <div className="min-h-screen bg-slate-950 bg-grid flex">
      {/* Sidebar */}
      <aside className="hidden lg:flex w-64 flex-col fixed inset-y-0 left-0 glass border-r border-slate-800/50 z-40">
        <div className="flex items-center gap-2.5 px-6 h-16 border-b border-slate-800/50">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-teal-500 to-primary-500 flex items-center justify-center">
            <HeartPulse className="w-4 h-4 text-white" />
          </div>
          <div>
            <span className="font-heading font-bold text-white text-sm block">MedChain-FL</span>
            <span className="text-xs text-teal-400 truncate block max-w-[160px]">{user.hospital_name}</span>
          </div>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-1">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-slate-400 hover:text-white hover:bg-slate-800/50 transition-all duration-200 group"
            >
              <item.icon className="w-4 h-4 group-hover:text-teal-400 transition-colors" />
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="px-3 pb-4 border-t border-slate-800/50 pt-4">
          <div className="flex items-center gap-3 px-3 mb-3">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-teal-500 to-primary-500 flex items-center justify-center">
              <User className="w-4 h-4 text-white" />
            </div>
            <div className="min-w-0">
              <p className="text-sm text-white font-medium truncate">{user.full_name}</p>
              <p className="text-xs text-slate-500 truncate">{user.email}</p>
            </div>
          </div>
          <button
            onClick={() => { logout(); router.push("/login"); }}
            className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-sm text-slate-400 hover:text-red-400 hover:bg-red-500/5 transition-all"
          >
            <LogOut className="w-4 h-4" /> Sign Out
          </button>
        </div>
      </aside>

      {/* Mobile header */}
      <div className="lg:hidden fixed top-0 inset-x-0 h-14 glass z-40 flex items-center justify-between px-4 border-b border-slate-800/50">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-teal-500 to-primary-500 flex items-center justify-center">
            <HeartPulse className="w-3.5 h-3.5 text-white" />
          </div>
          <span className="font-heading font-bold text-sm text-white">{user.hospital_name || "Hospital"}</span>
        </div>
        <button onClick={() => { logout(); router.push("/login"); }} className="text-slate-400 hover:text-red-400">
          <LogOut className="w-4 h-4" />
        </button>
      </div>

      {/* Main */}
      <main className="flex-1 lg:ml-64">
        <AnimatePresence mode="wait">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
            className="p-4 md:p-8 pt-18 lg:pt-8"
          >
            {children}
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  );
}
