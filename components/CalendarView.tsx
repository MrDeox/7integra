
import React, { useState, useCallback, useEffect, useContext } from 'react';
import { CalendarEvent } from '../types';
import Button from './ui/Button';
import EventModal from './EventModal';
import { AppContext } from '../App'; // Assuming AppContext is exported and provides currentUser

const daysOfWeek = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

const CalendarView: React.FC = () => {
  const appContext = useContext(AppContext); // For activity log user context
  const currentUser = appContext?.currentUser;

  const [currentDate, setCurrentDate] = useState(new Date());
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  // No need for selectedEvent, eventToEdit handles both new and edit states
  const [eventToEdit, setEventToEdit] = useState<CalendarEvent | undefined>(undefined);


  const renderCalendar = useCallback(() => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDayOfMonth = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    const days = [];
    for (let i = 0; i < firstDayOfMonth; i++) {
      days.push(<div key={`empty-${i}`} className="p-2 border border-slate-200 h-28 sm:h-32 bg-slate-50"></div>);
    }

    for (let day = 1; day <= daysInMonth; day++) {
      const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      const dayEvents = events.filter(event => event.date === dateStr);
      
      days.push(
        <div key={day} className="p-2 border border-slate-200 h-28 sm:h-32 overflow-y-auto relative group bg-white hover:bg-slate-50 transition-colors duration-150">
          <div className="font-semibold text-sm mb-1 text-slate-700">{day}</div>
          <div className="space-y-1">
            {dayEvents.map(event => (
              <div
                key={event.id}
                className="text-xs p-1.5 rounded text-white truncate cursor-pointer hover:opacity-80 transition-opacity"
                style={{ backgroundColor: event.color }}
                title={`${event.title}${event.description ? ` - ${event.description}` : ''}`}
                onClick={() => { setEventToEdit(event); setIsModalOpen(true); }}
              >
                {event.title}
              </div>
            ))}
          </div>
        </div>
      );
    }
    return days;
  }, [currentDate, events]);

  const handlePrevMonth = () => {
    setCurrentDate(prev => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(prev => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
  };

  const handleSaveEvent = (event: CalendarEvent) => {
    if (eventToEdit) { 
       setEvents(prev => prev.map(e => e.id === event.id ? event : e));
    } else { 
       setEvents(prev => [...prev, event]);
    }
    setIsModalOpen(false);
    setEventToEdit(undefined);
  };

  const handleDeleteEvent = (eventId: string) => {
    setEvents(prev => prev.filter(e => e.id !== eventId));
    // Activity log for deletion is handled within EventModal to have access to event title
  };
  
  useEffect(() => {
    const storedEvents = localStorage.getItem('calendarEvents');
    if (storedEvents) {
      setEvents(JSON.parse(storedEvents));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('calendarEvents', JSON.stringify(events));
  }, [events]);


  return (
    <div>
      <div className="flex flex-wrap justify-between items-center mb-6 gap-4">
        <h2 className="text-2xl font-semibold text-slate-800">Calendário Interativo</h2>
        <Button onClick={() => { setEventToEdit(undefined); setIsModalOpen(true); }} variant="primary">
          <i className="fas fa-plus mr-2"></i>Adicionar Evento
        </Button>
      </div>

      <div className="bg-white p-4 sm:p-6 rounded-lg shadow-xl border border-slate-200">
        <div className="flex justify-between items-center mb-4">
          <Button onClick={handlePrevMonth} variant="light" size="sm" className="!px-3 !py-1.5">
            <i className="fas fa-chevron-left mr-1 sm:mr-2"></i>
            <span className="hidden sm:inline">Anterior</span>
          </Button>
          <h3 className="text-lg sm:text-xl font-semibold text-slate-700 text-center capitalize">
            {currentDate.toLocaleString('pt-BR', { month: 'long', year: 'numeric' })}
          </h3>
          <Button onClick={handleNextMonth} variant="light" size="sm" className="!px-3 !py-1.5">
            <span className="hidden sm:inline">Próximo</span>
            <i className="fas fa-chevron-right ml-1 sm:ml-2"></i>
          </Button>
        </div>
        <div className="grid grid-cols-7 gap-px bg-slate-200 border border-slate-200 rounded-t-md overflow-hidden">
          {daysOfWeek.map(day => (
            <div key={day} className="p-2 text-center font-medium text-xs sm:text-sm bg-slate-100 text-slate-600">{day}</div>
          ))}
        </div>
        <div className="grid grid-cols-7 gap-px bg-slate-200 border-x border-b border-slate-200 rounded-b-md overflow-hidden">
          {renderCalendar()}
        </div>
      </div>
      
      <EventModal
        isOpen={isModalOpen}
        onClose={() => { setIsModalOpen(false); setEventToEdit(undefined); }}
        onSave={handleSaveEvent}
        onDelete={handleDeleteEvent} // Pass the delete handler
        eventData={eventToEdit}
      />
    </div>
  );
};

export default CalendarView;
