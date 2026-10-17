import api from "@/utils/api";

export interface SalesOrder {
  id: string;
  order_number?: string;
  customer_id: string;
  customer_name?: string;
  status: string;
  total_amount: number;
  items: any[];
  shipping_address?: string;
  created_at?: string;
  [key: string]: any;
}

export const salesOrderService = {
  async getAll(params?: Record<string, any>): Promise<SalesOrder[]> {
    const response = await api.get<SalesOrder[]>("/sales-orders", { params });
    return response.data;
  },

  async getById(id: string): Promise<SalesOrder> {
    const response = await api.get<SalesOrder>(`/sales-orders/${id}`);
    return response.data;
  },

  async create(data: Partial<SalesOrder>): Promise<SalesOrder> {
    const response = await api.post<SalesOrder>("/sales-orders", data);
    return response.data;
  },

  async updateStatus(id: string, status: string): Promise<any> {
    const response = await api.post(`/sales-orders/${id}/status`, { status });
    return response.data;
  },
};

export default salesOrderService;
