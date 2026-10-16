import { baseApi } from "./baseApi";
import { User, Organization } from "@/types/auth.types";

export const profileApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    updateProfile: builder.mutation<{ user: User }, Partial<Pick<User, "name" | "email">> & { phone?: string }>({
      query: (body) => ({ url: "/auth/profile", method: "PATCH", body }),
      invalidatesTags: ["Auth"],
    }),
    updateOrganization: builder.mutation<{ organization: Organization }, Partial<Organization>>({
      query: (body) => ({ url: "/organizations/me", method: "PATCH", body }),
      invalidatesTags: ["Auth"],
    }),
    changePassword: builder.mutation<{ message: string }, { current_password: string; new_password: string }>({
      query: (body) => ({ url: "/auth/change-password", method: "POST", body }),
    }),
  }),
});

export const {
  useUpdateProfileMutation,
  useUpdateOrganizationMutation,
  useChangePasswordMutation,
} = profileApi;
