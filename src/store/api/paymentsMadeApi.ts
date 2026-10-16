import { baseApi } from "./baseApi";

export const paymentsMadeApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getPaymentsMade: builder.query<any[], any>({
      query: (params) => ({
        url: "/payments-made",
        params,
      }),
      providesTags: (result) =>
        result
          ? [...result.map(({ id }) => ({ type: "PaymentsMade" as const, id })), { type: "PaymentsMade", id: "LIST" }]
          : [{ type: "PaymentsMade", id: "LIST" }],
    }),
    createPaymentMade: builder.mutation<any, any>({
      query: (data) => ({
        url: "/payments-made",
        method: "POST",
        body: data,
      }),
      invalidatesTags: [{ type: "PaymentsMade", id: "LIST" }, "Dashboard"],
    }),
  }),
});

export const { useGetPaymentsMadeQuery, useCreatePaymentMadeMutation } = paymentsMadeApi;
