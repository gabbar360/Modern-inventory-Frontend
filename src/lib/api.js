import axios from "axios";

const getBackendBase = () => {
  if (typeof window !== "undefined" && window.location) {
    const host = window.location.hostname;
    if (host && host !== "localhost") {
      const configured = process.env.REACT_APP_BACKEND_URL;
      if (configured) {
        try {
          const u = new URL(configured);
          if (u.hostname === "localhost" || u.hostname === "127.0.0.1") {
            u.hostname = host;
            return u.origin;
          }
        } catch (e) {}
      }
      return `${window.location.protocol}//${host}:8000`;
    }
  }
  return process.env.REACT_APP_BACKEND_URL || "http://localhost:8000";
};

const BASE = getBackendBase();
export const api = axios.create({
  baseURL: `${BASE.replace(/\/$/, "")}/api`,
  withCredentials: true,
});

// Attach token from localStorage if cookie not usable across contexts
api.interceptors.request.use((cfg) => {
  const t = localStorage.getItem("access_token");
  if (t) cfg.headers.Authorization = `Bearer ${t}`;
  return cfg;
});

// Gracefully handle connectivity errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.code === "ERR_NETWORK" || error.message === "Network Error" || !error.response) {
      console.warn("API Connection Notice: Backend server temporarily unreachable or reconnecting:", error.message);
    }
    return Promise.reject(error);
  }
);

export const money = (n) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(Number(n || 0));

export const compactMoney = (n) => {
  const num = Number(n || 0);
  if (num >= 1e7) return `₹${(num / 1e7).toFixed(2)}Cr`;
  if (num >= 1e5) return `₹${(num / 1e5).toFixed(2)}L`;
  if (num >= 1e3) return `₹${(num / 1e3).toFixed(1)}K`;
  return `₹${num.toFixed(0)}`;
};

export const fmtDate = (iso) => {
  if (!iso) return "—";
  const d = new Date(iso);
  return d.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
};
