import api from "./api";

export async function addVital(payload) {
  const { data } = await api.post("/vitals", payload);
  return data.vital;
}

export async function getMyVitals(type) {
  const { data } = await api.get("/vitals/me", { params: type ? { type } : {} });
  return data.vitals;
}

export async function deleteVital(id) {
  await api.delete(`/vitals/${id}`);
}
