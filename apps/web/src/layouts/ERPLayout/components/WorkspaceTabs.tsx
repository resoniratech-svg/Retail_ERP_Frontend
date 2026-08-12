import React from 'react';
import { X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export interface TabItem {
  id: string;
  title: string;
  path: string;
  closable?: boolean;
}

export interface WorkspaceTabsProps {
  tabs: TabItem[];
  activeTabId: string;
  onSelectTab: (tab: TabItem) => void;
  onCloseTab: (tabId: string) => void;
}

export const WorkspaceTabs: React.FC<WorkspaceTabsProps> = ({
  tabs,
  activeTabId,
  onSelectTab,
  onCloseTab,
}) => {
  return (
    <div className="h-8 bg-slate-200 border-b border-slate-300 flex items-center px-2 gap-1 overflow-x-auto select-none">
      {tabs.map((t) => {
        const isActive = activeTabId === t.id;

        return (
          <div
            key={t.id}
            onClick={() => onSelectTab(t)}
            className={`h-7 px-2.5 rounded-t text-xs font-semibold flex items-center gap-2 cursor-pointer transition-colors border-t border-x border-slate-300 border-b-0 ${
              isActive ? 'bg-white text-slate-900 font-bold border-t-emerald-500' : 'bg-slate-100 text-slate-600 hover:bg-slate-50'
            }`}
          >
            <span>{t.title}</span>
            {t.closable && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onCloseTab(t.id);
                }}
                className="w-3.5 h-3.5 rounded-full hover:bg-slate-300 flex items-center justify-center text-slate-400 hover:text-slate-700"
              >
                <X className="w-2.5 h-2.5" />
              </button>
            )}
          </div>
        );
      })}
    </div>
  );
};
