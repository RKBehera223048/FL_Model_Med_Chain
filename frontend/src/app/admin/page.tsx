"use client";

import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useAuth } from "@/lib/auth";
import { api } from "@/lib/api";
import {
  Building2,
  Network,
  Zap,
  Activity,
  Plus,
  Play,
  TrendingUp,
  CheckCircle2,
  Clock,
  Loader2,
  X,
  Stethoscope,
  UserPlus,
} from "lucide-react";

/* ------------------------------------------------------------------ */
/* Stat Card                                                           */
/* ------------------------------------------------------------------ */
function StatCard({
  icon: Icon,
  label,
  value,
  sub,
  color,
  delay,
}: {
  icon: React.ElementType;
  label: string;
  value: string | number;
  sub?: string;
  color: string;
  delay: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      className="glass rounded-2xl p-6 group hover:border-slate-600/30 transition-all duration-300"
    >
      <div className="flex items-start justify-between mb-4">
        <div className={`w-10 h-10 rounded-xl bg-${color}-500/10 flex items-center justify-center`}>
          <Icon className={`w-5 h-5 text-${color}-400`} />
        </div>
        {sub && <span className="text-xs text-slate-500">{sub}</span>}
      </div>
      <div className="font-heading text-2xl font-bold text-white mb-1">{value}</div>
      <div className="text-sm text-slate-400">{label}</div>
    </motion.div>
  );
}

/* ------------------------------------------------------------------ */
/* FL Sync Visualizer                                                  */
/* ------------------------------------------------------------------ */
function FLSyncVisualizer({ rounds }: { rounds: Array<{ round_number: number; accuracy: number | null; loss: number | null; status: string }> }) {
  const recentRounds = rounds.slice(0, 8);
  const maxAccuracy = Math.max(...recentRounds.map(r => r.accuracy || 0), 1);

  return (
    <div className="space-y-3">
      <div className="flex items-end gap-1.5 h-32">
        {recentRounds.reverse().map((round, i) => {
          const height = round.accuracy ? (round.accuracy / maxAccuracy) * 100 : 10;
          return (
            <motion.div
              key={round.round_number}
              initial={{ height: 0 }}
              animate={{ height: `${height}%` }}
              transition={{ delay: i * 0.1, duration: 0.5, ease: "easeOut" }}
              className="flex-1 rounded-t-lg bg-gradient-to-t from-primary-600 to-teal-500 relative group cursor-pointer min-w-[20px]"
              title={`Round ${round.round_number}: ${(round.accuracy! * 100).toFixed(1)}%`}
            >
              <div className="absolute -top-8 left-1/2 -translate-x-1/2 hidden group-hover:block glass rounded-lg px-2 py-1 text-xs text-white whitespace-nowrap z-10">
                R{round.round_number}: {round.accuracy ? (round.accuracy * 100).toFixed(1) : 0}%
              </div>
            </motion.div>
          );
        })}
      </div>
      <div className="flex items-center justify-between text-xs text-slate-500">
        <span>Oldest</span>
        <span>Model Accuracy per Round →</span>
        <span>Latest</span>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Admin Dashboard Page                                                */
/* ------------------------------------------------------------------ */
export default function AdminDashboard() {
  const { token } = useAuth();
  const [stats, setStats] = useState<{ total_hospitals: number; connected_hospitals: number; total_fl_rounds: number; completed_fl_rounds: number; total_compute_credits: number; total_predictions: number } | null>(null);
  const [hospitals, setHospitals] = useState<Array<{ id: string; name: string; code: string; city: string; state: string; is_connected: boolean; compute_credits: number; datasets_uploaded: number }>>([]);
  const [flRounds, setFlRounds] = useState<Array<{ id: string; round_number: number; status: string; participating_hospitals: number; accuracy: number | null; loss: number | null; started_at: string; completed_at: string | null }>>([]);
  const [showAddHospital, setShowAddHospital] = useState(false);
  const [showAddAdmin, setShowAddAdmin] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [startingRound, setStartingRound] = useState(false);

  // Form state
  const [form, setForm] = useState({ name: "", code: "", city: "", state: "" });
  const [adminForm, setAdminForm] = useState({ email: "", full_name: "", password: "" });

  const fetchData = async () => {
    if (!token) return;
    try {
      const [s, h, r] = await Promise.all([
        api.getAdminDashboard(token),
        api.getHospitals(token),
        api.getFLRounds(token),
      ]);
      setStats(s);
      setHospitals(h);
      setFlRounds(r);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, [token]);

  const handleAddHospital = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;
    try {
      await api.createHospital(token, form);
      setForm({ name: "", code: "", city: "", state: "" });
      setShowAddHospital(false);
      fetchData();
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : "Failed");
    }
  };

  const handleAddAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token || !showAddAdmin) return;
    try {
      await api.createHospitalAdmin(token, showAddAdmin, adminForm);
      setAdminForm({ email: "", full_name: "", password: "" });
      setShowAddAdmin(null);
      alert("Hospital admin created successfully!");
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : "Failed");
    }
  };

  const handleStartRound = async () => {
    if (!token) return;
    setStartingRound(true);
    try {
      await api.startFLRound(token);
      fetchData();
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : "Failed");
    } finally {
      setStartingRound(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 text-primary-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-heading text-2xl md:text-3xl font-bold text-white">
            Global Command Center
          </h1>
          <p className="text-slate-400 text-sm mt-1">Manage the MedChain-FL federated network</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => setShowAddHospital(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-teal-500/10 border border-teal-500/20 text-teal-400 text-sm font-medium hover:bg-teal-500/20 transition-all"
          >
            <Plus className="w-4 h-4" /> Add Hospital
          </button>
          <button
            onClick={handleStartRound}
            disabled={startingRound}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-primary-600 to-primary-500 text-white text-sm font-medium hover:shadow-lg hover:shadow-primary-500/25 transition-all disabled:opacity-60"
          >
            {startingRound ? <Loader2 className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />}
            Start FL Round
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      {stats && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard icon={Building2} label="Total Hospitals" value={stats.total_hospitals} sub={`${stats.connected_hospitals} online`} color="primary" delay={0} />
          <StatCard icon={Network} label="FL Rounds" value={stats.total_fl_rounds} sub={`${stats.completed_fl_rounds} completed`} color="teal" delay={0.1} />
          <StatCard icon={Zap} label="Compute Credits" value={stats.total_compute_credits.toFixed(1)} color="yellow" delay={0.2} />
          <StatCard icon={Stethoscope} label="Total Predictions" value={stats.total_predictions} color="green" delay={0.3} />
        </div>
      )}

      {/* FL Training Progress */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="glass rounded-2xl p-6"
        id="fl-rounds"
      >
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="font-heading text-lg font-semibold text-white">FL Training Progress</h2>
            <p className="text-sm text-slate-400">Model accuracy across training rounds</p>
          </div>
          <div className="flex items-center gap-2 text-xs text-teal-400">
            <TrendingUp className="w-3.5 h-3.5" />
            Improving
          </div>
        </div>
        {flRounds.length > 0 ? (
          <FLSyncVisualizer rounds={flRounds} />
        ) : (
          <p className="text-slate-500 text-sm text-center py-8">No FL rounds yet. Start one above.</p>
        )}
      </motion.div>

      {/* Hospitals Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="glass rounded-2xl p-6"
        id="hospitals"
      >
        <h2 className="font-heading text-lg font-semibold text-white mb-4">Connected Hospital Nodes</h2>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-800">
                <th className="text-left py-3 px-4 text-xs text-slate-500 font-medium uppercase tracking-wider">Hospital</th>
                <th className="text-left py-3 px-4 text-xs text-slate-500 font-medium uppercase tracking-wider">Code</th>
                <th className="text-left py-3 px-4 text-xs text-slate-500 font-medium uppercase tracking-wider">Location</th>
                <th className="text-left py-3 px-4 text-xs text-slate-500 font-medium uppercase tracking-wider">Status</th>
                <th className="text-left py-3 px-4 text-xs text-slate-500 font-medium uppercase tracking-wider">Credits</th>
                <th className="text-left py-3 px-4 text-xs text-slate-500 font-medium uppercase tracking-wider">Datasets</th>
                <th className="text-left py-3 px-4 text-xs text-slate-500 font-medium uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody>
              {hospitals.map((h) => (
                <tr key={h.id} className="border-b border-slate-800/50 hover:bg-slate-800/20 transition-colors">
                  <td className="py-3 px-4 text-sm text-white font-medium">{h.name}</td>
                  <td className="py-3 px-4 text-sm text-slate-400 font-mono">{h.code}</td>
                  <td className="py-3 px-4 text-sm text-slate-400">{h.city}, {h.state}</td>
                  <td className="py-3 px-4">
                    <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium ${h.is_connected ? "bg-green-500/10 text-green-400" : "bg-slate-500/10 text-slate-400"}`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${h.is_connected ? "bg-green-400 pulse-dot" : "bg-slate-500"}`} />
                      {h.is_connected ? "Online" : "Offline"}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-sm text-teal-400 font-medium">{h.compute_credits.toFixed(1)}</td>
                  <td className="py-3 px-4 text-sm text-slate-400">{h.datasets_uploaded}</td>
                  <td className="py-3 px-4">
                    <button
                      onClick={() => setShowAddAdmin(h.id)}
                      className="text-xs text-primary-400 hover:text-primary-300 flex items-center gap-1"
                    >
                      <UserPlus className="w-3 h-3" /> Add Admin
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>

      {/* FL Rounds Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="glass rounded-2xl p-6"
      >
        <h2 className="font-heading text-lg font-semibold text-white mb-4">Training Round History</h2>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-800">
                <th className="text-left py-3 px-4 text-xs text-slate-500 font-medium uppercase tracking-wider">Round</th>
                <th className="text-left py-3 px-4 text-xs text-slate-500 font-medium uppercase tracking-wider">Status</th>
                <th className="text-left py-3 px-4 text-xs text-slate-500 font-medium uppercase tracking-wider">Participants</th>
                <th className="text-left py-3 px-4 text-xs text-slate-500 font-medium uppercase tracking-wider">Accuracy</th>
                <th className="text-left py-3 px-4 text-xs text-slate-500 font-medium uppercase tracking-wider">Loss</th>
              </tr>
            </thead>
            <tbody>
              {flRounds.map((r) => (
                <tr key={r.id} className="border-b border-slate-800/50 hover:bg-slate-800/20 transition-colors">
                  <td className="py-3 px-4 text-sm text-white font-medium">Round #{r.round_number}</td>
                  <td className="py-3 px-4">
                    <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium ${r.status === "COMPLETED" ? "bg-green-500/10 text-green-400" : "bg-yellow-500/10 text-yellow-400"}`}>
                      {r.status === "COMPLETED" ? <CheckCircle2 className="w-3 h-3" /> : <Clock className="w-3 h-3" />}
                      {r.status}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-sm text-slate-400">{r.participating_hospitals} hospitals</td>
                  <td className="py-3 px-4 text-sm text-teal-400 font-medium">{r.accuracy ? (r.accuracy * 100).toFixed(2) + "%" : "—"}</td>
                  <td className="py-3 px-4 text-sm text-slate-400">{r.loss ? r.loss.toFixed(4) : "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>

      {/* =========== MODALS =========== */}

      {/* Add Hospital Modal */}
      {showAddHospital && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="glass rounded-2xl p-6 w-full max-w-md"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-heading text-lg font-semibold text-white">Register Hospital</h3>
              <button onClick={() => setShowAddHospital(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleAddHospital} className="space-y-3">
              <input placeholder="Hospital Name" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required className="w-full px-4 py-2.5 rounded-xl bg-slate-800/50 border border-slate-700/50 text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/40" />
              <input placeholder="Code (e.g., AIIMS-DEL)" value={form.code} onChange={e => setForm({ ...form, code: e.target.value })} required className="w-full px-4 py-2.5 rounded-xl bg-slate-800/50 border border-slate-700/50 text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/40" />
              <input placeholder="City" value={form.city} onChange={e => setForm({ ...form, city: e.target.value })} required className="w-full px-4 py-2.5 rounded-xl bg-slate-800/50 border border-slate-700/50 text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/40" />
              <input placeholder="State" value={form.state} onChange={e => setForm({ ...form, state: e.target.value })} required className="w-full px-4 py-2.5 rounded-xl bg-slate-800/50 border border-slate-700/50 text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/40" />
              <button type="submit" className="w-full py-2.5 rounded-xl bg-gradient-to-r from-teal-600 to-teal-500 text-white font-medium text-sm hover:shadow-lg transition-all flex items-center justify-center gap-2">
                <Building2 className="w-4 h-4" /> Register Hospital
              </button>
            </form>
          </motion.div>
        </div>
      )}

      {/* Add Hospital Admin Modal */}
      {showAddAdmin && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="glass rounded-2xl p-6 w-full max-w-md"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-heading text-lg font-semibold text-white">Create Hospital Admin</h3>
              <button onClick={() => setShowAddAdmin(null)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleAddAdmin} className="space-y-3">
              <input placeholder="Full Name" value={adminForm.full_name} onChange={e => setAdminForm({ ...adminForm, full_name: e.target.value })} required className="w-full px-4 py-2.5 rounded-xl bg-slate-800/50 border border-slate-700/50 text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/40" />
              <input placeholder="Email" type="email" value={adminForm.email} onChange={e => setAdminForm({ ...adminForm, email: e.target.value })} required className="w-full px-4 py-2.5 rounded-xl bg-slate-800/50 border border-slate-700/50 text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/40" />
              <input placeholder="Password" type="password" value={adminForm.password} onChange={e => setAdminForm({ ...adminForm, password: e.target.value })} required className="w-full px-4 py-2.5 rounded-xl bg-slate-800/50 border border-slate-700/50 text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/40" />
              <button type="submit" className="w-full py-2.5 rounded-xl bg-gradient-to-r from-primary-600 to-primary-500 text-white font-medium text-sm hover:shadow-lg transition-all flex items-center justify-center gap-2">
                <UserPlus className="w-4 h-4" /> Create Admin Account
              </button>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
}
