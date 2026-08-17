import React, { useState, useEffect } from 'react';
import { RibbonGroupItem } from '../config/moduleNavigation';
import { useNavigate, useLocation, useSearchParams } from 'react-router-dom';
import * as Icons from 'lucide-react';
import { POSConfigModal } from '../../../modules/pos/components/POSConfigModal';

export interface ERPModuleRibbonProps {
  groups: RibbonGroupItem[];
  lang: 'en' | 'ar';
  moduleId?: string;
}

export const ERPModuleRibbon: React.FC<ERPModuleRibbonProps> = ({ groups, lang, moduleId }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const currentPath = location.pathname;
  const currentSearch = location.search;

  const [isConfigModalOpen, setIsConfigModalOpen] = useState(false);

  useEffect(() => {
    if (searchParams.get('config') === 'true' || currentSearch.includes('config=true')) {
      setIsConfigModalOpen(true);
    }
  }, [searchParams, currentSearch, location.key]);

  const isScrollable = moduleId === 'tradings';
  const scrollClasses = isScrollable
    ? 'overflow-x-auto overflow-y-hidden [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]'
    : '';

  const isActionActive = (actId: string, route: string) => {
    if (actId === 'pos-config') {
      return isConfigModalOpen;
    }
    if (actId === 'reg-quick-barcode') {
      return currentPath === '/batch-barcode' && currentSearch.includes('quickPrint=true');
    }
    if (actId === 'reg-barcode') {
      return currentPath === '/batch-barcode' && !currentSearch.includes('quickPrint=true');
    }
    if (actId === 'reg-loc-access') {
      return (currentPath === '/roles-permissions' || currentPath === '/roles') && currentSearch.includes('locationAccess=true');
    }
    if (actId === 'reg-roles') {
      return (currentPath === '/roles-permissions' || currentPath === '/roles') && !currentSearch.includes('locationAccess=true');
    }
    if (actId === 'reg-loc') {
      return currentPath === '/locations' || currentPath === '/branches';
    }
    if (actId === 'reg-vendor') {
      return currentPath === '/suppliers' || currentPath === '/vendors';
    }

    if (!route) return false;
    return currentPath === route || currentPath.startsWith(route + '/');
  };

  return (
    <>
      <div className={`h-16 bg-slate-100 border-b border-slate-300 px-2 flex items-center gap-2 select-none font-sans text-slate-800 ${scrollClasses}`}>
        {groups.map((group, idx) => (
          <div key={idx} className="flex items-center gap-1 pr-2 border-r border-slate-300 last:border-r-0 h-12 shrink-0">
            {group.actions.map((act) => {
              const IconComp = (Icons as any)[act.iconName] || Icons.Box;
              const active = isActionActive(act.id, act.route);

              return (
                <button
                  key={act.id}
                  onClick={() => {
                    if (act.id === 'pos-config') {
                      setIsConfigModalOpen(true);
                    } else if (act.id === 'reg-quick-barcode') {
                      navigate(`/batch-barcode?quickPrint=true&t=${Date.now()}`);
                    } else if (act.id === 'reg-loc-access') {
                      navigate(`/roles-permissions?locationAccess=true&t=${Date.now()}`);
                    } else {
                      navigate(act.route);
                    }
                  }}
                  className={`flex flex-col items-center justify-center px-2 py-1 rounded transition-all text-slate-700 group border ${
                    active
                      ? 'bg-emerald-200 text-emerald-950 font-bold border-emerald-400 shadow-xs ring-1 ring-emerald-400/60 scale-[1.02]'
                      : 'border-transparent hover:bg-slate-200 hover:text-slate-900 active:bg-slate-300'
                  }`}
                  title={act.shortcut ? `Shortcut: ${act.shortcut}` : undefined}
                >
                  <IconComp
                    className={`w-4 h-4 transition-transform group-hover:scale-110 ${
                      active ? 'text-emerald-800 stroke-[2.5]' : 'text-emerald-600'
                    }`}
                  />
                  <span
                    className={`text-[10px] leading-tight mt-0.5 whitespace-nowrap ${
                      active ? 'font-bold text-emerald-950' : 'font-medium'
                    }`}
                  >
                    {lang === 'ar' && act.labelAr ? act.labelAr : act.label}
                  </span>
                </button>
              );
            })}
          </div>
        ))}
      </div>

      {/* POS CONFIGURATIONS MODAL */}
      <POSConfigModal isOpen={isConfigModalOpen} onClose={() => setIsConfigModalOpen(false)} />
    </>
  );
};

export default ERPModuleRibbon;
