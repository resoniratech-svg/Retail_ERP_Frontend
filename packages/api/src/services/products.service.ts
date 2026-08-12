import { Product } from '@qatar-erp/types';
import { MOCK_PRODUCTS } from '../mockData';

export const productsService = {
  async getProducts(): Promise<Product[]> {
    return new Promise((resolve) => {
      setTimeout(() => resolve([...MOCK_PRODUCTS]), 100);
    });
  },

  async getProductByBarcode(barcode: string): Promise<Product | null> {
    return new Promise((resolve) => {
      const found = MOCK_PRODUCTS.find((p) => p.barcode === barcode || p.sku === barcode);
      setTimeout(() => resolve(found || null), 50);
    });
  },

  async createProduct(productData: Partial<Product>): Promise<Product> {
    const newProd: Product = {
      id: `prod-${Date.now()}`,
      sku: productData.sku || `SKU-${Math.floor(Math.random() * 1000)}`,
      barcode: productData.barcode || `${Math.floor(Math.random() * 1000000000000)}`,
      name: productData.name || 'New Product',
      nameAr: productData.nameAr,
      categoryId: productData.categoryId || 'cat-general',
      categoryName: productData.categoryName || 'General',
      costPrice: productData.costPrice || 0,
      retailPrice: productData.retailPrice || 0,
      vatRate: productData.vatRate || 0,
      stockQuantity: productData.stockQuantity || 0,
      minStockLevel: productData.minStockLevel || 5,
      unit: productData.unit || 'Pcs',
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    MOCK_PRODUCTS.push(newProd);
    return newProd;
  },
};
