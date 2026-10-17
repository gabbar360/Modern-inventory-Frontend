import api from "@/utils/api";

export interface PaymentMade {
  id: string;
  payment_number?: string;
  vendor_id?: string;
  vendor_name?: string;
  bill_id?: string;
  amount: number;
  payment_mode?: string;
  reference?: string;
  created_at?: string;
  [key: string]: any;
}

export const paymentMadeService = {
  async getAll(params?: Record<string, any>): Promise<PaymentMade[]> {
    const response = await api.get<PaymentMade[]>("/payments-made", { params });
    return response.data;
  },

  async create(data: Partial<PaymentMade>): Promise<PaymentMade> {
    const response = await api.post<PaymentMade>("/payments-made", data);
    return response.data;
  },
};

export default paymentMadeService;
