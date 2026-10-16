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
  _id?: string;
  id?: string;
  name: string;
  legal_name?: string;
  display_name?: string;
  logo?: string;
  email?: string;
  phone?: string;
  website?: string;
  address?: string;
  city?: string;
  state?: string;
  state_code?: string;
  country?: string;
  pin?: string;
  gstin?: string;
  pan?: string;
  cin?: string;
  tan?: string;
  bank_name?: string;
  account_holder?: string;
  account_number?: string;
  ifsc?: string;
  swift?: string;
  branch?: string;
  upi_id?: string;
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
