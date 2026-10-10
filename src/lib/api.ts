import axios, { AxiosInstance } from "axios";
export { money, compactMoney, fmtDate, fmtDateTime, fmtPercent, capitalize, fmtStatus } from "./formatters";

export const getBackendBase = (): string => {
  if (typeof window !== "undefined" && window.location) {
    const host = window.location.hostname;
    if (host && host !== "localhost") {
      const configured = process.env.REACT_APP_BACKEND_URL || process.env.NEXT_PUBLIC_BACKEND_URL;
      if (configured) {
        try {
          const u = new URL(configured);
          if (u.hostname === "localhost" || u.hostname === "127.0.0.1") {
            u.hostname = host;
            return u.origin;
          }
        } catch { }
      }
      return `${window.location.protocol}//${host}:8000`;
    }
  }
  return process.env.REACT_APP_BACKEND_URL || process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8000";
};

export const BASE = getBackendBase();
export const API_BASE_URL = `${BASE.replace(/\/$/, "")}/api`;

export const api: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
});

// Attach token from localStorage
api.interceptors.request.use((cfg) => {
  if (typeof window !== "undefined") {
    const t = localStorage.getItem("access_token");
    if (t && cfg.headers) {
      cfg.headers.Authorization = `Bearer ${t}`;
    }
  }
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
