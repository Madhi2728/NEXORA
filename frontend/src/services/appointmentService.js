import api from "./api";

export async function listHospitals() {
  const { data } = await api.get("/hospitals");
  return data.hospitals;
}

export async function listDoctorsForHospital(hospitalId) {
  const { data } = await api.get(`/hospitals/${hospitalId}/doctors`);
  return data.doctors;
}

export async function bookAppointment(payload) {
  const { data } = await api.post("/appointments/book", payload);
  return data.appointment;
}

export async function getMyAppointments() {
  const { data } = await api.get("/appointments/me");
  return data.appointments;
}

export async function cancelAppointment(id) {
  await api.delete(`/appointments/${id}`);
}
