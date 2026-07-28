import api from "./api";

export async function uploadPrescription(file) {
  const formData = new FormData();
  formData.append("image", file);
  const { data } = await api.post("/prescriptions", formData);
  return data.prescription;
}

export async function getMyPrescriptions() {
  const { data } = await api.get("/prescriptions/me");
  return data.prescriptions;
}

export async function getPrescriptionById(id) {
  const { data } = await api.get(`/prescriptions/${id}`);
  return data.prescription;
}

export async function deletePrescription(id) {
  await api.delete(`/prescriptions/${id}`);
}
