import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { API_BASE_URL } from "@/lib/api";

/**
 * Production Base RTK Query API (TypeScript)
 * Centralized caching, token injection, and tag invalidation
 */
export const baseApi = createApi({
  reducerPath: "api",
  baseQuery: fetchBaseQuery({
    baseUrl: API_BASE_URL,
    prepareHeaders: (headers) => {
      if (typeof window !== "undefined") {
        const token = localStorage.getItem("access_token");
        if (token) {
          headers.set("Authorization", `Bearer ${token}`);
        }
      }
      return headers;
    },
    credentials: "omit",
  }),
  tagTypes: [
    "Auth",
    "Products",
    "Inventory",
    "Customers",
    "Vendors",
    "Quotations",
    "SalesOrders",
    "Invoices",
    "Payments",
    "PaymentsMade",
    "Expenses",
    "Tasks",
    "Warehouses",
    "Brands",
    "Challans",
    "Templates",
    "Reports",
    "Dashboard",
    "AI",
    "Notifications",
    "Search",
    "Users",
    "Approvals",
    "Settings",
  ],
  endpoints: () => ({}),
});
