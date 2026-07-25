import api from "./api";

export async function sendMessage(message) {
  const { data } = await api.post("/chat/message", { message });
  return data; // { reply, crisis }
}

export async function getHistory() {
  const { data } = await api.get("/chat/history");
  return data.messages;
}

export async function clearHistory() {
  await api.delete("/chat/history");
}
