import { baseApi } from "./baseApi";

export const brandsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getBrands: builder.query<any[], any>({
      query: (params) => ({
        url: "/brands",
        params,
      }),
      providesTags: (result) =>
        result
          ? [...result.map(({ id }) => ({ type: "Brands" as const, id })), { type: "Brands", id: "LIST" }]
          : [{ type: "Brands", id: "LIST" }],
    }),
    createBrand: builder.mutation<any, any>({
      query: (data) => ({
        url: "/brands",
        method: "POST",
        body: data,
      }),
      invalidatesTags: [{ type: "Brands", id: "LIST" }],
    }),
  }),
});

export const {
  useGetBrandsQuery,
  useCreateBrandMutation,
} = brandsApi;
