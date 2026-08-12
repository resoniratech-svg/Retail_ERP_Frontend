import React from 'react';
import { useAuth } from '../../../app/providers/AuthProvider';
import { Globe, User as UserIcon, LogOut, Database, Server } from 'lucide-react';

export interface ERPTopHeaderProps {
  lang: 'en' | 'ar';
  onToggleLang: () => void;
}

export const ERPTopHeader: React.FC<ERPTopHeaderProps> = ({ lang, onToggleLang }) => {
  const { user, logout } = useAuth();

  return (
    <header className="h-9 bg-slate-900 text-slate-200 border-b border-slate-800 flex items-center justify-between px-3 text-xs select-none">
      <div className="flex items-center gap-3 font-sans">
        <div className="flex items-center gap-1.5 font-bold tracking-tight">
          <div className="w-5 h-5 rounded bg-emerald-500 text-slate-950 font-black text-xs flex items-center justify-center">
            Q
          </div>
          <span className="text-white text-xs font-semibold">
            {lang === 'ar' ? 'نظام قطر للتجزئة ERP' : 'Qatar Retail ERP Desktop'}
          </span>
        </div>
        <span className="text-slate-600">|</span>
        <span className="text-slate-400 font-mono text-[11px] flex items-center gap-1">
          <Database className="w-3 h-3 text-emerald-400" />
          <span>DB: retail_qatar_db</span>
        </span>
        <span className="text-slate-600">|</span>
        <span className="text-slate-400 text-[11px] flex items-center gap-1">
          <Server className="w-3 h-3 text-sky-400" />
          <span>Branch: {user?.branchName || 'Doha Main Branch'}</span>
        </span>
      </div>

      <div className="flex items-center gap-3">
        <button
          onClick={onToggleLang}
          className="flex items-center gap-1 px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold border border-slate-700 text-[11px]"
        >
          <Globe className="w-3 h-3 text-emerald-400" />
          <span>{lang === 'en' ? 'العربية (AR)' : 'English (EN)'}</span>
        </button>

        <div className="flex items-center gap-1.5 text-slate-300 font-medium text-[11px] bg-slate-800/80 px-2 py-0.5 rounded border border-slate-700">
          <UserIcon className="w-3 h-3 text-emerald-400" />
          <span>{user ? `${user.firstName} ${user.lastName} (${user.role})` : 'Ahmed Al-Mansouri (SUPER_ADMIN)'}</span>
        </div>

        <button
          onClick={logout}
          className="flex items-center gap-1 px-2 py-0.5 rounded bg-rose-950/80 hover:bg-rose-900 text-rose-200 font-semibold border border-rose-800/80 text-[11px] transition-colors"
          title="Sign Out"
        >
          <LogOut className="w-3 h-3 text-rose-400" />
          <span>Sign Out</span>
        </button>
      </div>
    </header>
  );
};
