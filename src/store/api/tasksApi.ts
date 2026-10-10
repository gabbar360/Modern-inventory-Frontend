import { baseApi } from "./baseApi";

export const tasksApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getTasks: builder.query<any[], any>({
      query: (params) => ({
        url: "/tasks",
        params,
      }),
      providesTags: (result) =>
        result
          ? [...result.map(({ id }) => ({ type: "Tasks" as const, id })), { type: "Tasks", id: "LIST" }]
          : [{ type: "Tasks", id: "LIST" }],
    }),
    createTask: builder.mutation<any, any>({
      query: (data) => ({
        url: "/tasks",
        method: "POST",
        body: data,
      }),
      invalidatesTags: [{ type: "Tasks", id: "LIST" }],
    }),
    updateTaskStatus: builder.mutation<any, { id: string; status: string }>({
      query: ({ id, status }) => ({
        url: `/tasks/${id}`,
        method: "PATCH",
        body: { status },
      }),
      invalidatesTags: [{ type: "Tasks", id: "LIST" }],
    }),
  }),
});

export const {
  useGetTasksQuery,
  useCreateTaskMutation,
  useUpdateTaskStatusMutation,
} = tasksApi;
