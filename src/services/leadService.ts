import api from "@/utils/api";

export interface Lead {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  company?: string;
  status: string;
  source?: string;
  estimated_value?: number;
  notes?: string;
  created_at?: string;
  [key: string]: any;
}

export const leadService = {
  async getAll(params?: Record<string, any>): Promise<Lead[]> {
    const response = await api.get<Lead[]>("/leads", { params });
    return response.data;
  },

  async create(data: Partial<Lead>): Promise<Lead> {
    const response = await api.post<Lead>("/leads", data);
    return response.data;
  },

  async update(id: string, data: Partial<Lead>): Promise<Lead> {
    const response = await api.put<Lead>(`/leads/${id}`, data);
    return response.data;
  },

  async delete(id: string): Promise<{ message: string }> {
    const response = await api.delete<{ message: string }>(`/leads/${id}`);
    return response.data;
  },
};

export default leadService;
