import React, { useState } from 'react';
import { ERPTopHeader } from './components/ERPTopHeader';
import { MainModuleNavigation } from './components/MainModuleNavigation';
import { ERPModuleRibbon } from './components/ERPModuleRibbon';
import { WorkspaceTabs, TabItem } from './components/WorkspaceTabs';
import { ERPStatusBar } from './components/ERPStatusBar';
import { ERP_TOP_MODULES, TopModuleItem } from './config/moduleNavigation';
import { useLocation, useNavigate } from 'react-router-dom';

export const ERPLayout: React.FC<{ children?: React.ReactNode }> = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [lang, setLang] = useState<'en' | 'ar'>('en');

  const [activeModule, setActiveModule] = useState<TopModuleItem>(ERP_TOP_MODULES[1]); // Default Register/Inventory
  const [activeTabId, setActiveTabId] = useState<string>('products');
  const [tabs, setTabs] = useState<TabItem[]>([
    { id: 'products', title: 'Product Catalog', path: '/products', closable: false },
    { id: 'inventory', title: 'Stock Overview', path: '/stock', closable: true },
    { id: 'pos', title: 'POS Sales', path: '/pos', closable: true },
  ]);

  const handleToggleLang = () => {
    const nextLang = lang === 'en' ? 'ar' : 'en';
    setLang(nextLang);
    document.documentElement.dir = nextLang === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = nextLang;
  };

  const handleSelectModule = (mod: TopModuleItem) => {
    setActiveModule(mod);
    navigate(mod.defaultRoute);
  };

  const handleSelectTab = (tab: TabItem) => {
    setActiveTabId(tab.id);
    navigate(tab.path);
  };

  const handleCloseTab = (tabId: string) => {
    const updated = tabs.filter((t) => t.id !== tabId);
    setTabs(updated);
    if (activeTabId === tabId && updated.length > 0) {
      const nextTab = updated[updated.length - 1];
      setActiveTabId(nextTab.id);
      navigate(nextTab.path);
    }
  };

  return (
    <div className="h-screen w-screen flex flex-col bg-slate-100 font-sans text-slate-900 overflow-hidden select-none">
      {/* 1. TOP ERP HEADER */}
      <ERPTopHeader lang={lang} onToggleLang={handleToggleLang} />

      {/* 2. MAIN TOP MODULE NAVIGATION */}
      <MainModuleNavigation
        activeModuleId={activeModule.id}
        onSelectModule={handleSelectModule}
        lang={lang}
      />

      {/* 3. DYNAMIC RIBBON TOOLBAR */}
      <ERPModuleRibbon groups={activeModule.ribbonGroups} lang={lang} moduleId={['tradings', 'reports', 'accounts'].includes(activeModule.id) ? 'tradings' : activeModule.id} />

      {/* 4. WORKSPACE TABS */}
      <WorkspaceTabs
        tabs={tabs}
        activeTabId={activeTabId}
        onSelectTab={handleSelectTab}
        onCloseTab={handleCloseTab}
      />

      {/* 5. MAIN WORKSPACE AREA */}
      <div className="flex-1 flex overflow-hidden bg-white">
        <main className="flex-1 overflow-y-auto p-4 bg-slate-50">{children}</main>
      </div>

      {/* 6. BOTTOM STATUS BAR */}
      <ERPStatusBar />
    </div>
  );
};

export default ERPLayout;
