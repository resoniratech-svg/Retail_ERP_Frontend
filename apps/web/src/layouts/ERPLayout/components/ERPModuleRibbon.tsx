import React from 'react';
import { RibbonGroupItem } from '../config/moduleNavigation';
import { useNavigate } from 'react-router-dom';
import * as Icons from 'lucide-react';

export interface ERPModuleRibbonProps {
  groups: RibbonGroupItem[];
  lang: 'en' | 'ar';
}

export const ERPModuleRibbon: React.FC<ERPModuleRibbonProps> = ({ groups, lang }) => {
  const navigate = useNavigate();

  return (
    <div className="h-16 bg-slate-100 border-b border-slate-300 px-3 flex items-center gap-4 overflow-x-auto select-none font-sans text-slate-800">
      {groups.map((group, idx) => (
        <div key={idx} className="flex items-center gap-2 pr-4 border-r border-slate-300 last:border-r-0 h-12">
          {group.actions.map((act) => {
            const IconComp = (Icons as any)[act.iconName] || Icons.Box;

            return (
              <button
                key={act.id}
                onClick={() => navigate(act.route)}
                className="flex flex-col items-center justify-center px-2.5 py-1 rounded hover:bg-slate-200 active:bg-slate-300 transition-colors text-slate-700 hover:text-slate-900 group"
                title={act.shortcut ? `Shortcut: ${act.shortcut}` : undefined}
              >
                <IconComp className="w-4 h-4 text-emerald-600 group-hover:scale-110 transition-transform" />
                <span className="text-[11px] font-medium leading-tight mt-0.5 whitespace-nowrap">
                  {lang === 'ar' && act.labelAr ? act.labelAr : act.label}
                </span>
              </button>
            );
          })}
        </div>
      ))}
    </div>
  );
};
