// VITE_API_URL looks like "http://localhost:5000/api" — uploaded images are
// served from the backend root ("http://localhost:5000/uploads/..."), so we
// strip the trailing "/api" to get the base origin.
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";
const BACKEND_ORIGIN = API_URL.replace(/\/api\/?$/, "");

export function prescriptionImageUrl(filePath) {
  return `${BACKEND_ORIGIN}/uploads/${filePath}`;
}
