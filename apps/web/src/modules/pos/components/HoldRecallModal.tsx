import React from 'react';
import { Modal, Button, Badge } from '@qatar-erp/ui';
import { formatQAR } from '@qatar-erp/utils';

export interface HoldRecallModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRecallInvoice: (invoiceData: any) => void;
}

export const HoldRecallModal: React.FC<HoldRecallModalProps> = ({ isOpen, onClose, onRecallInvoice }) => {
  const heldInvoices = [
    { id: 'hold-1', ref: 'Table #4 / Customer Order', itemsCount: 3, total: 60.00, time: '10:14 AM' },
    { id: 'hold-2', ref: 'Phone Reservation - Jassim', itemsCount: 1, total: 45.00, time: '09:50 AM' },
  ];

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Recall Held Invoices">
      <div className="flex flex-col gap-4">
        {heldInvoices.map((inv) => (
          <div key={inv.id} className="p-3 bg-slate-900 border border-slate-800 rounded-xl flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-sm text-white">{inv.ref}</span>
                <Badge variant="warning">{inv.time}</Badge>
              </div>
              <p className="text-xs text-slate-400 mt-1">{inv.itemsCount} items in cart</p>
            </div>
            <div className="flex items-center gap-3">
              <span className="font-bold font-mono text-emerald-400 text-sm">{formatQAR(inv.total)}</span>
              <Button
                variant="primary"
                onClick={() => {
                  onRecallInvoice(inv);
                  onClose();
                }}
                className="py-1 px-3 text-xs"
              >
                Restore
              </Button>
            </div>
          </div>
        ))}
      </div>
    </Modal>
  );
};
