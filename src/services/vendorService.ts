import api from "@/utils/api";

export interface Vendor {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  gstin?: string;
  pan?: string;
  address?: string;
  city?: string;
  state?: string;
  pin?: string;
  payment_terms?: string;
  bank_details?: any;
  created_at?: string;
  [key: string]: any;
}

export const vendorService = {
  async getAll(params?: Record<string, any>): Promise<Vendor[]> {
    const response = await api.get<Vendor[]>("/vendors", { params });
    return response.data;
  },

  async create(data: Partial<Vendor>): Promise<Vendor> {
    const response = await api.post<Vendor>("/vendors", data);
    return response.data;
  },

  async update(id: string, data: Partial<Vendor>): Promise<Vendor> {
    const response = await api.put<Vendor>(`/vendors/${id}`, data);
    return response.data;
  },

  async delete(id: string): Promise<{ message: string }> {
    const response = await api.delete<{ message: string }>(`/vendors/${id}`);
    return response.data;
  },
};

export default vendorService;
