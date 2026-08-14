import React from 'react';
import { RibbonGroupItem } from '../config/moduleNavigation';
import { useNavigate } from 'react-router-dom';
import * as Icons from 'lucide-react';

export interface ERPModuleRibbonProps {
  groups: RibbonGroupItem[];
  lang: 'en' | 'ar';
  moduleId?: string;
}

export const ERPModuleRibbon: React.FC<ERPModuleRibbonProps> = ({ groups, lang, moduleId }) => {
  const navigate = useNavigate();

  const isScrollable = moduleId === 'tradings';
  const scrollClasses = isScrollable 
    ? 'overflow-x-auto overflow-y-hidden [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]'
    : '';

  return (
    <div className={`h-16 bg-slate-100 border-b border-slate-300 px-2 flex items-center gap-2 select-none font-sans text-slate-800 ${scrollClasses}`}>
      {groups.map((group, idx) => (
        <div key={idx} className="flex items-center gap-1 pr-2 border-r border-slate-300 last:border-r-0 h-12 shrink-0">
          {group.actions.map((act) => {
            const IconComp = (Icons as any)[act.iconName] || Icons.Box;

            return (
              <button
                key={act.id}
                onClick={() => navigate(act.route)}
                className="flex flex-col items-center justify-center px-1.5 py-1 rounded hover:bg-slate-200 active:bg-slate-300 transition-colors text-slate-700 hover:text-slate-900 group"
                title={act.shortcut ? `Shortcut: ${act.shortcut}` : undefined}
              >
                <IconComp className="w-4 h-4 text-emerald-600 group-hover:scale-110 transition-transform" />
                <span className="text-[10px] font-medium leading-tight mt-0.5 whitespace-nowrap">
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
