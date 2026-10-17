import api from "@/utils/api";
import { User, Organization, AuthResponse, LoginPayload, RegisterPayload } from "@/types/auth.types";

export const authService = {
  async login(credentials: LoginPayload): Promise<AuthResponse> {
    const response = await api.post<AuthResponse>("/auth/login", credentials);
    return response.data;
  },

  async register(data: RegisterPayload): Promise<AuthResponse> {
    const response = await api.post<AuthResponse>("/auth/register", data);
    return response.data;
  },

  async getCurrentUser(): Promise<{ user: User; organization: Organization }> {
    const response = await api.get<{ user: User; organization: Organization }>("/auth/me");
    return response.data;
  },

  async updateProfile(data: Partial<Organization>): Promise<{ organization: Organization }> {
    const response = await api.patch<{ organization: Organization }>("/organization", data);
    return response.data;
  },

  async logout(): Promise<void> {
    try {
      await api.post("/auth/logout");
    } catch {
      // Ignore if endpoint does not require remote invalidation
    }
    if (typeof window !== "undefined") {
      localStorage.removeItem("access_token");
    }
  },
};

export default authService;
