/**
 * Common System Types
 */

export type StatusType =
  | "active"
  | "inactive"
  | "draft"
  | "pending"
  | "sent"
  | "accepted"
  | "rejected"
  | "paid"
  | "partially_paid"
  | "overdue"
  | "cancelled"
  | "todo"
  | "in_progress"
  | "done"
  | "in_stock"
  | "low_stock"
  | "out_of_stock";

export interface ApiResponse<T = any> {
  data: T;
  message?: string;
  success?: boolean;
}

export interface PaginatedResponse<T = any> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  total_pages: number;
}

export interface QueryParams {
  q?: string;
  page?: number;
  limit?: number;
  status?: string;
  sortBy?: string;
  order?: "asc" | "desc";
  [key: string]: any;
}
