import api from "@/utils/api";

export interface Warehouse {
  id: string;
  name: string;
  code?: string;
  address?: string;
  city?: string;
  state?: string;
  pin?: string;
  capacity?: number;
  is_active?: boolean;
  created_at?: string;
  [key: string]: any;
}

export const warehouseService = {
  async getAll(): Promise<Warehouse[]> {
    const response = await api.get<Warehouse[]>("/warehouses");
    return response.data;
  },

  async create(data: Partial<Warehouse>): Promise<Warehouse> {
    const response = await api.post<Warehouse>("/warehouses", data);
    return response.data;
  },
};

export default warehouseService;
