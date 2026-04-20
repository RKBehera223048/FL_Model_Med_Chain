"use client";

import React, { useEffect, useState, useCallback } from "react";
import { motion } from "framer-motion";
import { useAuth } from "@/lib/auth";
import { api } from "@/lib/api";
import { useDropzone } from "react-dropzone";
import {
  Building2,
  Upload,
  Users,
  Zap,
  Plus,
  FileSpreadsheet,
  CheckCircle2,
  Loader2,
  X,
  Stethoscope,
  Database,
  UserPlus,
  FileUp,
  Image as ImageIcon,
} from "lucide-react";

export default function HospitalDashboard() {
  const { token, user } = useAuth();
  const [dashboard, setDashboard] = useState<{
    hospital: { id: string; name: string; code: string; city: string; compute_credits: number; datasets_uploaded: number; is_connected: boolean };
    total_doctors: number; total_predictions: number; recent_predictions: number;
  } | null>(null);
  const [doctors, setDoctors] = useState<Array<{ id: string; email: string; full_name: string; is_active: boolean; created_at: string }>>([]);
  const [loading, setLoading] = useState(true);
  const [showAddDoctor, setShowAddDoctor] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadResult, setUploadResult] = useState<string | null>(null);
  const [doctorForm, setDoctorForm] = useState({ email: "", full_name: "", password: "" });

  const fetchData = async () => {
    if (!token) return;
    try {
      const [d, docs] = await Promise.all([
        api.getHospitalDashboard(token),
        api.getDoctors(token),
      ]);
      setDashboard(d);
      setDoctors(docs);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, [token]);

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    if (!token || acceptedFiles.length === 0) return;
    setUploading(true);
    setUploadResult(null);
    try {
      const result = await api.uploadDataset(token, acceptedFiles[0]);
      setUploadResult(`✓ Uploaded "${result.filename}" (${(result.size_bytes / 1024).toFixed(1)} KB). Total datasets: ${result.total_datasets}`);
      fetchData();
    } catch (err: unknown) {
      setUploadResult(`✗ ${err instanceof Error ? err.message : "Upload failed"}`);
    } finally {
      setUploading(false);
    }
  }, [token]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "text/csv": [".csv"],
      "image/*": [".png", ".jpg", ".jpeg", ".tiff"],
    },
    maxFiles: 1,
  });

  const handleAddDoctor = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;
    try {
      await api.createDoctor(token, doctorForm);
      setDoctorForm({ email: "", full_name: "", password: "" });
      setShowAddDoctor(false);
      fetchData();
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : "Failed");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 text-teal-500 animate-spin" />
      </div>
    );
  }

  const hospital = dashboard?.hospital;

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div>
        <h1 className="font-heading text-2xl md:text-3xl font-bold text-white">
          {hospital?.name || "Hospital"} Dashboard
        </h1>
        <p className="text-slate-400 text-sm mt-1">
          Code: <span className="font-mono text-teal-400">{hospital?.code}</span> · {hospital?.city}
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { icon: Zap, label: "Compute Credits", value: hospital?.compute_credits.toFixed(1) || "0", color: "text-yellow-400", bg: "bg-yellow-500/10" },
          { icon: Database, label: "Datasets Uploaded", value: hospital?.datasets_uploaded || 0, color: "text-teal-400", bg: "bg-teal-500/10" },
          { icon: Users, label: "Doctors", value: dashboard?.total_doctors || 0, color: "text-primary-400", bg: "bg-primary-500/10" },
          { icon: Stethoscope, label: "Predictions Made", value: dashboard?.total_predictions || 0, color: "text-green-400", bg: "bg-green-500/10" },
        ].map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="glass rounded-2xl p-5"
          >
            <div className={`w-10 h-10 rounded-xl ${stat.bg} flex items-center justify-center mb-3`}>
              <stat.icon className={`w-5 h-5 ${stat.color}`} />
            </div>
            <div className="font-heading text-2xl font-bold text-white">{stat.value}</div>
            <div className="text-sm text-slate-400">{stat.label}</div>
          </motion.div>
        ))}
      </div>

      {/* Upload & Doctors Grid */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Data Upload */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="glass rounded-2xl p-6"
          id="upload"
        >
          <div className="flex items-center gap-2 mb-4">
            <Upload className="w-5 h-5 text-teal-400" />
            <h2 className="font-heading text-lg font-semibold text-white">Upload Local Dataset</h2>
          </div>
          <p className="text-sm text-slate-400 mb-4">
            Upload CBC data (CSV) or blood smear images for local FL training. Data stays on your node.
          </p>

          <div
            {...getRootProps()}
            className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all duration-300 ${
              isDragActive
                ? "border-teal-400 bg-teal-500/5"
                : "border-slate-700 hover:border-slate-500 hover:bg-slate-800/30"
            }`}
          >
            <input {...getInputProps()} />
            {uploading ? (
              <Loader2 className="w-8 h-8 text-teal-400 mx-auto animate-spin" />
            ) : (
              <>
                <FileUp className="w-10 h-10 text-slate-500 mx-auto mb-3" />
                <p className="text-sm text-slate-300 mb-1">
                  {isDragActive ? "Drop file here..." : "Drag & drop or click to upload"}
                </p>
                <p className="text-xs text-slate-500">Supports CSV, PNG, JPG, TIFF</p>
              </>
            )}
          </div>

          {uploadResult && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className={`mt-3 p-3 rounded-lg text-sm ${
                uploadResult.startsWith("✓")
                  ? "bg-green-500/10 border border-green-500/20 text-green-400"
                  : "bg-red-500/10 border border-red-500/20 text-red-400"
              }`}
            >
              {uploadResult}
            </motion.div>
          )}
        </motion.div>

        {/* Doctor Management */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="glass rounded-2xl p-6"
          id="doctors"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Users className="w-5 h-5 text-primary-400" />
              <h2 className="font-heading text-lg font-semibold text-white">Doctors & Staff</h2>
            </div>
            <button
              onClick={() => setShowAddDoctor(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary-500/10 text-primary-400 text-xs font-medium hover:bg-primary-500/20 transition-all"
            >
              <Plus className="w-3 h-3" /> Add
            </button>
          </div>

          {doctors.length > 0 ? (
            <div className="space-y-2">
              {doctors.map((doc) => (
                <div key={doc.id} className="flex items-center justify-between p-3 rounded-xl bg-slate-800/30 hover:bg-slate-800/50 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary-500/20 to-teal-500/20 flex items-center justify-center">
                      <Stethoscope className="w-4 h-4 text-primary-400" />
                    </div>
                    <div>
                      <p className="text-sm text-white font-medium">{doc.full_name}</p>
                      <p className="text-xs text-slate-500">{doc.email}</p>
                    </div>
                  </div>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${doc.is_active ? "bg-green-500/10 text-green-400" : "bg-slate-500/10 text-slate-400"}`}>
                    {doc.is_active ? "Active" : "Inactive"}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Users className="w-8 h-8 text-slate-600 mx-auto mb-2" />
              <p className="text-sm text-slate-500">No doctors added yet</p>
            </div>
          )}
        </motion.div>
      </div>

      {/* Add Doctor Modal */}
      {showAddDoctor && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="glass rounded-2xl p-6 w-full max-w-md"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-heading text-lg font-semibold text-white">Add Doctor / Nurse</h3>
              <button onClick={() => setShowAddDoctor(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleAddDoctor} className="space-y-3">
              <input placeholder="Full Name" value={doctorForm.full_name} onChange={e => setDoctorForm({ ...doctorForm, full_name: e.target.value })} required className="w-full px-4 py-2.5 rounded-xl bg-slate-800/50 border border-slate-700/50 text-white text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/40" />
              <input placeholder="Email" type="email" value={doctorForm.email} onChange={e => setDoctorForm({ ...doctorForm, email: e.target.value })} required className="w-full px-4 py-2.5 rounded-xl bg-slate-800/50 border border-slate-700/50 text-white text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/40" />
              <input placeholder="Password" type="password" value={doctorForm.password} onChange={e => setDoctorForm({ ...doctorForm, password: e.target.value })} required className="w-full px-4 py-2.5 rounded-xl bg-slate-800/50 border border-slate-700/50 text-white text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/40" />
              <button type="submit" className="w-full py-2.5 rounded-xl bg-gradient-to-r from-teal-600 to-teal-500 text-white font-medium text-sm hover:shadow-lg transition-all flex items-center justify-center gap-2">
                <UserPlus className="w-4 h-4" /> Create Account
              </button>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
}
