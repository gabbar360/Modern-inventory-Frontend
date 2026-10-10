export interface PackagingLevel {
  name: string;
  qty: number;
}

export interface Product {
  id: string;
  name: string;
  sku: string;
  category?: string;
  hsn?: string;
  gst_rate: number;
  unit: string;
  selling_price: number;
  purchase_price: number;
  opening_stock?: number;
  current_stock?: number;
  min_stock?: number;
  packaging_levels?: PackagingLevel[];
  weight_kg?: number;
  description?: string;
  created_at?: string;
  updated_at?: string;
}

export interface CreateProductDTO extends Omit<Product, "id" | "created_at" | "updated_at"> { }
export interface UpdateProductDTO extends Partial<CreateProductDTO> {
  id: string;
}
