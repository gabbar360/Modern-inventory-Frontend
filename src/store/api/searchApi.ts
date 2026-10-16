import { baseApi } from "./baseApi";

export interface SearchResultItem {
  id: string;
  type: string;
  title: string;
  subtitle?: string;
}

export interface SearchResponse {
  results: SearchResultItem[];
}

export const searchApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    searchGlobal: builder.query<SearchResponse, string>({
      query: (q) => ({
        url: "/search",
        params: { q },
      }),
      providesTags: ["Search"],
    }),
  }),
});

export const {
  useSearchGlobalQuery,
  useLazySearchGlobalQuery,
} = searchApi;
