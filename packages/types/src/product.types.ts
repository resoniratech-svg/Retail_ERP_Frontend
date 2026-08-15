export interface ProductPacking {
  id: string;
  barcode: string;
  unit: string;
  packQty: number;
  cost: number;
  price: number;
  priceInclTax: number;
  productName?: string;
  wasPrice?: number;
  wsPrice?: number;
  isEcommProduct?: boolean;
  isStockUnit?: boolean;
  isWeighing?: boolean;
  isRawMaterial?: boolean;
}

export interface Product {
  id: string;
  sku: string;
  barcode: string;
  name: string;
  nameAr?: string;
  localDescription?: string;
  shortDescription?: string;
  description?: string;
  additionalDescription?: string;
  categoryId: string;
  categoryName?: string;
  subDepartment?: string;
  brandId?: string;
  brandName?: string;
  defaultVendor?: string;
  
  // Costing & Taxes
  costPrice: number;
  costInclTax?: number;
  landedCost?: number;
  costingMethod?: 'Purchase Cost' | 'Weighted Average' | 'FIFO';
  avgCost?: number;
  lastSupplierCost?: number;
  vatRate: number; // e.g. 0 or 0.15
  saleTaxRate?: number;
  purchaseTaxRate?: number;

  // Retail & Wholesale Pricing
  retailPrice: number;
  discount?: number; // Discount amount in QAR
  markupPercent?: number;
  grossProfitPercent?: number;
  priceInclTax?: number;
  msp?: number; // Minimum selling price limit
  wasPrice?: number; // Original comparative price
  openPrice?: boolean; // Allow manual price at POS

  wsPrice?: number; // Wholesale Price
  wsMarkupPercent?: number;
  wsGrossProfitPercent?: number;
  wsPriceInclTax?: number;
  wsMsp?: number;

  expDays?: number;

  // Operational Flags
  weighingProductType?: 'None' | 'Amount In Barcode' | 'Weight In Barcode' | 'Quantity In Barcode';
  nonInventory?: boolean;
  autoProductionWhileSale?: boolean;
  procurementType?: 'Normal Purchase' | 'Consignment' | 'Internal Production';
  divisionFactor?: number;
  maxDiscountRate?: number;

  // Multi-unit Packings
  packings?: ProductPacking[];

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
