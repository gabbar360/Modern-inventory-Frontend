import { baseApi } from "./baseApi";

export const expensesApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getExpenses: builder.query<any[], any>({
      query: (params) => ({
        url: "/expenses",
        params,
      }),
      providesTags: (result) =>
        result
          ? [...result.map(({ id }) => ({ type: "Expenses" as const, id })), { type: "Expenses", id: "LIST" }]
          : [{ type: "Expenses", id: "LIST" }],
    }),
    getExpenseSummary: builder.query<any, void>({
      query: () => "/expenses/summary",
      providesTags: ["Expenses"],
    }),
    createExpense: builder.mutation<any, any>({
      query: (data) => ({
        url: "/expenses",
        method: "POST",
        body: data,
      }),
      invalidatesTags: [{ type: "Expenses", id: "LIST" }, "Dashboard", "Reports"],
    }),
    deleteExpense: builder.mutation<{ message: string }, string>({
      query: (id) => ({
        url: `/expenses/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: [{ type: "Expenses", id: "LIST" }, "Dashboard", "Reports"],
    }),
  }),
});

export const {
  useGetExpensesQuery,
  useGetExpenseSummaryQuery,
  useCreateExpenseMutation,
  useDeleteExpenseMutation,
} = expensesApi;
