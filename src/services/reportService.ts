import api from "@/utils/api";

export const reportService = {
  async getMetrics(): Promise<any> {
    const response = await api.get<any>("/reports/metrics");
    return response.data;
  },

  async getPnL(params?: Record<string, any>): Promise<any> {
    const response = await api.get<any>("/reports/pnl", { params });
    return response.data;
  },

  async getPnLInvoices(): Promise<any[]> {
    const response = await api.get<any[]>("/reports/pnl-invoices");
    return response.data;
  },

  async getPnLProducts(): Promise<any[]> {
    const response = await api.get<any[]>("/reports/pnl-products");
    return response.data;
  },

  async getDetailedMonthlyPl(year?: number): Promise<any> {
    const response = await api.get<any>("/reports/detailed-monthly-pl", { params: { year } });
    return response.data;
  },

  async getGstSummary(params?: Record<string, any>): Promise<any> {
    const response = await api.get<any>("/reports/gst-summary", { params });
    return response.data;
  },

  async getReceivablesAging(): Promise<any> {
    const response = await api.get<any>("/reports/receivables-aging");
    return response.data;
  },
};

export default reportService;
