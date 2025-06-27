import React, { useEffect, useState } from 'react';
import { AuthenticatedUser, TabId, OrdemServico, CalendarEvent, ActivityLogItem } from '../types';
import Button from './ui/Button';
import { getActivities } from '../utils/activityLog'; // Import activity log utility

interface DashboardProps {
  user: AuthenticatedUser;
  onNavigate: (tabId: TabId) => void;
}

const DashboardCard: React.FC<{ title: string; icon?: string; children: React.ReactNode; className?: string }> = ({ title, icon, children, className }) => (
  <div className={`bg-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300 ${className || ''}`}>
    <h3 className="text-xl font-semibold text-slate-700 mb-4 flex items-center">
      {icon && <i className={`${icon} mr-3 text-sky-500 text-lg`}></i>}
      {title}
    </h3>
    {children}
  </div>
);

const formatRelativeTime = (isoTimestamp: string): string => {
  const date = new Date(isoTimestamp);
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffInSeconds < 60) return `há ${diffInSeconds} seg`;
  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) return `há ${diffInMinutes} min`;
  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) return `há ${diffInHours}h`;
  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays === 1) return `ontem`;
  if (diffInDays < 7) return `há ${diffInDays} dias`;
  
  return date.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' });
};


const Dashboard: React.FC<DashboardProps> = ({ user, onNavigate }) => {
  const [activeOsCount, setActiveOsCount] = useState(0);
  const [upcomingEvents, setUpcomingEvents] = useState<CalendarEvent[]>([]);
  const [recentActivities, setRecentActivities] = useState<ActivityLogItem[]>([]);

  useEffect(() => {
    // Load OS data for admin
    if (user.role === 'admin') {
      const storedOsList = localStorage.getItem('osList');
      if (storedOsList) {
        const osList: OrdemServico[] = JSON.parse(storedOsList);
        setActiveOsCount(osList.filter(os => os.status !== 'Concluído').length);
      }
      setRecentActivities(getActivities().slice(0, 5)); // Get last 5 activities for admin
    }

    // Load Calendar events for both roles
    const storedEvents = localStorage.getItem('calendarEvents');
    if (storedEvents) {
      const events: CalendarEvent[] = JSON.parse(storedEvents);
      const today = new Date();
      today.setHours(0,0,0,0); 
      
      const futureEvents = events
        .filter(event => {
            // Adjust for timezone when comparing dates
            const eventDate = new Date(event.date);
            const eventDateWithoutTime = new Date(eventDate.getFullYear(), eventDate.getMonth(), eventDate.getDate());
            return eventDateWithoutTime >= today;
        })
        .sort((a,b) => new Date(a.date).getTime() - new Date(b.date).getTime())
        .slice(0, 3); 
      setUpcomingEvents(futureEvents);
    }
  }, [user.role]);

  const formatDateForCalendarCard = (dateString: string) => {
    const date = new Date(dateString);
    const userTimezoneOffset = date.getTimezoneOffset() * 60000;
    return new Date(date.getTime() + userTimezoneOffset).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'short',
    });
  };

  return (
    <div className="space-y-8">
      <div className="bg-gradient-to-r from-sky-600 to-blue-600 text-white p-6 sm:p-8 rounded-xl shadow-lg">
        <h2 className="text-3xl sm:text-4xl font-bold mb-1">
          Bem-vindo(a), {user.username}!
        </h2>
        <p className="text-sky-100 text-sm sm:text-base">
          Seu painel de controle para a Granja de Suínos Integrada.
        </p>
      </div>

      <div className={`grid grid-cols-1 md:grid-cols-2 ${user.role === 'admin' ? 'lg:grid-cols-3' : 'lg:grid-cols-2'} gap-6`}>
        {user.role === 'admin' && (
          <>
            <DashboardCard title="Ordens de Serviço" icon="fas fa-clipboard-list">
              <p className="text-4xl font-bold text-blue-500">{activeOsCount}</p>
              <p className="text-slate-500 mb-4 text-sm">OS ativas ou em andamento.</p>
              <Button onClick={() => onNavigate(TabId.OS)} size="sm" variant="secondary">
                <i className="fas fa-tasks mr-2"></i>Ver Ordens de Serviço
              </Button>
            </DashboardCard>
            
            <DashboardCard title="Ações Rápidas" icon="fas fa-rocket">
              <div className="space-y-3">
                <Button onClick={() => onNavigate(TabId.OS)} variant="light" className="w-full justify-start !py-2.5">
                  <i className="fas fa-plus-circle mr-2 text-sky-500"></i>Nova Ordem de Serviço
                </Button>
                <Button onClick={() => onNavigate(TabId.Calendario)} variant="light" className="w-full justify-start !py-2.5">
                  <i className="fas fa-calendar-plus mr-2 text-green-500"></i>Adicionar Evento
                </Button>
                 <Button onClick={() => onNavigate(TabId.Barracoes)} variant="light" className="w-full justify-start !py-2.5">
                  <i className="fas fa-th-large mr-2 text-amber-500"></i>Gerenciar Barracões
                </Button>
              </div>
            </DashboardCard>
          </>
        )}

        {user.role === 'client' && (
            <DashboardCard title="Acesso Rápido" icon="fas fa-rocket">
              <div className="space-y-3">
                <Button onClick={() => onNavigate(TabId.Racao)} variant="light" className="w-full justify-start !py-2.5">
                    <i className="fas fa-seedling mr-2 text-lime-500"></i>Gestão de Ração
                </Button>
                <Button onClick={() => onNavigate(TabId.Mortalidade)} variant="light" className="w-full justify-start !py-2.5">
                    <i className="fas fa-skull-crossbones mr-2 text-red-500"></i>Calcular Mortalidade
                </Button>
                <Button onClick={() => onNavigate(TabId.GPD)} variant="light" className="w-full justify-start !py-2.5">
                    <i className="fas fa-chart-line mr-2 text-purple-500"></i>Calcular GPD
                </Button>
                <Button onClick={() => onNavigate(TabId.Contato)} variant="light" className="w-full justify-start !py-2.5">
                    <i className="fas fa-envelope mr-2 text-teal-500"></i>Falar com Administrador
                </Button>
              </div>
            </DashboardCard>
        )}
        
        <DashboardCard title="Próximos Eventos" icon="fas fa-calendar-check" className={user.role === 'admin' ? '' : 'lg:col-span-1'}>
            {upcomingEvents.length > 0 ? (
              <ul className="space-y-3">
                {upcomingEvents.map(event => (
                  <li key={event.id} className="flex items-start space-x-3 p-3 bg-slate-50 hover:bg-slate-100 rounded-lg transition-colors duration-150">
                    <div className="w-12 h-12 rounded-md flex flex-col items-center justify-center text-white text-xs font-semibold leading-tight" style={{backgroundColor: event.color}}>
                      <span>{formatDateForCalendarCard(event.date).split('/')[0]}</span>
                       <span className="opacity-80">{formatDateForCalendarCard(event.date).split('/')[1]}</span>
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold text-slate-800 text-sm">{event.title}</p>
                      {event.description && <p className="text-xs text-slate-500 truncate max-w-xs">{event.description}</p>}
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="text-center py-4">
                <i className="fas fa-calendar-times fa-2x text-slate-400 mb-2"></i>
                <p className="text-slate-500 text-sm">Nenhum evento futuro agendado.</p>
              </div>
            )}
            <Button onClick={() => onNavigate(TabId.Calendario)} size="sm" variant="secondary" className="mt-4">
              <i className="fas fa-calendar-alt mr-2"></i>Ver Calendário Completo
            </Button>
          </DashboardCard>

        {user.role === 'admin' && (
          <DashboardCard title="Atividade Recente" icon="fas fa-history" className="md:col-span-2 lg:col-span-3">
            {recentActivities.length > 0 ? (
              <ul className="space-y-2">
                {recentActivities.map(activity => (
                  <li key={activity.id} className="flex items-center space-x-3 p-2.5 bg-slate-50 hover:bg-slate-100 rounded-md text-sm transition-colors duration-150">
                    <i className={`${activity.icon || 'fas fa-info-circle'} w-5 text-center text-slate-500`}></i>
                    <span className="flex-1 text-slate-700">{activity.description}</span>
                    <span className="text-xs text-slate-400">{formatRelativeTime(activity.timestamp)}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="text-center py-4">
                 <i className="fas fa-stream fa-2x text-slate-400 mb-2"></i>
                <p className="text-slate-500 text-sm">Nenhuma atividade recente registrada.</p>
              </div>
            )}
          </DashboardCard>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
