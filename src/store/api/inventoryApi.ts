import { baseApi } from "./baseApi";

export const inventoryApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getMovements: builder.query<any[], any>({
      query: (params) => ({
        url: "/inventory/movements",
        params,
      }),
      providesTags: ["Inventory"],
    }),
    getStockHealth: builder.query<any, void>({
      query: () => "/inventory/stock-health",
      providesTags: ["Inventory"],
    }),
    adjustStock: builder.mutation<any, any>({
      query: (data) => ({
        url: "/inventory/adjust",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["Inventory", { type: "Products", id: "LIST" }, "Dashboard"],
    }),
    createClearanceOffer: builder.mutation<any, any>({
      query: (data) => ({
        url: "/inventory/clearance-offer",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["Inventory"],
    }),
    getReorderSuggestions: builder.query<any[], void>({
      query: () => "/reorder/suggestions",
      providesTags: ["Inventory"],
    }),
  }),
});

export const {
  useGetMovementsQuery,
  useGetStockHealthQuery,
  useAdjustStockMutation,
  useCreateClearanceOfferMutation,
  useGetReorderSuggestionsQuery,
} = inventoryApi;
