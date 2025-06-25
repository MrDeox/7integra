
import React, { useState, useCallback, useEffect, useMemo } from 'react';
import { TabId, AuthenticatedUser, UserRole, TabItem } from './types';
import Header from './components/Header';
import SidebarNav from './components/ui/SidebarNav'; // Import SidebarNav
import Dashboard from './components/Dashboard';
import RacaoManagement from './components/RacaoManagement';
import MortalidadeCalculator from './components/MortalidadeCalculator';
import GpdCalculator from './components/GpdCalculator';
import BarracoesManagement from './components/BarracoesManagement';
import CalendarView from './components/CalendarView';
import RendimentoCalculator from './components/RendimentoCalculator';
import OsManagement from './components/OsManagement';
import ContatoForm from './components/ContatoForm';
import Login from './components/Login';

const APP_NAME = "Sistema de Controle - Granja de Suínos Integrada";
const USER_STORAGE_KEY = 'pigFarmUser';

const ALL_TAB_ITEMS: TabItem[] = [
  { id: TabId.Dashboard, label: 'Painel Principal', icon: 'fas fa-tachometer-alt' },
  { id: TabId.Racao, label: 'Gestão de Ração', icon: 'fas fa-seedling' },
  { id: TabId.Mortalidade, label: 'Cálc. Mortalidade', icon: 'fas fa-skull-crossbones' },
  { id: TabId.GPD, label: 'Cálc. GPD', icon: 'fas fa-chart-line' },
  { id: TabId.Barracoes, label: 'Gestão de Barracões', icon: 'fas fa-th-large' },
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
  const [isSidebarOpen, setIsSidebarOpen] = useState(false); // State for sidebar

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
      setIsSidebarOpen(false); // Close sidebar on logout
    }
  }, [currentUser, activeTab]);
  
  const handleLoginSuccess = useCallback((user: AuthenticatedUser) => {
    setCurrentUser(user);
    setActiveTab(TabId.Dashboard);
    setIsSidebarOpen(false); // Ensure sidebar is closed on new login
  }, []);

  const handleLogout = useCallback(() => {
    setCurrentUser(null);
    setIsSidebarOpen(false);
  }, []);

  const handleTabChange = useCallback((tabId: TabId) => {
    setActiveTab(tabId);
    setIsSidebarOpen(false); // Close sidebar when a tab is selected
  }, []);

  const toggleSidebar = useCallback(() => {
    setIsSidebarOpen(prev => !prev);
  }, []);

  const renderTabContent = () => {
    if (!currentUser) return null;

    switch (activeTab) {
      case TabId.Dashboard: return <Dashboard user={currentUser} onNavigate={handleTabChange} />; // Pass handleTabChange for navigation from dashboard
      case TabId.Racao: return <RacaoManagement />;
      case TabId.Mortalidade: return <MortalidadeCalculator />;
      case TabId.GPD: return <GpdCalculator />;
      case TabId.Barracoes: return currentUser.role === 'admin' ? <BarracoesManagement /> : null;
      case TabId.Calendario: return <CalendarView />;
      case TabId.Rendimento: return currentUser.role === 'admin' ? <RendimentoCalculator /> : null;
      case TabId.OS: return currentUser.role === 'admin' ? <OsManagement /> : null;
      case TabId.Contato: return <ContatoForm />;
      default: return <Dashboard user={currentUser} onNavigate={handleTabChange} />;
    }
  };

  if (!currentUser) {
    return <Login onLoginSuccess={handleLoginSuccess} appName={APP_NAME} />;
  }

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col">
      <Header 
        title={APP_NAME} 
        user={currentUser} 
        onLogout={handleLogout} 
        onToggleSidebar={toggleSidebar} 
      />
      <div className="flex flex-1 overflow-hidden"> {/* Ensure flex container for sidebar and content */}
        <SidebarNav
          isOpen={isSidebarOpen}
          onClose={toggleSidebar}
          navItems={availableTabs}
          activeTabId={activeTab}
          onNavItemClick={handleTabChange}
          appName={APP_NAME}
          user={currentUser}
        />
        {/* Main content area */}
        <main 
          className={`flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto transition-all duration-300 ease-in-out ${isSidebarOpen && !window.matchMedia('(min-width: 768px)').matches ? 'blur-sm pointer-events-none' : ''}`}
        >
          {/* Removed fixed height and adjusted padding to be directly on content if needed */}
          <div className="bg-white p-6 rounded-lg shadow-lg min-h-full"> 
            {renderTabContent()}
          </div>
        </main>
      </div>
    </div>
  );
};

export default App;