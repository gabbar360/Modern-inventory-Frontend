import { baseApi } from "./baseApi";

export const templatesApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getTemplates: builder.query<any[], any>({
      query: (params) => ({
        url: "/templates",
        params,
      }),
      providesTags: (result) =>
        result
          ? [...result.map(({ id }) => ({ type: "Templates" as const, id })), { type: "Templates", id: "LIST" }]
          : [{ type: "Templates", id: "LIST" }],
    }),
    createTemplate: builder.mutation<any, any>({
      query: (data) => ({
        url: "/templates",
        method: "POST",
        body: data,
      }),
      invalidatesTags: [{ type: "Templates", id: "LIST" }],
    }),
  }),
});

export const {
  useGetTemplatesQuery,
  useCreateTemplateMutation,
} = templatesApi;
