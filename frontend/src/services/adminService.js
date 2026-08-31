import api from "./api";

// Thin wrappers over /api/admin/*. All routes are auth + admin-only on the
// backend (verifyToken -> requireAdmin); the axios instance attaches the JWT.

function qs(params = {}) {
  const clean = Object.fromEntries(
    Object.entries(params).filter(
      ([, v]) => v !== undefined && v !== null && v !== "",
    ),
  );
  const s = new URLSearchParams(clean).toString();
  return s ? `?${s}` : "";
}

export const getAdminStats = () => api.get("/admin/stats").then((r) => r.data);

export const getAdminUsers = (params) =>
  api.get(`/admin/users${qs(params)}`).then((r) => r.data);

export const setUserStatus = (id, is_active) =>
  api.patch(`/admin/users/${id}/status`, { is_active }).then((r) => r.data);

export const deleteUser = (id) =>
  api.delete(`/admin/users/${id}`).then((r) => r.data);

export const getVerifications = (params) =>
  api.get(`/admin/verifications${qs(params)}`).then((r) => r.data);

export const reviewVerification = (id, { status, notes }) =>
  api
    .patch(`/admin/verifications/${id}`, { status, notes })
    .then((r) => r.data);

export const getAdminAppointments = (params) =>
  api.get(`/admin/appointments${qs(params)}`).then((r) => r.data);

export const getAdminPrescriptions = (params) =>
  api.get(`/admin/prescriptions${qs(params)}`).then((r) => r.data);

export const getChatbotMetrics = () =>
  api.get("/admin/chatbot-metrics").then((r) => r.data);

export const getAuditLogs = (params) =>
  api.get(`/admin/audit-logs${qs(params)}`).then((r) => r.data);

export const sendAnnouncement = (payload) =>
  api.post("/admin/announcements", payload).then((r) => r.data);

// --- Hospitals & Departments ---
export const getHospitals = (params) =>
  api.get(`/admin/hospitals${qs(params)}`).then((r) => r.data);

export const createHospital = (payload) =>
  api.post("/admin/hospitals", payload).then((r) => r.data);

export const updateHospital = (id, payload) =>
  api.patch(`/admin/hospitals/${id}`, payload).then((r) => r.data);

export const setHospitalStatus = (id, is_active) =>
  api.patch(`/admin/hospitals/${id}/status`, { is_active }).then((r) => r.data);

export const getHospitalDoctors = (id) =>
  api.get(`/admin/hospitals/${id}/doctors`).then((r) => r.data);

export const addHospitalDoctor = (id, payload) =>
  api.post(`/admin/hospitals/${id}/doctors`, payload).then((r) => r.data);

export const removeHospitalDoctor = (id, userId) =>
  api.delete(`/admin/hospitals/${id}/doctors/${userId}`).then((r) => r.data);

// --- System Health ---
export const getSystemHealth = () =>
  api.get("/admin/system-health").then((r) => r.data);

// --- Reports & Exports ---
export const runReport = (type, params) =>
  api.get(`/admin/reports/${type}${qs(params)}`).then((r) => r.data);

export const getReportHistory = () =>
  api.get("/admin/reports/history").then((r) => r.data);
