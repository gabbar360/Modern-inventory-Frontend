import api from "@/utils/api";

export const automationService = {
  async getAll(): Promise<any[]> {
    const response = await api.get<any[]>("/automation-rules");
    return response.data;
  },

  async create(data: any): Promise<any> {
    const response = await api.post<any>("/automation-rules", data);
    return response.data;
  },

  async toggle(id: string, is_active: boolean): Promise<any> {
    const response = await api.patch<any>(`/automation-rules/${id}`, { is_active });
    return response.data;
  },
};

export default automationService;
