import api from "@/utils/api";

export interface Payment {
  id: string;
  payment_number?: string;
  customer_id?: string;
  customer_name?: string;
  invoice_id?: string;
  amount: number;
  payment_mode?: string;
  reference?: string;
  created_at?: string;
  [key: string]: any;
}

export const paymentService = {
  async getPayments(params?: Record<string, any>): Promise<Payment[]> {
    const response = await api.get<Payment[]>("/payments", { params });
    return response.data;
  },

  async createPayment(data: Partial<Payment>): Promise<Payment> {
    const response = await api.post<Payment>("/payments", data);
    return response.data;
  },

  async getCreditNotes(): Promise<any[]> {
    const response = await api.get<any[]>("/credit-notes");
    return response.data;
  },

  async createCreditNote(data: any): Promise<any> {
    const response = await api.post<any>("/credit-notes", data);
    return response.data;
  },

  async getDebitNotes(): Promise<any[]> {
    const response = await api.get<any[]>("/debit-notes");
    return response.data;
  },

  async createDebitNote(data: any): Promise<any> {
    const response = await api.post<any>("/debit-notes", data);
    return response.data;
  },
};

export default paymentService;
