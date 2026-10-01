import axios from "axios";

export const api = axios.create({
  baseURL: "/api",
  withCredentials: true,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("access_token");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (
      error.code === "ERR_NETWORK" ||
      error.message === "Network Error" ||
      !error.response
    ) {
      console.warn(
        "API Connection Notice: Backend server temporarily unreachable:",
        error.message
      );
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

  return d.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};