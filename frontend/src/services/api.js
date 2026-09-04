import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000/api",
});

// Attach the JWT (if present) to every outgoing request.
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Auth pages own their own error handling (a 401 there just means "wrong
// password") — everywhere else a 401 means the session is gone, so drop the
// token and bounce to login.
const AUTH_PATHS = [
  "/login",
  "/register",
  "/verify-email",
  "/forgot-password",
  "/reset-password",
];

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("token");
      const onAuthPage = AUTH_PATHS.some((p) =>
        window.location.pathname.startsWith(p),
      );
      if (!onAuthPage) {
        window.location.assign("/login");
      }
    }
    return Promise.reject(error);
  },
);

export default api;
