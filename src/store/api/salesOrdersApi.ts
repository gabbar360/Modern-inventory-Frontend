import { baseApi } from "./baseApi";

export const salesOrdersApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getSalesOrders: builder.query<any[], any>({
      query: (params) => ({
        url: "/sales-orders",
        params,
      }),
      providesTags: (result) =>
        result
          ? [...result.map(({ id }) => ({ type: "SalesOrders" as const, id })), { type: "SalesOrders", id: "LIST" }]
          : [{ type: "SalesOrders", id: "LIST" }],
    }),
    createSalesOrder: builder.mutation<any, any>({
      query: (data) => ({
        url: "/sales-orders",
        method: "POST",
        body: data,
      }),
      invalidatesTags: [{ type: "SalesOrders", id: "LIST" }, "Dashboard", "Inventory"],
    }),
    updateSalesOrderStatus: builder.mutation<any, { id: string; status: string }>({
      query: ({ id, status }) => ({
        url: `/sales-orders/${id}/status`,
        method: "PATCH",
        body: { status },
      }),
      invalidatesTags: [{ type: "SalesOrders", id: "LIST" }, "Dashboard"],
    }),
  }),
});

export const {
  useGetSalesOrdersQuery,
  useCreateSalesOrderMutation,
  useUpdateSalesOrderStatusMutation,
} = salesOrdersApi;
