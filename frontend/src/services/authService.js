import api from "./api";

export async function loginRequest(email, password) {
  const { data } = await api.post("/auth/login", { email, password });
  return data; // { token, user }
}

export async function registerRequest(name, email, password, role) {
  const { data } = await api.post("/auth/register", { name, email, password, role });
  return data; // { token, user }
}

export async function fetchCurrentUser() {
  const { data } = await api.get("/auth/me");
  return data.user;
}
