import api from "./api";

// Full clinical record for one patient (doctor / admin only). Returns the
// structured payload from GET /api/patients/:id/records:
//   { patient, allergies, chronicConditions, visitHistory, prescriptions, labResults }
export async function getPatientRecords(patientId) {
  const { data } = await api.get(`/patients/${patientId}/records`);
  return data;
}
