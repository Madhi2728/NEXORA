import api from "./api";

export async function checkInteractions(drugs) {
  const { data } = await api.post("/drug-interactions/check", { drugs });
  return data;
}

export async function searchMedicines(query) {
  const { data } = await api.get("/drug-interactions/medicines", { params: { q: query } });
  return data.medicines;
}

export async function listKnownMedicines() {
  const { data } = await api.get("/drug-interactions/medicines");
  return data.medicines;
}
