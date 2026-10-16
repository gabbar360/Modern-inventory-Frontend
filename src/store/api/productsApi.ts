import { baseApi } from "./baseApi";
import { Product, CreateProductDTO, UpdateProductDTO } from "@/types/product.types";
import { QueryParams } from "@/types/common.types";

export const productsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getProducts: builder.query<Product[], QueryParams | void>({
      query: (params) => ({
        url: "/products",
        params: params || undefined,
      }),
      providesTags: (result) =>
        result
          ? [...result.map(({ id }) => ({ type: "Products" as const, id })), { type: "Products", id: "LIST" }]
          : [{ type: "Products", id: "LIST" }],
    }),
    getProduct: builder.query<Product, string>({
      query: (id) => `/products/${id}`,
      providesTags: (result, error, id) => [{ type: "Products", id }],
    }),
    createProduct: builder.mutation<Product, CreateProductDTO>({
      query: (data) => ({
        url: "/products",
        method: "POST",
        body: data,
      }),
      invalidatesTags: [{ type: "Products", id: "LIST" }, "Inventory", "Dashboard"],
    }),
    updateProduct: builder.mutation<Product, UpdateProductDTO>({
      query: ({ id, ...patch }) => ({
        url: `/products/${id}`,
        method: "PUT",
        body: patch,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: "Products", id },
        { type: "Products", id: "LIST" },
        "Inventory",
      ],
    }),
    deleteProduct: builder.mutation<{ message: string }, string>({
      query: (id) => ({
        url: `/products/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: [{ type: "Products", id: "LIST" }, "Inventory"],
    }),
  }),
});

export const {
  useGetProductsQuery,
  useGetProductQuery,
  useCreateProductMutation,
  useUpdateProductMutation,
  useDeleteProductMutation,
} = productsApi;
