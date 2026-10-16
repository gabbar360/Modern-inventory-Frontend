import { baseApi } from "./baseApi";

export const paymentsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getPayments: builder.query<any[], any>({
      query: (params) => ({
        url: "/payments",
        params,
      }),
      providesTags: (result) =>
        result
          ? [...result.map(({ id }) => ({ type: "Payments" as const, id })), { type: "Payments", id: "LIST" }]
          : [{ type: "Payments", id: "LIST" }],
    }),
    createPayment: builder.mutation<any, any>({
      query: (data) => ({
        url: "/payments",
        method: "POST",
        body: data,
      }),
      invalidatesTags: [{ type: "Payments", id: "LIST" }, "Invoices", "Dashboard"],
    }),
  }),
});

export const { useGetPaymentsQuery, useCreatePaymentMutation } = paymentsApi;
