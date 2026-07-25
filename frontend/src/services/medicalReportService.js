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
