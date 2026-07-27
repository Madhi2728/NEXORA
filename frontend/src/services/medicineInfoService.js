import api from "./api";

export async function getMedicineInfo(query) {
  const { data } = await api.get("/medicine-info", { params: { q: query } });
  return data;
}
