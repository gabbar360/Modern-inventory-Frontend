import api from "@/utils/api";

export interface Quotation {
  id: string;
  quotation_number?: string;
  customer_id: string;
  customer_name?: string;
  status: string;
  total_amount: number;
  items: any[];
  valid_until?: string;
  created_at?: string;
  [key: string]: any;
}

export const quotationService = {
  async getAll(params?: Record<string, any>): Promise<Quotation[]> {
    const response = await api.get<Quotation[]>("/quotations", { params });
    return response.data;
  },

  async getById(id: string): Promise<Quotation> {
    const response = await api.get<Quotation>(`/quotations/${id}`);
    return response.data;
  },

  async create(data: Partial<Quotation>): Promise<Quotation> {
    const response = await api.post<Quotation>("/quotations", data);
    return response.data;
  },

  async updateStatus(id: string, status: string): Promise<any> {
    const response = await api.post(`/quotations/${id}/status`, { status });
    return response.data;
  },

  async convertToSalesOrder(id: string): Promise<any> {
    const response = await api.post(`/quotations/${id}/convert`);
    return response.data;
  },

  async sendEmail(id: string, emailData?: any): Promise<any> {
    const response = await api.post(`/quotations/${id}/send-email`, emailData);
    return response.data;
  },
};

export default quotationService;
