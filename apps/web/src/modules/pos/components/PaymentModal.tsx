import React, { useState } from 'react';
import { Modal, Button, Input } from '@qatar-erp/ui';
import { formatQAR } from '@qatar-erp/utils';
import { CreditCard, Banknote, Gift, CheckCircle } from 'lucide-react';
import { PaymentMethod } from '../types/posModule.types';

export interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  grandTotal: number;
  onCompleteSale: () => void;
}

export const PaymentModal: React.FC<PaymentModalProps> = ({ isOpen, onClose, grandTotal, onCompleteSale }) => {
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('CASH');
  const [cashTendered, setCashTendered] = useState<number>(grandTotal);

  const changeDue = Math.max(0, cashTendered - grandTotal);

  const handleFinish = () => {
    onCompleteSale();
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Complete Payment (QAR)">
      <div className="flex flex-col gap-5">
        <div className="bg-slate-900 text-white p-4 rounded-xl flex items-center justify-between border border-slate-800">
          <div>
            <span className="text-xs text-slate-400 font-semibold block">TOTAL AMOUNT DUE</span>
            <span className="text-3xl font-black text-emerald-400 font-mono">{formatQAR(grandTotal)}</span>
          </div>
          <div className="text-right">
            <span className="text-xs text-slate-400 font-semibold block">CHANGE DUE</span>
            <span className="text-2xl font-bold text-amber-400 font-mono">{formatQAR(changeDue)}</span>
          </div>
        </div>

        {/* Payment Method Tabs */}
        <div className="grid grid-cols-3 gap-2">
          <button
            onClick={() => setPaymentMethod('CASH')}
            className={`p-3 rounded-xl border flex flex-col items-center gap-1 font-bold text-xs ${
              paymentMethod === 'CASH' ? 'bg-emerald-600 border-emerald-500 text-white' : 'bg-slate-800 border-slate-700 text-slate-300'
            }`}
          >
            <Banknote className="w-5 h-5" />
            <span>CASH</span>
          </button>
          <button
            onClick={() => setPaymentMethod('CARD')}
            className={`p-3 rounded-xl border flex flex-col items-center gap-1 font-bold text-xs ${
              paymentMethod === 'CARD' ? 'bg-emerald-600 border-emerald-500 text-white' : 'bg-slate-800 border-slate-700 text-slate-300'
            }`}
          >
            <CreditCard className="w-5 h-5" />
            <span>CARD / NPASS</span>
          </button>
          <button
            onClick={() => setPaymentMethod('SPLIT')}
            className={`p-3 rounded-xl border flex flex-col items-center gap-1 font-bold text-xs ${
              paymentMethod === 'SPLIT' ? 'bg-emerald-600 border-emerald-500 text-white' : 'bg-slate-800 border-slate-700 text-slate-300'
            }`}
          >
            <Gift className="w-5 h-5" />
            <span>SPLIT / POINTS</span>
          </button>
        </div>

        {paymentMethod === 'CASH' && (
          <Input
            label="Cash Tendered (QAR)"
            type="number"
            value={cashTendered}
            onChange={(e) => setCashTendered(parseFloat(e.target.value) || 0)}
            className="text-lg font-bold font-mono"
          />
        )}

        <Button variant="primary" onClick={handleFinish} className="py-3 text-base font-black w-full flex items-center justify-center gap-2">
          <CheckCircle className="w-5 h-5" />
          <span>CONFIRM SALE & PRINT RECEIPT</span>
        </Button>
      </div>
    </Modal>
  );
};
