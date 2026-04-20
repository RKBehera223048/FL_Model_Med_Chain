"use client";

import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useAuth } from "@/lib/auth";
import { api } from "@/lib/api";
import {
  Stethoscope,
  Activity,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Loader2,
  FlaskConical,
  Send,
  History,
  User as UserIcon,
  Info,
} from "lucide-react";

/* ------------------------------------------------------------------ */
/* Risk Gauge Component                                                */
/* ------------------------------------------------------------------ */
function RiskGauge({ score, level }: { score: number; level: string }) {
  const circumference = 2 * Math.PI * 58;
  const progress = (score / 100) * circumference;

  const colorMap: Record<string, { stroke: string; text: string; bg: string }> = {
    LOW: { stroke: "#10b981", text: "text-green-400", bg: "bg-green-500/10" },
    MODERATE: { stroke: "#f59e0b", text: "text-yellow-400", bg: "bg-yellow-500/10" },
    HIGH: { stroke: "#f97316", text: "text-orange-400", bg: "bg-orange-500/10" },
    CRITICAL: { stroke: "#ef4444", text: "text-red-400", bg: "bg-red-500/10" },
  };
  const c = colorMap[level] || colorMap.LOW;

  return (
    <div className="flex flex-col items-center">
      <div className="relative w-36 h-36">
        <svg className="w-full h-full -rotate-90" viewBox="0 0 128 128">
          <circle cx="64" cy="64" r="58" fill="none" stroke="rgba(148,163,184,0.1)" strokeWidth="8" />
          <motion.circle
            cx="64" cy="64" r="58"
            fill="none"
            stroke={c.stroke}
            strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset: circumference - progress }}
            transition={{ duration: 1.5, ease: "easeOut" }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <motion.span
            className="font-heading text-3xl font-bold text-white"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            {score.toFixed(0)}%
          </motion.span>
        </div>
      </div>
      <motion.span
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8 }}
        className={`mt-3 px-4 py-1 rounded-full text-sm font-semibold ${c.text} ${c.bg}`}
      >
        {level} RISK
      </motion.span>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Doctor Page                                                         */
/* ------------------------------------------------------------------ */
export default function DoctorPage() {
  const { token, user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{
    risk_score: number; risk_level: string; diagnosis_notes: string;
  } | null>(null);
  const [history, setHistory] = useState<Array<{
    id: string; risk_score: number; risk_level: string; patient_name: string | null; hemoglobin: number; mcv: number; created_at: string;
  }>>([]);

  const [form, setForm] = useState({
    patient_name: "",
    patient_age: "",
    patient_gender: "Male",
    hemoglobin: "",
    mcv: "",
    mch: "",
    mchc: "",
    rbc_count: "",
    rdw: "",
    hba2: "",
    hbf: "",
  });

  const fetchHistory = async () => {
    if (!token) return;
    try {
      const h = await api.getPredictionHistory(token);
      setHistory(h);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => { fetchHistory(); }, [token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;
    setLoading(true);
    setResult(null);
    try {
      const res = await api.predict(token, {
        patient_name: form.patient_name || undefined,
        patient_age: form.patient_age ? parseInt(form.patient_age) : undefined,
        patient_gender: form.patient_gender || undefined,
        hemoglobin: parseFloat(form.hemoglobin),
        mcv: parseFloat(form.mcv),
        mch: parseFloat(form.mch),
        mchc: parseFloat(form.mchc),
        rbc_count: parseFloat(form.rbc_count),
        rdw: parseFloat(form.rdw),
        hba2: form.hba2 ? parseFloat(form.hba2) : undefined,
        hbf: form.hbf ? parseFloat(form.hbf) : undefined,
      });
      setResult({ risk_score: res.risk_score, risk_level: res.risk_level, diagnosis_notes: res.diagnosis_notes });
      fetchHistory();
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : "Prediction failed");
    } finally {
      setLoading(false);
    }
  };

  const cbcFields = [
    { key: "hemoglobin", label: "Hemoglobin (g/dL)", placeholder: "12.5", info: "Normal: 12-17.5" },
    { key: "mcv", label: "MCV (fL)", placeholder: "82", info: "Normal: 80-100" },
    { key: "mch", label: "MCH (pg)", placeholder: "28", info: "Normal: 27-33" },
    { key: "mchc", label: "MCHC (g/dL)", placeholder: "33", info: "Normal: 32-36" },
    { key: "rbc_count", label: "RBC Count (M/µL)", placeholder: "4.8", info: "Normal: 4.5-5.5" },
    { key: "rdw", label: "RDW (%)", placeholder: "13", info: "Normal: 11.5-14.5" },
  ];

  const optionalFields = [
    { key: "hba2", label: "HbA2 (%)", placeholder: "2.5", info: "Normal: 2-3.5%" },
    { key: "hbf", label: "HbF (%)", placeholder: "0.5", info: "Normal: <2%" },
  ];

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div>
        <h1 className="font-heading text-2xl md:text-3xl font-bold text-white flex items-center gap-3">
          <Stethoscope className="w-7 h-7 text-primary-400" />
          Thalassemia Risk Assessment
        </h1>
        <p className="text-slate-400 text-sm mt-1">
          Enter CBC parameters to get an AI-assisted Thalassemia risk prediction
        </p>
      </div>

      <div className="grid lg:grid-cols-5 gap-6">
        {/* Input Form — 3 cols */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="lg:col-span-3 glass rounded-2xl p-6"
        >
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Patient Info */}
            <div>
              <h3 className="text-sm font-medium text-slate-300 mb-3 flex items-center gap-2">
                <UserIcon className="w-4 h-4 text-slate-500" /> Patient Information (Optional)
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <input
                  placeholder="Patient Name"
                  value={form.patient_name}
                  onChange={e => setForm({ ...form, patient_name: e.target.value })}
                  className="px-4 py-2.5 rounded-xl bg-slate-800/50 border border-slate-700/50 text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/40 placeholder-slate-500"
                />
                <input
                  placeholder="Age"
                  type="number"
                  value={form.patient_age}
                  onChange={e => setForm({ ...form, patient_age: e.target.value })}
                  className="px-4 py-2.5 rounded-xl bg-slate-800/50 border border-slate-700/50 text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/40 placeholder-slate-500"
                />
                <select
                  value={form.patient_gender}
                  onChange={e => setForm({ ...form, patient_gender: e.target.value })}
                  className="px-4 py-2.5 rounded-xl bg-slate-800/50 border border-slate-700/50 text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/40"
                >
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>
            </div>

            {/* CBC Parameters */}
            <div>
              <h3 className="text-sm font-medium text-slate-300 mb-3 flex items-center gap-2">
                <FlaskConical className="w-4 h-4 text-teal-400" /> CBC Parameters (Required)
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {cbcFields.map((field) => (
                  <div key={field.key} className="relative group">
                    <label className="block text-xs text-slate-500 mb-1">{field.label}</label>
                    <input
                      type="number"
                      step="any"
                      placeholder={field.placeholder}
                      value={form[field.key as keyof typeof form]}
                      onChange={e => setForm({ ...form, [field.key]: e.target.value })}
                      required
                      className="w-full px-4 py-2.5 rounded-xl bg-slate-800/50 border border-slate-700/50 text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/40 placeholder-slate-600"
                    />
                    <span className="absolute right-3 top-7 text-[10px] text-slate-600 hidden group-hover:block">
                      {field.info}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Optional Parameters */}
            <div>
              <h3 className="text-sm font-medium text-slate-300 mb-3 flex items-center gap-2">
                <Info className="w-4 h-4 text-slate-500" /> Additional Parameters (Optional — improves accuracy)
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {optionalFields.map((field) => (
                  <div key={field.key}>
                    <label className="block text-xs text-slate-500 mb-1">{field.label}</label>
                    <input
                      type="number"
                      step="any"
                      placeholder={field.placeholder}
                      value={form[field.key as keyof typeof form]}
                      onChange={e => setForm({ ...form, [field.key]: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-xl bg-slate-800/50 border border-slate-700/50 text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/40 placeholder-slate-600"
                    />
                  </div>
                ))}
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-primary-600 to-teal-600 text-white font-semibold text-sm hover:shadow-xl hover:shadow-primary-500/20 transition-all disabled:opacity-60 flex items-center justify-center gap-2"
            >
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  <Send className="w-4 h-4" /> Run Prediction
                </>
              )}
            </button>
          </form>
        </motion.div>

        {/* Results Panel — 2 cols */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="lg:col-span-2 glass rounded-2xl p-6 flex flex-col items-center justify-center min-h-[400px]"
        >
          {result ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center space-y-6 w-full"
            >
              <h3 className="font-heading text-lg font-semibold text-white">Prediction Result</h3>
              <RiskGauge score={result.risk_score} level={result.risk_level} />
              <div className="glass-light rounded-xl p-4 text-left">
                <h4 className="text-xs text-slate-400 uppercase tracking-wider mb-2">Clinical Notes</h4>
                <p className="text-sm text-slate-300 leading-relaxed">{result.diagnosis_notes}</p>
              </div>
              <p className="text-xs text-slate-600 flex items-center justify-center gap-1">
                <AlertTriangle className="w-3 h-3" />
                AI-assisted screening only. Clinical confirmation required.
              </p>
            </motion.div>
          ) : (
            <div className="text-center">
              <Activity className="w-12 h-12 text-slate-700 mx-auto mb-3" />
              <p className="text-slate-500 text-sm">Enter CBC parameters and run prediction</p>
              <p className="text-slate-600 text-xs mt-1">Results will appear here</p>
            </div>
          )}
        </motion.div>
      </div>

      {/* History */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="glass rounded-2xl p-6"
        id="history"
      >
        <div className="flex items-center gap-2 mb-4">
          <History className="w-5 h-5 text-primary-400" />
          <h2 className="font-heading text-lg font-semibold text-white">Prediction History</h2>
        </div>
        {history.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-800">
                  <th className="text-left py-3 px-4 text-xs text-slate-500 font-medium uppercase">Patient</th>
                  <th className="text-left py-3 px-4 text-xs text-slate-500 font-medium uppercase">Hb</th>
                  <th className="text-left py-3 px-4 text-xs text-slate-500 font-medium uppercase">MCV</th>
                  <th className="text-left py-3 px-4 text-xs text-slate-500 font-medium uppercase">Risk</th>
                  <th className="text-left py-3 px-4 text-xs text-slate-500 font-medium uppercase">Level</th>
                  <th className="text-left py-3 px-4 text-xs text-slate-500 font-medium uppercase">Date</th>
                </tr>
              </thead>
              <tbody>
                {history.map((p) => {
                  const levelColor: Record<string, string> = {
                    LOW: "text-green-400 bg-green-500/10",
                    MODERATE: "text-yellow-400 bg-yellow-500/10",
                    HIGH: "text-orange-400 bg-orange-500/10",
                    CRITICAL: "text-red-400 bg-red-500/10",
                  };
                  return (
                    <tr key={p.id} className="border-b border-slate-800/50 hover:bg-slate-800/20 transition-colors">
                      <td className="py-3 px-4 text-sm text-white">{p.patient_name || "—"}</td>
                      <td className="py-3 px-4 text-sm text-slate-400">{p.hemoglobin}</td>
                      <td className="py-3 px-4 text-sm text-slate-400">{p.mcv}</td>
                      <td className="py-3 px-4 text-sm text-white font-medium">{p.risk_score.toFixed(1)}%</td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${levelColor[p.risk_level] || ""}`}>
                          {p.risk_level}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-sm text-slate-500">
                        {new Date(p.created_at).toLocaleDateString()}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-slate-500 text-sm text-center py-8">No predictions yet. Run your first diagnosis above.</p>
        )}
      </motion.div>
    </div>
  );
}
