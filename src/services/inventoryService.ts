import api from "@/utils/api";

export interface StockMovement {
  id?: string;
  product_id: string;
  product_name?: string;
  quantity: number;
  movement_type: "in" | "out" | "adjustment" | "transfer";
  warehouse?: string;
  notes?: string;
  created_at?: string;
}

export interface StockAdjustmentPayload {
  product_id: string;
  quantity: number;
  movement_type: string;
  warehouse?: string;
  notes?: string;
}

export const inventoryService = {
  async getStockLedger(params?: Record<string, any>): Promise<any[]> {
    const response = await api.get<any[]>("/stock-ledger", { params });
    return response.data;
  },

  async getMovements(): Promise<StockMovement[]> {
    const response = await api.get<StockMovement[]>("/inventory/movements");
    return response.data;
  },

  async getStockHealth(): Promise<any> {
    const response = await api.get<any>("/inventory/stock-health");
    return response.data;
  },

  async adjustStock(data: StockAdjustmentPayload): Promise<any> {
    const response = await api.post<any>("/inventory/adjust", data);
    return response.data;
  },

  async getReorderAlerts(): Promise<any[]> {
    const response = await api.get<any[]>("/reorder-alerts");
    return response.data;
  },

  async getReorderSuggestions(): Promise<any[]> {
    const response = await api.get<any[]>("/reorder-suggestions");
    return response.data;
  },

  async createReorderPO(data: any): Promise<any> {
    const response = await api.post<any>("/reorder-suggestions/create-po", data);
    return response.data;
  },

  async sendClearanceOffer(data: any): Promise<any> {
    const response = await api.post<any>("/inventory/clearance-offer", data);
    return response.data;
  },
};

export default inventoryService;
