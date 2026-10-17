import api from "@/utils/api";

export interface Expense {
  id: string;
  category: string;
  amount: number;
  date?: string;
  notes?: string;
  payment_mode?: string;
  created_at?: string;
  [key: string]: any;
}

export const expenseService = {
  async getAll(params?: Record<string, any>): Promise<Expense[]> {
    const response = await api.get<Expense[]>("/expenses", { params });
    return response.data;
  },

  async getSummary(): Promise<any> {
    const response = await api.get<any>("/expenses/summary");
    return response.data;
  },

  async create(data: Partial<Expense>): Promise<Expense> {
    const response = await api.post<Expense>("/expenses", data);
    return response.data;
  },

  async delete(id: string): Promise<{ message: string }> {
    const response = await api.delete<{ message: string }>(`/expenses/${id}`);
    return response.data;
  },
};

export default expenseService;
