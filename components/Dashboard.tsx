import React, { useEffect, useState } from 'react';
import { AuthenticatedUser, TabId, OrdemServico, CalendarEvent } from '../types';
import Button from './ui/Button';

interface DashboardProps {
  user: AuthenticatedUser;
  onNavigate: (tabId: TabId) => void;
}

const DashboardCard: React.FC<{ title: string; children: React.ReactNode; className?: string }> = ({ title, children, className }) => (
  <div className={`bg-white p-6 rounded-xl shadow-lg ${className || ''}`}>
    <h3 className="text-xl font-semibold text-slate-700 mb-4">{title}</h3>
    {children}
  </div>
);

const Dashboard: React.FC<DashboardProps> = ({ user, onNavigate }) => {
  const [activeOsCount, setActiveOsCount] = useState(0);
  const [upcomingEvents, setUpcomingEvents] = useState<CalendarEvent[]>([]);

  useEffect(() => {
    // Load OS data for admin
    if (user.role === 'admin') {
      const storedOsList = localStorage.getItem('osList');
      if (storedOsList) {
        const osList: OrdemServico[] = JSON.parse(storedOsList);
        setActiveOsCount(osList.filter(os => os.status !== 'Concluído').length);
      }
    }

    // Load Calendar events for both roles
    const storedEvents = localStorage.getItem('calendarEvents');
    if (storedEvents) {
      const events: CalendarEvent[] = JSON.parse(storedEvents);
      const today = new Date();
      today.setHours(0,0,0,0); // Start of today
      
      const futureEvents = events
        .filter(event => new Date(event.date) >= today)
        .sort((a,b) => new Date(a.date).getTime() - new Date(b.date).getTime())
        .slice(0, 3); // Get up to 3 upcoming events
      setUpcomingEvents(futureEvents);
    }
  }, [user.role]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    // Adjust for timezone offset to display correct date
    const userTimezoneOffset = date.getTimezoneOffset() * 60000;
    return new Date(date.getTime() + userTimezoneOffset).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'short',
    });
  };

  return (
    <div className="space-y-8">
      <div className="bg-white p-6 rounded-xl shadow-lg">
        <h2 className="text-3xl font-bold text-sky-700 mb-2">
          Bem-vindo(a), {user.username}!
        </h2>
        <p className="text-slate-600">
          Este é o seu painel de controle para a Granja de Suínos Integrada.
        </p>
      </div>

      {user.role === 'admin' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <DashboardCard title="Ordens de Serviço">
            <p className="text-3xl font-bold text-blue-500">{activeOsCount}</p>
            <p className="text-slate-500 mb-3">OS ativas ou em andamento.</p>
            <Button onClick={() => onNavigate(TabId.OS)} size="sm">
              <i className="fas fa-tasks mr-2"></i>Ver Ordens de Serviço
            </Button>
          </DashboardCard>
          
          <DashboardCard title="Ações Rápidas">
            <div className="space-y-3">
              <Button onClick={() => onNavigate(TabId.OS)} variant="secondary" className="w-full justify-start">
                <i className="fas fa-plus-circle mr-2"></i>Nova Ordem de Serviço
              </Button>
              <Button onClick={() => onNavigate(TabId.Calendario)} variant="secondary" className="w-full justify-start">
                <i className="fas fa-calendar-plus mr-2"></i>Adicionar Evento
              </Button>
               <Button onClick={() => onNavigate(TabId.Barracoes)} variant="secondary" className="w-full justify-start">
                <i className="fas fa-th-large mr-2"></i>Gerenciar Barracões
              </Button>
            </div>
          </DashboardCard>
        </div>
      )}

      {user.role === 'client' && (
         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <DashboardCard title="Acesso Rápido">
              <div className="space-y-3">
                <Button onClick={() => onNavigate(TabId.Racao)} variant="secondary" className="w-full justify-start">
                    <i className="fas fa-seedling mr-2"></i>Gestão de Ração
                </Button>
                <Button onClick={() => onNavigate(TabId.Mortalidade)} variant="secondary" className="w-full justify-start">
                    <i className="fas fa-skull-crossbones mr-2"></i>Calcular Mortalidade
                </Button>
                <Button onClick={() => onNavigate(TabId.GPD)} variant="secondary" className="w-full justify-start">
                    <i className="fas fa-chart-line mr-2"></i>Calcular GPD
                </Button>
                <Button onClick={() => onNavigate(TabId.Contato)} variant="secondary" className="w-full justify-start">
                    <i className="fas fa-envelope mr-2"></i>Falar com Administrador
                </Button>
              </div>
            </DashboardCard>
        </div>
      )}
      
      <DashboardCard title="Próximos Eventos no Calendário" className={user.role === 'admin' ? 'md:col-span-2 lg:col-span-1' : 'md:col-span-2'}>
          {upcomingEvents.length > 0 ? (
            <ul className="space-y-3">
              {upcomingEvents.map(event => (
                <li key={event.id} className="flex items-center space-x-3 p-3 bg-slate-50 rounded-md">
                  <div className="w-10 h-10 rounded flex items-center justify-center text-white text-sm font-semibold" style={{backgroundColor: event.color}}>
                    {formatDate(event.date)}
                  </div>
                  <div>
                    <p className="font-semibold text-slate-700">{event.title}</p>
                    {event.description && <p className="text-xs text-slate-500 truncate">{event.description}</p>}
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-slate-500">Nenhum evento futuro agendado.</p>
          )}
          <Button onClick={() => onNavigate(TabId.Calendario)} size="sm" className="mt-4">
            <i className="fas fa-calendar-alt mr-2"></i>Ver Calendário Completo
          </Button>
        </DashboardCard>

    </div>
  );
};

export default Dashboard;