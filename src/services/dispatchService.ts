import api from "@/utils/api";

export const dispatchService = {
  async getAll(): Promise<any[]> {
    const response = await api.get<any[]>("/dispatches");
    return response.data;
  },

  async create(data: any): Promise<any> {
    const response = await api.post<any>("/dispatches", data);
    return response.data;
  },

  async track(id: string): Promise<any> {
    const response = await api.get<any>(`/dispatches/${id}/track`);
    return response.data;
  },

  async cancel(id: string): Promise<any> {
    const response = await api.delete<any>(`/dispatches/${id}`);
    return response.data;
  },

  async getPincodeInfo(pincode: string): Promise<any> {
    const response = await api.get<any>(`/gst/pincode-distance/${pincode}`);
    return response.data;
  },

  async getFreightEstimate(data: any): Promise<any> {
    const response = await api.post<any>("/delhivery/freight-estimate", data);
    return response.data;
  },
};

export default dispatchService;
