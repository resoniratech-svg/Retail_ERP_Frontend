export interface Product {
  id: string;
  sku: string;
  barcode: string;
  name: string;
  nameAr?: string;
  description?: string;
  categoryId: string;
  categoryName?: string;
  brandId?: string;
  brandName?: string;
  costPrice: number;
  retailPrice: number;
  vatRate: number; // e.g. 0 or 0.05
  stockQuantity: number;
  minStockLevel: number;
  unit: string; // e.g., 'Pcs', 'Kg', 'Box'
  imageUrl?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Category {
  id: string;
  name: string;
  nameAr?: string;
  code: string;
  parentId?: string;
  productCount?: number;
}

export interface Brand {
  id: string;
  name: string;
  logoUrl?: string;
  productCount?: number;
}
