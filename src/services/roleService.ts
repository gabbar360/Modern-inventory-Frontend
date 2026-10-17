import api from "@/utils/api";

export interface Role {
  _id?: string;
  id?: string;
  name: string;
  slug: string;
  description?: string;
  permissions?: string[];
  [key: string]: any;
}

export const roleService = {
  async getAll(): Promise<Role[]> {
    const response = await api.get<Role[]>("/roles");
    return response.data;
  },

  async getById(id: string): Promise<Role> {
    const response = await api.get<Role>(`/roles/${id}`);
    return response.data;
  },

  async create(data: Partial<Role>): Promise<Role> {
    const response = await api.post<Role>("/roles", data);
    return response.data;
  },

  async update(id: string, data: Partial<Role>): Promise<Role> {
    const response = await api.patch<Role>(`/roles/${id}`, data);
    return response.data;
  },

  async delete(id: string): Promise<{ message: string }> {
    const response = await api.delete<{ message: string }>(`/roles/${id}`);
    return response.data;
  },
};

export default roleService;
