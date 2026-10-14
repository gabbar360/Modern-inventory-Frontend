export interface User {
  id: string;
  name: string;
  email: string;
  role: "SUPER_ADMIN" | "admin" | "manager" | "sales" | "inventory" | "accountant" | "viewer";
  roleId?: string;
  organization_id?: string | null;
  avatar_url?: string;
  created_at?: string;
}

export interface Organization {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  address?: string;
  gstin?: string;
  currency?: string;
  logo_url?: string;
}

export interface AuthResponse {
  user: User;
  organization: Organization;
  access_token?: string;
  token_type?: string;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface RegisterPayload {
  name: string;
  email: string;
  password: string;
  organization_name: string;
  phone?: string;
}

export interface AuthState {
  user: User | null;
  org: Organization | null;
  token: string | null;
  status: "loading" | "authenticated" | "unauthenticated";
}
