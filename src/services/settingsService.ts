import api from "@/utils/api";
import { Organization } from "@/types/auth.types";

export const settingsService = {
  async getSettings(): Promise<{ organization: Organization; user: any }> {
    const response = await api.get<{ organization: Organization; user: any }>("/auth/me");
    return response.data;
  },

  async updateSettings(data: Partial<Organization>): Promise<{ organization: Organization }> {
    const response = await api.patch<{ organization: Organization }>("/organization", data);
    return response.data;
  },
};

export default settingsService;
