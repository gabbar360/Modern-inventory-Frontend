import { baseApi } from "./baseApi";

export const quotationsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getQuotations: builder.query<any[], any>({
      query: (params) => ({
        url: "/quotations",
        params,
      }),
      providesTags: (result) =>
        result
          ? [...result.map(({ id }) => ({ type: "Quotations" as const, id })), { type: "Quotations", id: "LIST" }]
          : [{ type: "Quotations", id: "LIST" }],
    }),
    getQuotation: builder.query<any, string>({
      query: (id) => `/quotations/${id}`,
      providesTags: (result, error, id) => [{ type: "Quotations", id }],
    }),
    createQuotation: builder.mutation<any, any>({
      query: (data) => ({
        url: "/quotations",
        method: "POST",
        body: data,
      }),
      invalidatesTags: [{ type: "Quotations", id: "LIST" }, "Dashboard"],
    }),
    updateQuotationStatus: builder.mutation<any, { id: string; status: string }>({
      query: ({ id, status }) => ({
        url: `/quotations/${id}/status`,
        method: "PATCH",
        body: { status },
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: "Quotations", id },
        { type: "Quotations", id: "LIST" },
        "Dashboard",
      ],
    }),
    sendQuotationWhatsApp: builder.mutation<any, string>({
      query: (id) => ({
        url: `/quotations/${id}/send-whatsapp`,
        method: "POST",
      }),
      invalidatesTags: (result, error, id) => [{ type: "Quotations", id }],
    }),
    sendQuotationEmail: builder.mutation<any, string>({
      query: (id) => ({
        url: `/quotations/${id}/send-email`,
        method: "POST",
      }),
      invalidatesTags: (result, error, id) => [{ type: "Quotations", id }],
    }),
  }),
});

export const {
  useGetQuotationsQuery,
  useGetQuotationQuery,
  useCreateQuotationMutation,
  useUpdateQuotationStatusMutation,
  useSendQuotationWhatsAppMutation,
  useSendQuotationEmailMutation,
} = quotationsApi;
