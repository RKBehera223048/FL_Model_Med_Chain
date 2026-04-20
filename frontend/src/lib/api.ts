const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

interface FetchOptions extends RequestInit {
  token?: string;
}

async function request<T>(endpoint: string, options: FetchOptions = {}): Promise<T> {
  const { token, headers: customHeaders, ...rest } = options;

  const headers: Record<string, string> = {
    ...((customHeaders as Record<string, string>) || {}),
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  // Only set Content-Type for non-FormData requests
  if (!(rest.body instanceof FormData)) {
    headers["Content-Type"] = "application/json";
  }

  const res = await fetch(`${API_BASE}${endpoint}`, {
    ...rest,
    headers,
  });

  if (!res.ok) {
    const error = await res.json().catch(() => ({ detail: "Request failed" }));
    throw new Error(error.detail || `HTTP ${res.status}`);
  }

  return res.json();
}

export const api = {
  // Auth
  login: (email: string, password: string) =>
    request<{ access_token: string; role: string; hospital_id: string | null }>(
      "/api/auth/login",
      { method: "POST", body: JSON.stringify({ email, password }) }
    ),

  getProfile: (token: string) =>
    request<{
      id: string; email: string; full_name: string; role: string;
      hospital_id: string | null; hospital_name: string | null; is_active: boolean;
    }>("/api/auth/me", { token }),

  // Admin
  getAdminDashboard: (token: string) =>
    request<{
      total_hospitals: number; connected_hospitals: number;
      total_fl_rounds: number; completed_fl_rounds: number;
      total_compute_credits: number; total_predictions: number;
    }>("/api/admin/dashboard", { token }),

  getHospitals: (token: string) =>
    request<Array<{
      id: string; name: string; code: string; city: string; state: string;
      is_connected: boolean; compute_credits: number; datasets_uploaded: number; created_at: string;
    }>>("/api/admin/hospitals", { token }),

  createHospital: (token: string, data: { name: string; code: string; city: string; state: string }) =>
    request("/api/admin/hospitals", { method: "POST", token, body: JSON.stringify(data) }),

  createHospitalAdmin: (token: string, hospitalId: string, data: { email: string; full_name: string; password: string }) =>
    request(`/api/admin/hospitals/${hospitalId}/create-admin`, { method: "POST", token, body: JSON.stringify(data) }),

  getFLRounds: (token: string) =>
    request<Array<{
      id: string; round_number: number; status: string; participating_hospitals: number;
      accuracy: number | null; loss: number | null; started_at: string; completed_at: string | null;
    }>>("/api/admin/fl-rounds", { token }),

  startFLRound: (token: string) =>
    request("/api/admin/fl-rounds/start", { method: "POST", token }),

  // Hospital
  getHospitalDashboard: (token: string) =>
    request<{
      hospital: { id: string; name: string; code: string; city: string; compute_credits: number; datasets_uploaded: number; is_connected: boolean };
      total_doctors: number; total_predictions: number; recent_predictions: number;
    }>("/api/hospital/dashboard", { token }),

  uploadDataset: (token: string, file: File) => {
    const formData = new FormData();
    formData.append("file", file);
    return request<{ message: string; filename: string; size_bytes: number; total_datasets: number }>(
      "/api/hospital/upload",
      { method: "POST", token, body: formData }
    );
  },

  getDoctors: (token: string) =>
    request<Array<{
      id: string; email: string; full_name: string; role: string; is_active: boolean; created_at: string;
    }>>("/api/hospital/users", { token }),

  createDoctor: (token: string, data: { email: string; full_name: string; password: string }) =>
    request("/api/hospital/users", { method: "POST", token, body: JSON.stringify(data) }),

  // Doctor
  predict: (token: string, data: {
    patient_name?: string; patient_age?: number; patient_gender?: string;
    hemoglobin: number; mcv: number; mch: number; mchc: number;
    rbc_count: number; rdw: number; hba2?: number; hbf?: number;
  }) =>
    request<{
      id: string; risk_score: number; risk_level: string; diagnosis_notes: string;
      patient_name: string | null; hemoglobin: number; mcv: number; mch: number;
      mchc: number; rbc_count: number; rdw: number; created_at: string;
    }>("/api/doctor/predict", { method: "POST", token, body: JSON.stringify(data) }),

  getPredictionHistory: (token: string) =>
    request<Array<{
      id: string; risk_score: number; risk_level: string; diagnosis_notes: string;
      patient_name: string | null; hemoglobin: number; mcv: number; created_at: string;
    }>>("/api/doctor/history", { token }),
};
