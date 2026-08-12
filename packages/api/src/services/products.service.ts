import { Product } from '@qatar-erp/types';
import { MOCK_PRODUCTS } from '../mockData';

const STORAGE_KEY = 'qatar_erp_products';

const getStoredProducts = (): Product[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(MOCK_PRODUCTS));
      return MOCK_PRODUCTS;
    }
    return JSON.parse(raw) as Product[];
  } catch (e) {
    return MOCK_PRODUCTS;
  }
};

const saveStoredProducts = (products: Product[]): void => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(products));
    window.dispatchEvent(new Event('qatar_products_updated'));
  } catch (e) {
    console.error('Failed to save products to localStorage:', e);
  }
};

export const productsService = {
  getProductsSync(): Product[] {
    return getStoredProducts();
  },

  async getProducts(): Promise<Product[]> {
    return new Promise((resolve) => {
      resolve(getStoredProducts());
    });
  },

  async getProductByBarcode(barcode: string): Promise<Product | null> {
    const products = getStoredProducts();
    const cleanBarcode = barcode.trim().toLowerCase();
    const found = products.find(
      (p) => p.barcode.toLowerCase() === cleanBarcode || p.sku.toLowerCase() === cleanBarcode
    );
    return Promise.resolve(found || null);
  },

  async createProduct(productData: Partial<Product>): Promise<Product> {
    const products = getStoredProducts();
    const newProd: Product = {
      id: productData.id || `prod-${Date.now()}`,
      sku: productData.sku || `SKU-${Math.floor(1000 + Math.random() * 9000)}`,
      barcode: productData.barcode || `62510${Math.floor(10000000 + Math.random() * 90000000)}`,
      name: productData.name || 'New Product',
      nameAr: productData.nameAr || '',
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

    const updated = [newProd, ...products];
    saveStoredProducts(updated);
    return Promise.resolve(newProd);
  },

  async updateProduct(id: string, updates: Partial<Product>): Promise<Product | null> {
    const products = getStoredProducts();
    let updatedProduct: Product | null = null;
    const updated = products.map((p) => {
      if (p.id === id) {
        updatedProduct = { ...p, ...updates, updatedAt: new Date().toISOString() };
        return updatedProduct;
      }
      return p;
    });

    if (updatedProduct) {
      saveStoredProducts(updated);
    }
    return Promise.resolve(updatedProduct);
  },

  async deductStock(items: Array<{ id?: string; barcode?: string; sku?: string; quantity: number }>): Promise<boolean> {
    const products = getStoredProducts();
    let hasChanges = false;

    const updated = products.map((p) => {
      const soldItem = items.find(
        (i) =>
          (i.id && i.id === p.id) ||
          (i.barcode && i.barcode.toLowerCase() === p.barcode.toLowerCase()) ||
          (i.sku && i.sku.toLowerCase() === p.sku.toLowerCase())
      );
      if (soldItem && soldItem.quantity > 0) {
        hasChanges = true;
        const newStock = Math.max(0, p.stockQuantity - soldItem.quantity);
        return { ...p, stockQuantity: newStock, updatedAt: new Date().toISOString() };
      }
      return p;
    });

    if (hasChanges) {
      saveStoredProducts(updated);
    }
    return Promise.resolve(true);
  },

  async deleteProduct(id: string): Promise<boolean> {
    const products = getStoredProducts();
    const updated = products.filter((p) => p.id !== id);
    saveStoredProducts(updated);
    return Promise.resolve(true);
  },
};
