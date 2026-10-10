import { baseApi } from "./baseApi";
import { User } from "@/types/auth.types";
import { QueryParams } from "@/types/common.types";

export const usersApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getUsers: builder.query<User[], QueryParams | void>({
      query: (params) => ({
        url: "/users",
        params: params || undefined,
      }),
      providesTags: (result) =>
        result
          ? [...result.map(({ id }) => ({ type: "Users" as const, id })), { type: "Users", id: "LIST" }]
          : [{ type: "Users", id: "LIST" }],
    }),
    createUser: builder.mutation<User, Partial<User> & { password?: string }>({
      query: (data) => ({
        url: "/users",
        method: "POST",
        body: data,
      }),
      invalidatesTags: [{ type: "Users", id: "LIST" }],
    }),
    updateUserRole: builder.mutation<User, { id: string; role: string }>({
      query: ({ id, role }) => ({
        url: `/users/${id}/role`,
        method: "PATCH",
        body: { role },
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: "Users", id },
        { type: "Users", id: "LIST" },
      ],
    }),
  }),
});

export const {
  useGetUsersQuery,
  useCreateUserMutation,
  useUpdateUserRoleMutation,
} = usersApi;
