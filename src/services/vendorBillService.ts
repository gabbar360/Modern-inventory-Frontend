import api from "@/utils/api";

export interface VendorBill {
  id: string;
  bill_number?: string;
  vendor_id: string;
  vendor_name?: string;
  status: string;
  total_amount: number;
  paid_amount?: number;
  due_date?: string;
  items: any[];
  created_at?: string;
  [key: string]: any;
}

export const vendorBillService = {
  async getAll(params?: Record<string, any>): Promise<VendorBill[]> {
    const response = await api.get<VendorBill[]>("/vendor-bills", { params });
    return response.data;
  },

  async create(data: Partial<VendorBill>): Promise<VendorBill> {
    const response = await api.post<VendorBill>("/vendor-bills", data);
    return response.data;
  },
};

export default vendorBillService;
