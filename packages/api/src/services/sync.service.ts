const SYNC_QUEUE_KEY = 'qatar_offline_sales_queue';

export const syncManager = {
  getPendingCount(): number {
    try {
      const raw = localStorage.getItem(SYNC_QUEUE_KEY);
      if (!raw) return 0;
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed.length : 0;
    } catch {
      return 0;
    }
  },

  enqueueTransaction(transaction: any): void {
    try {
      const raw = localStorage.getItem(SYNC_QUEUE_KEY);
      const queue = raw ? JSON.parse(raw) : [];
      queue.push({
        id: `tx-${Date.now()}`,
        ...transaction,
        status: 'PENDING_SYNC',
      });
      localStorage.setItem(SYNC_QUEUE_KEY, JSON.stringify(queue));
    } catch (e) {
      console.error('Failed to enqueue transaction for offline sync:', e);
    }
  },

  clearQueue(): void {
    try {
      localStorage.removeItem(SYNC_QUEUE_KEY);
    } catch (e) {
      console.error('Failed to clear sync queue:', e);
    }
  },
};
