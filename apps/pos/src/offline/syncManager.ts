export interface OfflineQueueItem {
  id: string;
  transactionNo: string;
  payload: any;
  status: 'PENDING' | 'SYNCED' | 'FAILED';
  createdAt: string;
}

export class OfflineSyncManager {
  private queue: OfflineQueueItem[] = [];

  constructor() {
    this.loadQueue();
  }

  private loadQueue() {
    try {
      const saved = localStorage.getItem('qatar_pos_sync_queue');
      if (saved) this.queue = JSON.parse(saved);
    } catch {
      this.queue = [];
    }
  }

  public enqueueTransaction(payload: any): OfflineQueueItem {
    const item: OfflineQueueItem = {
      id: `SYNC-${Date.now()}`,
      transactionNo: payload.transactionNo || `TX-${Date.now()}`,
      payload,
      status: 'PENDING',
      createdAt: new Date().toISOString(),
    };
    this.queue.push(item);
    this.saveQueue();
    return item;
  }

  public getPendingCount(): number {
    return this.queue.filter((q) => q.status === 'PENDING').length;
  }

  public saveQueue() {
    localStorage.setItem('qatar_pos_sync_queue', JSON.stringify(this.queue));
  }
}

export const syncManager = new OfflineSyncManager();
