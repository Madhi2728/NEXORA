// frontend/src/hooks/useAdmin.js
//
// One hook per admin resource area. Same fetch / loading / error / refetch
// shape as useVitals.js, but backed by the shared axios instance (services/
// adminService.js) so the JWT + base URL are handled centrally.

import { useCallback, useEffect, useState } from "react";
import * as adminApi from "../services/adminService";

// Generic GET hook. `params` is re-serialised for the effect dep so callers
// can pass a fresh object literal each render without causing a loop.
function useAdminResource(fetcher, params) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const key = JSON.stringify(params || null);

  const refetch = useCallback(async () => {
    setLoading(true);
    try {
      const result = await fetcher(params || undefined);
      setData(result);
      setError(null);
    } catch (err) {
      setError(
        err?.response?.data?.message || err?.message || "Something went wrong.",
      );
    } finally {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fetcher, key]);

  useEffect(() => {
    refetch();
  }, [refetch]);

  return { data, loading, error, refetch };
}

export function useAdminStats() {
  return useAdminResource(adminApi.getAdminStats);
}

export function useAdminUsers(params) {
  return useAdminResource(adminApi.getAdminUsers, params);
}

export function useAdminVerifications(params) {
  return useAdminResource(adminApi.getVerifications, params);
}

export function useAdminAppointments(params) {
  return useAdminResource(adminApi.getAdminAppointments, params);
}

export function useAdminPrescriptions(params) {
  return useAdminResource(adminApi.getAdminPrescriptions, params);
}

export function useAdminChatbotMetrics() {
  return useAdminResource(adminApi.getChatbotMetrics);
}

export function useAdminAuditLogs(params) {
  return useAdminResource(adminApi.getAuditLogs, params);
}

export function useHospitals(params) {
  return useAdminResource(adminApi.getHospitals, params);
}

// System Health polls on an interval, like MessageInboxBell.
export function useSystemHealth(intervalMs = 30000) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const refetch = useCallback(async () => {
    try {
      const result = await adminApi.getSystemHealth();
      setData(result);
      setError(null);
    } catch (err) {
      setError(
        err?.response?.data?.message || err?.message || "Something went wrong.",
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refetch();
    const id = setInterval(refetch, intervalMs);
    return () => clearInterval(id);
  }, [refetch, intervalMs]);

  return { data, loading, error, refetch };
}

// Reports: history via the generic hook + an imperative runner for previews/exports.
export function useReports() {
  const history = useAdminResource(adminApi.getReportHistory);
  return { ...history, runReport: adminApi.runReport };
}

// Re-export the mutating calls so panels import everything admin from one place.
export const adminActions = {
  setUserStatus: adminApi.setUserStatus,
  deleteUser: adminApi.deleteUser,
  reviewVerification: adminApi.reviewVerification,
  sendAnnouncement: adminApi.sendAnnouncement,
  createHospital: adminApi.createHospital,
  updateHospital: adminApi.updateHospital,
  setHospitalStatus: adminApi.setHospitalStatus,
  getHospitalDoctors: adminApi.getHospitalDoctors,
  addHospitalDoctor: adminApi.addHospitalDoctor,
  removeHospitalDoctor: adminApi.removeHospitalDoctor,
};
