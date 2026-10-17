import api from "@/utils/api";

export const journalService = {
  async getAll(): Promise<any[]> {
    const response = await api.get<any[]>("/journal-entries");
    return response.data;
  },
};

export default journalService;
