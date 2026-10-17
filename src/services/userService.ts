import api from "@/utils/api";

export const userService = {
  async getAll(): Promise<any[]> {
    const response = await api.get<any[]>("/users");
    return response.data;
  },

  async inviteUser(data: { email: string; name: string; role: string }): Promise<any> {
    const response = await api.post<any>("/users", data);
    return response.data;
  },

  async updateUserRole(id: string, role: string): Promise<any> {
    const response = await api.patch<any>(`/users/${id}/role`, { role });
    return response.data;
  },
};

export default userService;
