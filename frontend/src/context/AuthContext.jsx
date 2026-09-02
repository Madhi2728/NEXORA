import { createContext, useContext, useEffect, useState } from "react";
import {
  loginRequest,
  registerRequest,
  verifyEmailRequest,
  fetchCurrentUser,
} from "../services/authService";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // On first load, if a token exists, validate it and restore the session.
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      setLoading(false);
      return;
    }
    fetchCurrentUser()
      .then(setUser)
      .catch(() => localStorage.removeItem("token"))
      .finally(() => setLoading(false));
  }, []);

  // Shared by the flows that end with a real session ({ token, user }).
  function applySession({ token, user: nextUser }) {
    localStorage.setItem("token", token);
    setUser(nextUser);
    return nextUser;
  }

  async function login(email, password) {
    return applySession(await loginRequest(email, password));
  }

  // Registration no longer starts a session — the user must verify their
  // email first. Returns { requiresVerification, email }.
  async function register(name, email, password, role) {
    return registerRequest(name, email, password, role);
  }

  // Completing email verification returns { token, user }, same as login.
  async function verifyEmail(email, otp) {
    return applySession(await verifyEmailRequest(email, otp));
  }

  function logout() {
    localStorage.removeItem("token");
    setUser(null);
  }

  return (
    <AuthContext.Provider
      value={{ user, loading, login, register, verifyEmail, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within an AuthProvider");
  return ctx;
}
