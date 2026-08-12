import React from 'react';
import { Card, Button, Input, Select } from '@qatar-erp/ui';
import { Settings, Sliders, Database, BellRing } from 'lucide-react';

export const ControlPanelPage: React.FC = () => {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Control Panel & System Settings</h1>
        <p className="text-sm text-slate-500">Configure global parameters, backup schedules, and notification channels.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="p-6 flex flex-col gap-4">
          <h3 className="font-bold text-base flex items-center gap-2">
            <Sliders className="w-5 h-5 text-emerald-500" /> Currency & Tax Defaults
          </h3>
          <Select label="Base Currency" options={[{ value: 'QAR', label: 'QAR - Qatari Riyal (ر.ق)' }]} />
          <Input label="Default Qatar VAT Rate (%)" defaultValue="0" />
          <Input label="Invoice Numbering Prefix" defaultValue="QTR-2026-" />
          <Button variant="primary" className="w-fit self-end font-bold text-xs mt-2">Save Defaults</Button>
        </Card>

        <Card className="p-6 flex flex-col gap-4">
          <h3 className="font-bold text-base flex items-center gap-2">
            <Database className="w-5 h-5 text-sky-500" /> Automated Backup Schedule
          </h3>
          <Select label="Backup Frequency" options={[{ value: 'DAILY', label: 'Daily at 02:00 AM' }, { value: 'HOURLY', label: 'Every 6 Hours' }]} />
          <Input label="Local Backup Retention (Days)" defaultValue="30" />
          <Button variant="primary" className="w-fit self-end font-bold text-xs mt-2">Trigger Manual Backup</Button>
        </Card>
      </div>
    </div>
  );
};
