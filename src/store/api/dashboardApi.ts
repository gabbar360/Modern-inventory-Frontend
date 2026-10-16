import { baseApi } from "./baseApi";

export const dashboardApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getDashboardSummary: builder.query<any, void>({
      query: () => "/reports/dashboard",
      providesTags: ["Dashboard"],
    }),
    getSalesReport: builder.query<any, any>({
      query: (params) => ({
        url: "/reports/sales",
        params,
      }),
      providesTags: ["Reports"],
    }),
    getPnlReport: builder.query<any, any>({
      query: (params) => ({
        url: "/reports/pnl",
        params,
      }),
      providesTags: ["Reports"],
    }),
    getInventoryReport: builder.query<any, any>({
      query: (params) => ({
        url: "/reports/inventory",
        params,
      }),
      providesTags: ["Reports"],
    }),
    getAccountingStats: builder.query<any, void>({
      query: () => "/reports/accounting",
      providesTags: ["Reports"],
    }),
  }),
});

export const {
  useGetDashboardSummaryQuery,
  useGetSalesReportQuery,
  useGetPnlReportQuery,
  useGetInventoryReportQuery,
  useGetAccountingStatsQuery,
} = dashboardApi;
