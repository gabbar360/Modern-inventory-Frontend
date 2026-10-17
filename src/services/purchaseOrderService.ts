import api from "@/utils/api";

export interface PurchaseOrder {
  id: string;
  po_number?: string;
  vendor_id: string;
  vendor_name?: string;
  status: string;
  total_amount: number;
  items: any[];
  expected_delivery?: string;
  created_at?: string;
  [key: string]: any;
}

export const purchaseOrderService = {
  async getAll(params?: Record<string, any>): Promise<PurchaseOrder[]> {
    const response = await api.get<PurchaseOrder[]>("/purchase-orders", { params });
    return response.data;
  },

  async create(data: Partial<PurchaseOrder>): Promise<PurchaseOrder> {
    const response = await api.post<PurchaseOrder>("/purchase-orders", data);
    return response.data;
  },
};

export default purchaseOrderService;
