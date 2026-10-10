import { baseApi } from "./baseApi";

export const invoicesApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getInvoices: builder.query<any[], any>({
      query: (params) => ({
        url: "/invoices",
        params,
      }),
      providesTags: (result) =>
        result
          ? [...result.map(({ id }) => ({ type: "Invoices" as const, id })), { type: "Invoices", id: "LIST" }]
          : [{ type: "Invoices", id: "LIST" }],
    }),
    getInvoice: builder.query<any, string>({
      query: (id) => `/invoices/${id}`,
      providesTags: (result, error, id) => [{ type: "Invoices", id }],
    }),
    createInvoice: builder.mutation<any, any>({
      query: (data) => ({
        url: "/invoices",
        method: "POST",
        body: data,
      }),
      invalidatesTags: [{ type: "Invoices", id: "LIST" }, "Dashboard", "Reports"],
    }),
    recordInvoicePayment: builder.mutation<any, { invoiceId: string;[key: string]: any }>({
      query: ({ invoiceId, ...data }) => ({
        url: `/invoices/${invoiceId}/payments`,
        method: "POST",
        body: data,
      }),
      invalidatesTags: (result, error, { invoiceId }) => [
        { type: "Invoices", id: invoiceId },
        { type: "Invoices", id: "LIST" },
        "Payments",
        "Dashboard",
      ],
    }),
    sendInvoiceWhatsApp: builder.mutation<any, string>({
      query: (id) => ({
        url: `/invoices/${id}/send-whatsapp`,
        method: "POST",
      }),
      invalidatesTags: (result, error, id) => [{ type: "Invoices", id }],
    }),
    sendInvoiceEmail: builder.mutation<any, string>({
      query: (id) => ({
        url: `/invoices/${id}/send-email`,
        method: "POST",
      }),
      invalidatesTags: (result, error, id) => [{ type: "Invoices", id }],
    }),
  }),
});

export const {
  useGetInvoicesQuery,
  useGetInvoiceQuery,
  useCreateInvoiceMutation,
  useRecordInvoicePaymentMutation,
  useSendInvoiceWhatsAppMutation,
  useSendInvoiceEmailMutation,
} = invoicesApi;
