import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../app/providers/AuthProvider';
import { Wifi, Database, CheckCircle2 } from 'lucide-react';

export const ERPStatusBar: React.FC = () => {
  const { user } = useAuth();
  const [now, setNow] = useState(new Date().toLocaleTimeString());

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date().toLocaleTimeString()), 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <footer className="h-6 bg-slate-900 text-slate-300 border-t border-slate-800 flex items-center justify-between px-3 text-[11px] font-mono select-none">
      <div className="flex items-center gap-3">
        <span className="flex items-center gap-1 text-emerald-400 font-semibold">
          <CheckCircle2 className="w-3 h-3" /> Administrator Logged In ({user?.username || 'admin'})
        </span>
        <span className="text-slate-600">|</span>
        <span className="flex items-center gap-1 text-sky-400">
          <Wifi className="w-3 h-3" /> Connected To Server (Localhost:5173)
        </span>
        <span className="text-slate-600">|</span>
        <span className="flex items-center gap-1 text-purple-400">
          <Database className="w-3 h-3" /> Database: retail_qatar_db
        </span>
      </div>

      <div className="flex items-center gap-3">
        <span className="text-slate-400">Version 1.4.2-desktop</span>
        <span className="text-slate-600">|</span>
        <span className="text-amber-400 font-bold">{now}</span>
      </div>
    </footer>
  );
};
