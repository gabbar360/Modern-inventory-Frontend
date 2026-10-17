import api from "@/utils/api";
import { Product, CreateProductDTO, UpdateProductDTO } from "@/types/product.types";

export const productService = {
  async getAll(params?: Record<string, any>): Promise<Product[]> {
    const response = await api.get<Product[]>("/products", { params });
    return response.data;
  },

  async getById(id: string): Promise<Product> {
    const response = await api.get<Product>(`/products/${id}`);
    return response.data;
  },

  async create(data: CreateProductDTO): Promise<Product> {
    const response = await api.post<Product>("/products", data);
    return response.data;
  },

  async update(id: string, data: Partial<UpdateProductDTO>): Promise<Product> {
    const response = await api.put<Product>(`/products/${id}`, data);
    return response.data;
  },

  async delete(id: string): Promise<{ message: string }> {
    const response = await api.delete<{ message: string }>(`/products/${id}`);
    return response.data;
  },
};

export default productService;
