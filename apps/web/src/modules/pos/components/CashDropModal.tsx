import React, { useState } from 'react';
import { Modal, Button, Input } from '@qatar-erp/ui';

export interface CashDropModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CashDropModal: React.FC<CashDropModalProps> = ({ isOpen, onClose }) => {
  const [dropAmount, setDropAmount] = useState<number>(500);
  const [reason, setReason] = useState('Safe Transfer');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Record Cash Drop / Safe Transfer">
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <Input
          label="Amount to Drop (QAR)"
          type="number"
          value={dropAmount}
          onChange={(e) => setDropAmount(parseFloat(e.target.value) || 0)}
          className="text-lg font-bold font-mono"
          required
        />
        <Input
          label="Reason / Notes"
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          placeholder="e.g. Excess Cash Safe Deposit"
          required
        />
        <Button type="submit" variant="primary" className="py-2.5 font-bold mt-2">
          Confirm Cash Drop
        </Button>
      </form>
    </Modal>
  );
};
