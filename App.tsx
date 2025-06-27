
import React, { useState, useCallback, useEffect, useMemo, createContext } from 'react';
import { TabId, AuthenticatedUser, UserRole, TabItem } from './types';
import Header from './components/Header';
import SidebarNav from './components/ui/SidebarNav'; 
import Dashboard from './components/Dashboard';
import RacaoManagement from './components/RacaoManagement';
import MortalidadeLog from './components/MortalidadeLog'; // Changed
import GpdCalculator from './components/GpdCalculator';
import BarracoesManagement from './components/BarracoesManagement';
import CalendarView from './components/CalendarView';
import RendimentoCalculator from './components/RendimentoCalculator';
import OsManagement from './components/OsManagement';
import ContatoForm from './components/ContatoForm';
import Login from './components/Login';
import Embarques from './components/Embarques'; // Added

const APP_NAME = "Sistema de Controle - Granja de Suínos Integrada";
const USER_STORAGE_KEY = 'pigFarmUser';

export const AppContext = createContext<{ currentUser: AuthenticatedUser | null } | null>(null);


const ALL_TAB_ITEMS: TabItem[] = [
  { id: TabId.Dashboard, label: 'Painel Principal', icon: 'fas fa-tachometer-alt' },
  { id: TabId.Racao, label: 'Gestão de Ração', icon: 'fas fa-seedling' },
  { id: TabId.Barracoes, label: 'Gestão de Barracões', icon: 'fas fa-th-large' },
  { id: TabId.Mortalidade, label: 'Registro de Mortalidade', icon: 'fas fa-book-dead' },
  { id: TabId.Embarques, label: 'Embarques', icon: 'fas fa-truck' },
  { id: TabId.GPD, label: 'Cálc. GPD', icon: 'fas fa-chart-line' },
  { id: TabId.Calendario, label: 'Calendário', icon: 'fas fa-calendar-alt' },
  { id: TabId.Rendimento, label: 'Rendimento Caminhão', icon: 'fas fa-truck-loading' },
  { id: TabId.OS, label: 'Ordens de Serviço', icon: 'fas fa-clipboard-list' },
  { id: TabId.Contato, label: 'Contato', icon: 'fas fa-envelope' },
];

const getTabsForRole = (role: UserRole | null): TabItem[] => {
  if (!role) return [];
  if (role === 'admin') {
    return ALL_TAB_ITEMS;
  }
  if (role === 'client') {
    return ALL_TAB_ITEMS.filter(tab =>
      [TabId.Dashboard, TabId.Racao, TabId.Mortalidade, TabId.GPD, TabId.Calendario, TabId.Contato].includes(tab.id)
    );
  }
  return [];
};

const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<AuthenticatedUser | null>(() => {
    const storedUser = localStorage.getItem(USER_STORAGE_KEY);
    return storedUser ? JSON.parse(storedUser) : null;
  });
  
  const [activeTab, setActiveTab] = useState<TabId>(currentUser ? TabId.Dashboard : TabId.Racao);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false); 

  const availableTabs = useMemo(() => getTabsForRole(currentUser?.role || null), [currentUser]);

  useEffect(() => {
    if (currentUser) {
      localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(currentUser));
      const currentTabs = getTabsForRole(currentUser.role);
      if (!currentTabs.find(tab => tab.id === activeTab)) {
        setActiveTab(currentTabs.find(tab => tab.id === TabId.Dashboard)?.id || currentTabs[0]?.id || TabId.Racao);
      }
    } else {
      localStorage.removeItem(USER_STORAGE_KEY);
      setIsSidebarOpen(false); 
    }
  }, [currentUser, activeTab]);
  
  const handleLoginSuccess = useCallback((user: AuthenticatedUser) => {
    setCurrentUser(user);
    setActiveTab(TabId.Dashboard);
    setIsSidebarOpen(false); 
  }, []);

  const handleLogout = useCallback(() => {
    setCurrentUser(null);
    setIsSidebarOpen(false);
  }, []);

  const handleTabChange = useCallback((tabId: TabId) => {
    setActiveTab(tabId);
    setIsSidebarOpen(false); 
  }, []);

  const toggleSidebar = useCallback(() => {
    setIsSidebarOpen(prev => !prev);
  }, []);

  const renderTabContent = () => {
    if (!currentUser) return null;

    switch (activeTab) {
      case TabId.Dashboard: return <Dashboard user={currentUser} onNavigate={handleTabChange} />;
      case TabId.Racao: return <RacaoManagement />;
      case TabId.Mortalidade: return <MortalidadeLog />; // Changed
      case TabId.GPD: return <GpdCalculator />;
      case TabId.Barracoes: return currentUser.role === 'admin' ? <BarracoesManagement /> : null;
      case TabId.Calendario: return <CalendarView />;
      case TabId.Rendimento: return currentUser.role === 'admin' ? <RendimentoCalculator /> : null;
      case TabId.OS: return currentUser.role === 'admin' ? <OsManagement /> : null;
      case TabId.Contato: return <ContatoForm />;
      case TabId.Embarques: return currentUser.role === 'admin' ? <Embarques /> : null; // Added
      default: return <Dashboard user={currentUser} onNavigate={handleTabChange} />;
    }
  };

  if (!currentUser) {
    return <Login onLoginSuccess={handleLoginSuccess} appName={APP_NAME} />;
  }

  return (
    <AppContext.Provider value={{ currentUser }}>
      <div className="min-h-screen bg-slate-100 flex flex-col">
        <Header 
          title={APP_NAME} 
          user={currentUser} 
          onLogout={handleLogout} 
          onToggleSidebar={toggleSidebar} 
        />
        <div className="flex flex-1 overflow-hidden"> 
          <SidebarNav
            isOpen={isSidebarOpen}
            onClose={toggleSidebar}
            navItems={availableTabs}
            activeTabId={activeTab}
            onNavItemClick={handleTabChange}
            appName={APP_NAME}
            user={currentUser}
          />
          <main 
            className={`flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto transition-opacity duration-300 ease-in-out 
                      ${isSidebarOpen && !window.matchMedia('(min-width: 768px)').matches ? 'opacity-50 blur-sm pointer-events-none' : 'opacity-100'}`}
          >
            <div className="bg-white p-6 rounded-lg shadow-xl min-h-full border border-slate-200"> 
              {renderTabContent()}
            </div>
          </main>
        </div>
      </div>
    </AppContext.Provider>
  );
};

export default App;
