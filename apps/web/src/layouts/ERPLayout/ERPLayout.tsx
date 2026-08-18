import React, { useState } from 'react';
import { ERPTopHeader } from './components/ERPTopHeader';
import { MainModuleNavigation } from './components/MainModuleNavigation';
import { ERPModuleRibbon } from './components/ERPModuleRibbon';
import { WorkspaceTabs, TabItem } from './components/WorkspaceTabs';
import { ERPStatusBar } from './components/ERPStatusBar';
import { ERP_TOP_MODULES, TopModuleItem } from './config/moduleNavigation';
import { useLocation, useNavigate } from 'react-router-dom';

const ROUTE_TAB_MAP: Record<string, { id: string; title: string }> = {
  '/products': { id: 'products', title: 'Products' },
  '/hr': { id: 'user-accounts', title: 'User Accounts' },
  '/employees': { id: 'user-accounts', title: 'User Accounts' },
  '/pos': { id: 'pos', title: 'POS Sales' },
  '/day-close': { id: 'day-close', title: 'Day Close' },
  '/stock': { id: 'stock', title: 'Stock Report' },
  '/vendors': { id: 'vendors', title: 'Vendors' },
  '/suppliers': { id: 'vendors', title: 'Vendors' },
  '/customers': { id: 'customers', title: 'Customer' },
  '/roles': { id: 'roles', title: 'Roles' },
  '/roles-permissions': { id: 'roles', title: 'Roles' },
  '/locations': { id: 'locations', title: 'Location' },
  '/branches': { id: 'locations', title: 'Location' },
  '/departments': { id: 'departments', title: 'Departments' },
  '/sub-departments': { id: 'sub-departments', title: 'Sub Departments' },
  '/brands': { id: 'brands', title: 'Brands' },
  '/categories': { id: 'categories', title: 'Categories' },
  '/sub-categories': { id: 'sub-categories', title: 'Sub Categories' },
  '/work-shifts': { id: 'work-shifts', title: 'Work Shift' },
  '/work-shift-assignments': { id: 'work-shift-assignments', title: 'Work Shift Assignment' },
  '/delivery-agents': { id: 'delivery-agents', title: 'Delivery Agents' },
  '/customer-business-types': { id: 'customer-business-types', title: 'Customer Business Type' },
  '/production-material': { id: 'production-materials', title: 'Production Materials' },
  '/taxes': { id: 'taxes', title: 'Taxes' },
  '/units': { id: 'units', title: 'Units' },
};

export const ERPLayout: React.FC<{ children?: React.ReactNode }> = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [lang, setLang] = useState<'en' | 'ar'>('en');

  const [activeModule, setActiveModule] = useState<TopModuleItem>(ERP_TOP_MODULES[1]);
  const [activeTabId, setActiveTabId] = useState<string>('products');
  const [tabs, setTabs] = useState<TabItem[]>([]);

  React.useEffect(() => {
    const currentPath = location.pathname;

    // 1. Sync Active Top Module
    const foundModule = ERP_TOP_MODULES.find((mod) =>
      mod.ribbonGroups.some((grp) =>
        grp.actions.some((act) => {
          if (!act.route) return false;
          if (act.route === currentPath) return true;
          if ((currentPath === '/roles' || currentPath === '/roles-permissions') && (act.route === '/roles-permissions' || act.route === '/roles')) return true;
          if ((currentPath === '/locations' || currentPath === '/branches') && (act.route === '/locations' || act.route === '/branches')) return true;
          if ((currentPath === '/vendors' || currentPath === '/suppliers') && (act.route === '/suppliers' || act.route === '/vendors')) return true;
          return false;
        })
      )
    );
    if (foundModule) {
      setActiveModule(foundModule);
    }

    // 2. Sync Dynamic Workspace Tabs
    const defaultTitle = currentPath === '/' ? 'Home' : currentPath.replace('/', '').replace(/-/g, ' ');
    const formattedTitle = defaultTitle.charAt(0).toUpperCase() + defaultTitle.slice(1);
    const tabInfo = ROUTE_TAB_MAP[currentPath] || {
      id: currentPath.replace('/', '') || 'home',
      title: formattedTitle,
    };

    setActiveTabId(tabInfo.id);

    setTabs((prevTabs) => {
      const exists = prevTabs.some((t) => t.id === tabInfo.id || t.path === currentPath);
      if (exists) {
        return prevTabs.map((t) => (t.path === currentPath ? { ...t, id: tabInfo.id, title: tabInfo.title } : t));
      }
      return [...prevTabs, { id: tabInfo.id, title: tabInfo.title, path: currentPath, closable: true }];
    });
  }, [location.pathname]);

  React.useEffect(() => {
    const handleTabRename = (e: any) => {
      if (e.detail?.title) {
        setTabs((prev) =>
          prev.map((t) => (t.id === activeTabId || t.path === location.pathname ? { ...t, title: e.detail.title } : t))
        );
      }
    };
    window.addEventListener('qatar_erp_active_tab_rename', handleTabRename);
    return () => window.removeEventListener('qatar_erp_active_tab_rename', handleTabRename);
  }, [activeTabId, location.pathname]);

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
