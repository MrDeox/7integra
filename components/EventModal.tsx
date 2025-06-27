
import React, { useState, useEffect, useCallback, useContext } from 'react';
import { CalendarEvent, AuthenticatedUser } from '../types';
import Input from './ui/Input';
import Textarea from './ui/Textarea';
import Button from './ui/Button';
import Modal from './ui/Modal';
import { addActivity } from '../utils/activityLog';
import { AppContext } from '../App'; // Assuming AppContext provides currentUser


interface EventModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (event: CalendarEvent) => void;
  onDelete?: (eventId: string) => void; // Optional: For deleting events
  eventData?: CalendarEvent; 
}

const colorOptions = [
  { name: 'Azul', value: '#3498db' },
  { name: 'Vermelho', value: '#e74c3c' },
  { name: 'Verde', value: '#2ecc71' },
  { name: 'Laranja', value: '#f39c12' },
  { name: 'Roxo', value: '#9b59b6' },
  { name: 'Cinza', value: '#7f8c8d'},
  { name: 'Turquesa', value: '#1abc9c' },
  { name: 'Amarelo', value: '#f1c40f' },
];

const EventModal: React.FC<EventModalProps> = ({ isOpen, onClose, onSave, onDelete, eventData }) => {
  const appContext = useContext(AppContext);
  const currentUser = appContext?.currentUser;

  const [id, setId] = useState<string>('');
  const [title, setTitle] = useState('');
  const [date, setDate] = useState('');
  const [description, setDescription] = useState('');
  const [color, setColor] = useState(colorOptions[0].value);

  useEffect(() => {
    if (isOpen) { 
      if (eventData) {
        setId(eventData.id);
        setTitle(eventData.title);
        setDate(eventData.date);
        setDescription(eventData.description);
        setColor(eventData.color);
      } else {
        setId(Date.now().toString());
        setTitle('');
        setDate(new Date().toISOString().split('T')[0]); 
        setDescription('');
        setColor(colorOptions[0].value);
      }
    }
  }, [eventData, isOpen]);

  const handleSubmit = useCallback(() => {
    if (!title.trim() || !date) {
      alert('Preencha pelo menos o título e a data do evento.');
      return;
    }
    const eventToSave = { id, title, date, description, color };
    onSave(eventToSave);
    if (eventData) {
      addActivity(`Evento "${title}" atualizado.`, 'event', 'fas fa-calendar-check', currentUser);
    } else {
      addActivity(`Novo evento "${title}" adicionado ao calendário.`, 'event', 'fas fa-calendar-plus', currentUser);
    }
  }, [id, title, date, description, color, onSave, eventData, currentUser]);

  const handleDelete = useCallback(() => {
    if (eventData && onDelete) {
      if (window.confirm(`Tem certeza que deseja excluir o evento "${eventData.title}"?`)) {
        onDelete(eventData.id);
        addActivity(`Evento "${eventData.title}" excluído.`, 'event', 'fas fa-calendar-times', currentUser);
        onClose(); // Close modal after deletion
      }
    }
  }, [eventData, onDelete, onClose, currentUser]);


  const modalFooter = (
    <div className="flex justify-between w-full items-center">
      <div>
        {eventData && onDelete && (
          <Button variant="danger" onClick={handleDelete} size="sm">
            <i className="fas fa-trash-alt mr-2"></i>Excluir
          </Button>
        )}
      </div>
      <div className="space-x-3">
        <Button variant="light" onClick={onClose}>Cancelar</Button>
        <Button onClick={handleSubmit}>
          <i className={`fas ${eventData ? 'fa-save' : 'fa-plus'} mr-2`}></i>
          {eventData ? 'Salvar Alterações' : 'Adicionar Evento'}
        </Button>
      </div>
    </div>
  );

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={eventData ? 'Editar Evento' : 'Adicionar Novo Evento'} footer={modalFooter}>
      <Input
        label="Título do Evento:"
        id="event-title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        autoFocus
        className="mb-4"
      />
      <Input
        label="Data:"
        id="event-date"
        type="date"
        value={date}
        onChange={(e) => setDate(e.target.value)}
        className="mb-4"
      />
      <Textarea
        label="Descrição (Opcional):"
        id="event-description"
        rows={3}
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        className="mb-4"
      />
      <div className="mb-2"> {/* Reduced bottom margin */}
        <label className="block text-sm font-medium text-slate-700 mb-2">Cor do Evento:</label>
        <div className="flex flex-wrap gap-2">
          {colorOptions.map(opt => (
            <button
              key={opt.value}
              type="button"
              className={`w-8 h-8 rounded-full border-2 focus:outline-none transition-all duration-150
                ${color === opt.value ? 'ring-2 ring-offset-2 ring-sky-500 border-sky-600' : 'border-transparent hover:border-slate-400'}`}
              style={{ backgroundColor: opt.value }}
              onClick={() => setColor(opt.value)}
              aria-label={`Selecionar cor ${opt.name}`}
              title={opt.name}
            />
          ))}
        </div>
      </div>
    </Modal>
  );
};

export default EventModal;
