import api from "@/utils/api";

export interface Customer {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  gstin?: string;
  pan?: string;
  billing_address?: string;
  shipping_address?: string;
  city?: string;
  state?: string;
  pin?: string;
  country?: string;
  currency?: string;
  credit_limit?: number;
  outstanding_balance?: number;
  notes?: string;
  portal_token?: string;
  created_at?: string;
  [key: string]: any;
}

export const customerService = {
  async getAll(params?: Record<string, any>): Promise<Customer[]> {
    const response = await api.get<Customer[]>("/customers", { params });
    return response.data;
  },

  async getById(id: string): Promise<any> {
    const response = await api.get(`/customers/${id}`);
    return response.data;
  },

  async create(data: Partial<Customer>): Promise<Customer> {
    const response = await api.post<Customer>("/customers", data);
    return response.data;
  },

  async update(id: string, data: Partial<Customer>): Promise<Customer> {
    const response = await api.put<Customer>(`/customers/${id}`, data);
    return response.data;
  },

  async delete(id: string): Promise<{ message: string }> {
    const response = await api.delete<{ message: string }>(`/customers/${id}`);
    return response.data;
  },
};

export default customerService;
