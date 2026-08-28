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

// Doctor/admin: persist a prescription typed in the Prescription Notebook.
// payload: { patient_id, prescribed_date, medicines: [{name,dosage,frequency,duration}], notes }
export async function createWrittenPrescription(payload) {
  const { data } = await api.post("/prescriptions/written", payload);
  return data.prescription;
}
