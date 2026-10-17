import api from "@/utils/api";

export interface DeliveryChallan {
  id: string;
  challan_number?: string;
  customer_id?: string;
  customer_name?: string;
  status: string;
  items: any[];
  notes?: string;
  created_at?: string;
  [key: string]: any;
}

export const challanService = {
  async getAll(): Promise<DeliveryChallan[]> {
    const response = await api.get<DeliveryChallan[]>("/challans");
    return response.data;
  },

  async create(data: Partial<DeliveryChallan>): Promise<DeliveryChallan> {
    const response = await api.post<DeliveryChallan>("/challans", data);
    return response.data;
  },
};

export default challanService;
