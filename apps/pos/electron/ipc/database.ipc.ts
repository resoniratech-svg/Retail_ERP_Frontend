import { ipcMain } from 'electron';

export function registerDatabaseIPC() {
  // Domain Channel: product:list
  ipcMain.handle('product:list', async () => {
    return [
      { id: 'prod-001', sku: 'MILK-ALM-1L', barcode: '6281007001015', name: 'Almarai Fresh Milk 1L', retailPrice: 7.50, vatRate: 0 },
      { id: 'prod-002', sku: 'RICE-KAH-5KG', barcode: '8901234567890', name: 'Khabari Basmati Rice 5kg', retailPrice: 45.00, vatRate: 0 },
    ];
  });

  // Domain Channel: product:get
  ipcMain.handle('product:get', async (_, barcode: string) => {
    if (barcode === '6281007001015') {
      return { id: 'prod-001', sku: 'MILK-ALM-1L', barcode: '6281007001015', name: 'Almarai Fresh Milk 1L', retailPrice: 7.50, vatRate: 0 };
    }
    return null;
  });

  // Domain Channel: sale:create
  ipcMain.handle('sale:create', async (_, saleData: any) => {
    return { success: true, id: `TX-${Date.now()}` };
  });

  // Domain Channel: invoice:hold
  ipcMain.handle('invoice:hold', async (_, invoiceData: any) => {
    return true;
  });

  // Domain Channel: session:open
  ipcMain.handle('session:open', async (_, floatAmount: number) => {
    return { id: `SESS-${Date.now()}`, openingFloat: floatAmount, status: 'OPEN' };
  });
}
