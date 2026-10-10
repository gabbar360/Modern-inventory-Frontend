import { baseApi } from "./baseApi";

export const aiApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getAiHistory: builder.query<any, void>({
      query: () => "/ai/history",
      providesTags: ["AI"],
    }),
    sendAiChat: builder.mutation<any, { prompt: string; kind?: string }>({
      query: (data) => ({
        url: "/ai/chat",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["AI"],
    }),
  }),
});

export const {
  useGetAiHistoryQuery,
  useSendAiChatMutation,
} = aiApi;
