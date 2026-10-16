import { baseApi } from "./baseApi";

export const warehousesApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getWarehouses: builder.query<any[], any>({
      query: (params) => ({
        url: "/warehouses",
        params,
      }),
      providesTags: (result) =>
        result
          ? [...result.map(({ id }) => ({ type: "Warehouses" as const, id })), { type: "Warehouses", id: "LIST" }]
          : [{ type: "Warehouses", id: "LIST" }],
    }),
    createWarehouse: builder.mutation<any, any>({
      query: (data) => ({
        url: "/warehouses",
        method: "POST",
        body: data,
      }),
      invalidatesTags: [{ type: "Warehouses", id: "LIST" }],
    }),
  }),
});

export const {
  useGetWarehousesQuery,
  useCreateWarehouseMutation,
} = warehousesApi;
