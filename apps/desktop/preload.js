const { contextBridge, ipcRenderer } = require('electron');

// Expose safe native Windows desktop APIs to React web application
contextBridge.exposeInMainWorld('electronAPI', {
  platform: process.platform,
  isNativeDesktop: true,

  // Window Controls
  minimizeWindow: () => ipcRenderer.send('window-minimize'),
  maximizeWindow: () => ipcRenderer.send('window-maximize'),
  closeWindow: () => ipcRenderer.send('window-close'),

  // Hardware & Printing
  printThermalReceipt: (data) => ipcRenderer.invoke('print-thermal-receipt', data),
  getPrinterList: () => ipcRenderer.invoke('get-printer-list'),
  openCashDrawer: () => ipcRenderer.send('open-cash-drawer'),

  // Listeners
  onSystemNotification: (callback) => ipcRenderer.on('system-notification', (event, value) => callback(value)),
});
