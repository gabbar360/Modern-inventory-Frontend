import api from "@/utils/api";

export interface Brand {
  id: string;
  name: string;
  code?: string;
  description?: string;
  created_at?: string;
}

export const brandService = {
  async getAll(): Promise<Brand[]> {
    const response = await api.get<Brand[]>("/brands");
    return response.data;
  },

  async create(data: Partial<Brand>): Promise<Brand> {
    const response = await api.post<Brand>("/brands", data);
    return response.data;
  },
};

export default brandService;
