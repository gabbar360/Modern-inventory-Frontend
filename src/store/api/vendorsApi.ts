import { baseApi } from "./baseApi";
import { QueryParams } from "@/types/common.types";

export interface Vendor {
  id: string;
  name: string;
  company_name?: string;
  email?: string;
  phone?: string;
  gstin?: string;
  address?: string;
  payment_terms?: string;
  status?: string;
  created_at?: string;
}

export const vendorsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getVendors: builder.query<Vendor[], QueryParams | void>({
      query: (params) => ({
        url: "/vendors",
        params: params || undefined,
      }),
      providesTags: (result) =>
        result
          ? [...result.map(({ id }) => ({ type: "Vendors" as const, id })), { type: "Vendors", id: "LIST" }]
          : [{ type: "Vendors", id: "LIST" }],
    }),
    getVendor: builder.query<Vendor, string>({
      query: (id) => `/vendors/${id}`,
      providesTags: (result, error, id) => [{ type: "Vendors", id }],
    }),
    createVendor: builder.mutation<Vendor, Partial<Vendor>>({
      query: (data) => ({
        url: "/vendors",
        method: "POST",
        body: data,
      }),
      invalidatesTags: [{ type: "Vendors", id: "LIST" }],
    }),
    updateVendor: builder.mutation<Vendor, Partial<Vendor> & { id: string }>({
      query: ({ id, ...patch }) => ({
        url: `/vendors/${id}`,
        method: "PUT",
        body: patch,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: "Vendors", id },
        { type: "Vendors", id: "LIST" },
      ],
    }),
  }),
});

export const {
  useGetVendorsQuery,
  useGetVendorQuery,
  useCreateVendorMutation,
  useUpdateVendorMutation,
} = vendorsApi;
