import api from "@/utils/api";

export const dashboardService = {
  async getStats(): Promise<any> {
    const response = await api.get<any>("/dashboard/stats");
    return response.data;
  },

  async globalSearch(q: string): Promise<any[]> {
    const response = await api.get<any[]>("/search", { params: { q } });
    return response.data;
  },

  async getNotifications(): Promise<any[]> {
    const response = await api.get<any[]>("/notifications");
    return response.data;
  },

  async markNotificationRead(id: string): Promise<any> {
    const response = await api.post<any>(`/notifications/${id}/read`);
    return response.data;
  },

  async scanLowStock(): Promise<any> {
    const response = await api.post<any>("/notifications/scan-low-stock");
    return response.data;
  },

  async getWhatsappStatus(): Promise<any> {
    const response = await api.get<any>("/whatsapp/status");
    return response.data;
  },

  async getWhatsappQrcode(): Promise<any> {
    const response = await api.get<any>("/whatsapp/qrcode");
    return response.data;
  },

  async sendWhatsapp(data: any): Promise<any> {
    const response = await api.post<any>("/whatsapp/send", data);
    return response.data;
  },
};

export default dashboardService;
