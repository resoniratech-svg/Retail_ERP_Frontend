import { contextBridge, ipcRenderer } from 'electron';

// Secure bridge exposing ONLY approved typed business APIs (No raw SQL)
contextBridge.exposeInMainWorld('electronAPI', {
  listProducts: (params?: any) => ipcRenderer.invoke('product:list', params),
  getProductByBarcode: (barcode: string) => ipcRenderer.invoke('product:get', barcode),
  createSale: (saleData: any) => ipcRenderer.invoke('sale:create', saleData),
  holdInvoice: (invoiceData: any) => ipcRenderer.invoke('invoice:hold', invoiceData),
  recallInvoices: () => ipcRenderer.invoke('invoice:recall'),
  openRegisterSession: (openingFloat: number) => ipcRenderer.invoke('session:open', openingFloat),
  closeRegisterSession: (actualCash: number) => ipcRenderer.invoke('session:close', actualCash),
  recordCashDrop: (amount: number, reason: string) => ipcRenderer.invoke('session:cashDrop', amount, reason),
  getPendingSyncQueue: () => ipcRenderer.invoke('sync:getPending'),
  markSynced: (syncId: string) => ipcRenderer.invoke('sync:markSynced', syncId),
  printReceipt: (receiptData: any) => ipcRenderer.invoke('hardware:printReceipt', receiptData),
  openCashDrawer: () => ipcRenderer.invoke('hardware:openDrawer'),
  getDeviceStatus: () => ipcRenderer.invoke('hardware:getDeviceStatus'),
});
