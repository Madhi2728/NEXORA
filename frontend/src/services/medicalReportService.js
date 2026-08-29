import api from "./api";

export async function uploadReport(file) {
  const formData = new FormData();
  formData.append("image", file);
  const { data } = await api.post("/medical-reports", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return data.report;
}

export async function getMyReports() {
  const { data } = await api.get("/medical-reports/me");
  return data.reports;
}

export async function deleteReport(id) {
  await api.delete(`/medical-reports/${id}`);
}

// Doctor/admin: reports still awaiting review.
export async function getPendingReports() {
  const { data } = await api.get("/medical-reports/pending");
  return data.reports;
}

// Doctor/admin: every non-normal lab finding, flattened + severity-sorted.
export async function getFlaggedReports() {
  const { data } = await api.get("/medical-reports/flagged");
  return data.alerts;
}
