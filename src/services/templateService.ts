import api from "@/utils/api";

export const templateService = {
  async getAll(): Promise<any[]> {
    const response = await api.get<any[]>("/templates");
    return response.data;
  },

  async create(data: any): Promise<any> {
    const response = await api.post<any>("/templates", data);
    return response.data;
  },
};

export default templateService;
