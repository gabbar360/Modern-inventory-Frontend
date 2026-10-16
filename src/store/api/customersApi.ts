import { baseApi } from "./baseApi";
import { QueryParams } from "@/types/common.types";

export interface Customer {
  id: string;
  name: string;
  company_name?: string;
  email?: string;
  phone?: string;
  gstin?: string;
  billing_address?: string;
  shipping_address?: string;
  credit_limit?: number;
  outstanding_balance?: number;
  status?: string;
  created_at?: string;
}

export const customersApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getCustomers: builder.query<Customer[], QueryParams | void>({
      query: (params) => ({
        url: "/customers",
        params: params || undefined,
      }),
      providesTags: (result) =>
        result
          ? [...result.map(({ id }) => ({ type: "Customers" as const, id })), { type: "Customers", id: "LIST" }]
          : [{ type: "Customers", id: "LIST" }],
    }),
    getCustomer: builder.query<Customer, string>({
      query: (id) => `/customers/${id}`,
      providesTags: (result, error, id) => [{ type: "Customers", id }],
    }),
    createCustomer: builder.mutation<Customer, Partial<Customer>>({
      query: (data) => ({
        url: "/customers",
        method: "POST",
        body: data,
      }),
      invalidatesTags: [{ type: "Customers", id: "LIST" }, "Dashboard"],
    }),
    updateCustomer: builder.mutation<Customer, Partial<Customer> & { id: string }>({
      query: ({ id, ...patch }) => ({
        url: `/customers/${id}`,
        method: "PUT",
        body: patch,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: "Customers", id },
        { type: "Customers", id: "LIST" },
      ],
    }),
  }),
});

export const {
  useGetCustomersQuery,
  useGetCustomerQuery,
  useCreateCustomerMutation,
  useUpdateCustomerMutation,
} = customersApi;
