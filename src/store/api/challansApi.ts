import { baseApi } from "./baseApi";

export const challansApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getChallans: builder.query<any[], any>({
      query: (params) => ({
        url: "/challans",
        params,
      }),
      providesTags: (result) =>
        result
          ? [...result.map(({ id }) => ({ type: "Challans" as const, id })), { type: "Challans", id: "LIST" }]
          : [{ type: "Challans", id: "LIST" }],
    }),
    createChallan: builder.mutation<any, any>({
      query: (data) => ({
        url: "/challans",
        method: "POST",
        body: data,
      }),
      invalidatesTags: [{ type: "Challans", id: "LIST" }],
    }),
    generateEwayBill: builder.mutation<any, string>({
      query: (id) => ({
        url: `/challans/${id}/generate-eway-bill`,
        method: "POST",
      }),
      invalidatesTags: (result, error, id) => [{ type: "Challans", id }, { type: "Challans", id: "LIST" }],
    }),
  }),
});

export const {
  useGetChallansQuery,
  useCreateChallanMutation,
  useGenerateEwayBillMutation,
} = challansApi;
