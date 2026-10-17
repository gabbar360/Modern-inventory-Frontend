import api from "@/utils/api";

export const auditLogService = {
  async getAll(params?: Record<string, any>): Promise<any[]> {
    const response = await api.get<any[]>("/audit-logs", { params });
    return response.data;
  },
};

export default auditLogService;
