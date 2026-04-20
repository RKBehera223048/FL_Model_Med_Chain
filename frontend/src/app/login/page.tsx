"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/lib/auth";
import {
  HeartPulse,
  Mail,
  Lock,
  ArrowRight,
  Loader2,
  AlertCircle,
  Shield,
  Building2,
  Stethoscope,
} from "lucide-react";

const roleRoutes: Record<string, string> = {
  GLOBAL_ADMIN: "/admin",
  HOSPITAL_ADMIN: "/hospital",
  DOCTOR: "/doctor",
};

const demoCredentials = [
  {
    label: "Global Admin",
    email: "admin@medchain.in",
    password: "MedChain@2026",
    icon: Shield,
    color: "from-primary-500 to-primary-600",
  },
  {
    label: "Hospital Admin",
    email: "admin@aiimsdel.medchain.in",
    password: "Hospital@2026",
    icon: Building2,
    color: "from-teal-500 to-teal-600",
  },
  {
    label: "Doctor",
    email: "dr.sharma@medchain.in",
    password: "Doctor@2026",
    icon: Stethoscope,
    color: "from-indigo-500 to-indigo-600",
  },
];

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const { role } = await login(email, password);
      router.push(roleRoutes[role] || "/");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Login failed");
    } finally {
      setLoading(false);
    }
  };

  const fillCredentials = (cred: { email: string; password: string }) => {
    setEmail(cred.email);
    setPassword(cred.password);
    setError("");
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12 bg-slate-950 bg-grid relative">
      {/* Background effects */}
      <div className="fixed top-1/4 left-1/4 w-[500px] h-[500px] bg-primary-500/5 rounded-full blur-[120px] pointer-events-none" />
      <div className="fixed bottom-1/4 right-1/4 w-[400px] h-[400px] bg-teal-500/5 rounded-full blur-[100px] pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-md"
      >
        {/* Logo */}
        <Link href="/" className="flex items-center justify-center gap-2 mb-8">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500 to-teal-500 flex items-center justify-center">
            <HeartPulse className="w-5 h-5 text-white" />
          </div>
          <span className="font-heading font-bold text-xl text-white">
            MedChain<span className="text-teal-400">-FL</span>
          </span>
        </Link>

        {/* Login Card */}
        <div className="glass rounded-2xl p-8">
          <div className="text-center mb-6">
            <h1 className="font-heading text-2xl font-bold text-white mb-1">Welcome Back</h1>
            <p className="text-slate-400 text-sm">Sign in to your MedChain-FL account</p>
          </div>

          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center gap-2 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm mb-4"
            >
              <AlertCircle className="w-4 h-4 shrink-0" />
              {error}
            </motion.div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-sm text-slate-400 mb-1.5" htmlFor="login-email">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input
                  id="login-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@hospital.in"
                  required
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-800/50 border border-slate-700/50 text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/40 focus:border-primary-500/40 transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm text-slate-400 mb-1.5" htmlFor="login-password">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input
                  id="login-password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-800/50 border border-slate-700/50 text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/40 focus:border-primary-500/40 transition-all"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 rounded-xl bg-gradient-to-r from-primary-600 to-primary-500 text-white font-medium text-sm hover:shadow-lg hover:shadow-primary-500/25 transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-60"
            >
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  Sign In <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        </div>

        {/* Quick Demo Credentials */}
        <div className="mt-6">
          <p className="text-center text-slate-500 text-xs mb-3">Quick Access — Demo Credentials</p>
          <div className="grid grid-cols-3 gap-2">
            {demoCredentials.map((cred) => (
              <motion.button
                key={cred.label}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => fillCredentials(cred)}
                className="glass rounded-xl p-3 text-center group hover:border-primary-500/30 transition-all duration-300"
              >
                <div className={`w-8 h-8 mx-auto rounded-lg bg-gradient-to-br ${cred.color} flex items-center justify-center mb-2 opacity-70 group-hover:opacity-100 transition-opacity`}>
                  <cred.icon className="w-4 h-4 text-white" />
                </div>
                <span className="text-xs text-slate-400 group-hover:text-slate-200 transition-colors">
                  {cred.label}
                </span>
              </motion.button>
            ))}
          </div>
        </div>
      </motion.div>
    </div>
  );
}
