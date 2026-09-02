import api from "./api";

export async function loginRequest(email, password) {
  const { data } = await api.post("/auth/login", { email, password });
  return data; // { token, user }
}

export async function registerRequest(name, email, password, role) {
  const { data } = await api.post("/auth/register", {
    name,
    email,
    password,
    role,
  });
  return data; // { requiresVerification: true, email }
}

export async function verifyEmailRequest(email, otp) {
  const { data } = await api.post("/auth/verify-email", { email, otp });
  return data; // { token, user }  — same shape login returns
}

export async function resendOtpRequest(email, purpose) {
  const { data } = await api.post("/auth/resend-otp", { email, purpose });
  return data; // { ok: true, expiresAt? }
}

export async function fetchCurrentUser() {
  const { data } = await api.get("/auth/me");
  return data.user;
}

export async function forgotPasswordRequest(email) {
  const { data } = await api.post("/auth/forgot-password", { email });
  return data; // { ok: true, message }
}

export async function resetPasswordRequest(email, otp, newPassword) {
  const { data } = await api.post("/auth/reset-password", {
    email,
    otp,
    newPassword,
  });
  return data; // { ok: true }
}
