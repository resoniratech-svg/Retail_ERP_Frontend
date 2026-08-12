import React from 'react';
import { ERP_TOP_MODULES, TopModuleItem } from '../config/moduleNavigation';
import * as Icons from 'lucide-react';

export interface MainModuleNavigationProps {
  activeModuleId: string;
  onSelectModule: (module: TopModuleItem) => void;
  lang: 'en' | 'ar';
}

export const MainModuleNavigation: React.FC<MainModuleNavigationProps> = ({
  activeModuleId,
  onSelectModule,
  lang,
}) => {
  return (
    <nav className="h-9 bg-slate-800 border-b border-slate-700 flex items-center px-2 gap-1 overflow-x-auto select-none no-scrollbar">
      {ERP_TOP_MODULES.map((mod) => {
        const IconComponent = (Icons as any)[mod.iconName] || Icons.Box;
        const isActive = activeModuleId === mod.id;

        return (
          <button
            key={mod.id}
            onClick={() => onSelectModule(mod)}
            className={`px-3 py-1.5 rounded-t font-semibold text-xs flex items-center gap-1.5 transition-colors whitespace-nowrap ${
              isActive
                ? 'bg-slate-100 text-slate-900 shadow-sm border-t-2 border-t-emerald-500 font-bold'
                : 'text-slate-300 hover:bg-slate-700 hover:text-white'
            }`}
          >
            <IconComponent className={`w-3.5 h-3.5 ${isActive ? 'text-emerald-600' : 'text-slate-400'}`} />
            <span>{lang === 'ar' ? mod.labelAr : mod.label}</span>
          </button>
        );
      })}
    </nav>
  );
};
