import api from "@/utils/api";

export interface Invoice {
  id: string;
  invoice_number?: string;
  customer_id: string;
  customer_name?: string;
  status: string;
  total_amount: number;
  paid_amount?: number;
  balance_due?: number;
  due_date?: string;
  items: any[];
  eway_bill_no?: string;
  created_at?: string;
  [key: string]: any;
}

export const invoiceService = {
  async getAll(params?: Record<string, any>): Promise<Invoice[]> {
    const response = await api.get<Invoice[]>("/invoices", { params });
    return response.data;
  },

  async getById(id: string): Promise<Invoice> {
    const response = await api.get<Invoice>(`/invoices/${id}`);
    return response.data;
  },

  async create(data: Partial<Invoice>): Promise<Invoice> {
    const response = await api.post<Invoice>("/invoices", data);
    return response.data;
  },

  async update(id: string, data: Partial<Invoice>): Promise<Invoice> {
    const response = await api.put<Invoice>(`/invoices/${id}`, data);
    return response.data;
  },

  async sendEmail(id: string): Promise<any> {
    const response = await api.post(`/invoices/${id}/send-email`);
    return response.data;
  },

  async sendReminder(id: string): Promise<any> {
    const response = await api.post(`/invoices/${id}/send-reminder`);
    return response.data;
  },

  async generateEwayBill(id: string, payload?: any): Promise<any> {
    const response = await api.post(`/invoices/${id}/eway-bill/generate`, payload);
    return response.data;
  },

  async cancelEwayBill(id: string, payload?: any): Promise<any> {
    const response = await api.post(`/invoices/${id}/eway-bill/cancel`, payload);
    return response.data;
  },
};

export default invoiceService;
