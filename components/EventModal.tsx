
import React, { useState, useEffect, useCallback } from 'react';
import { CalendarEvent } from '../types';
import Input from './ui/Input';
import Textarea from './ui/Textarea';
import Button from './ui/Button';
import Modal from './ui/Modal';

interface EventModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (event: CalendarEvent) => void;
  eventData?: CalendarEvent; // Make eventData optional for new events
}

const colorOptions = [
  { name: 'Azul', value: '#3498db' },
  { name: 'Vermelho', value: '#e74c3c' },
  { name: 'Verde', value: '#2ecc71' },
  { name: 'Laranja', value: '#f39c12' },
  { name: 'Roxo', value: '#9b59b6' },
  { name: 'Cinza', value: '#7f8c8d'},
];

const EventModal: React.FC<EventModalProps> = ({ isOpen, onClose, onSave, eventData }) => {
  const [id, setId] = useState<string>('');
  const [title, setTitle] = useState('');
  const [date, setDate] = useState('');
  const [description, setDescription] = useState('');
  const [color, setColor] = useState(colorOptions[0].value);

  useEffect(() => {
    if (isOpen) { // Only update form when modal becomes visible or eventData changes
      if (eventData) {
        setId(eventData.id);
        setTitle(eventData.title);
        setDate(eventData.date);
        setDescription(eventData.description);
        setColor(eventData.color);
      } else {
        // New event defaults
        setId(Date.now().toString());
        setTitle('');
        setDate(new Date().toISOString().split('T')[0]); // Today's date in YYYY-MM-DD
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
    onSave({ id, title, date, description, color });
  }, [id, title, date, description, color, onSave]);

  const modalFooter = (
    <>
      <Button variant="light" onClick={onClose}>Cancelar</Button>
      <Button onClick={handleSubmit}>
        <i className={`fas ${eventData ? 'fa-save' : 'fa-plus'} mr-2`}></i>
        {eventData ? 'Salvar Alterações' : 'Adicionar Evento'}
      </Button>
    </>
  );

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={eventData ? 'Editar Evento' : 'Adicionar Novo Evento'} footer={modalFooter}>
      <Input
        label="Título do Evento:"
        id="event-title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        autoFocus
      />
      <Input
        label="Data:"
        id="event-date"
        type="date"
        value={date}
        onChange={(e) => setDate(e.target.value)}
      />
      <Textarea
        label="Descrição (Opcional):"
        id="event-description"
        rows={3}
        value={description}
        onChange={(e) => setDescription(e.target.value)}
      />
      <div className="mb-4">
        <label className="block text-sm font-medium text-slate-700 mb-2">Cor do Evento:</label>
        <div className="flex flex-wrap gap-2">
          {colorOptions.map(opt => (
            <button
              key={opt.value}
              type="button"
              className={`w-8 h-8 rounded-full border-2 focus:outline-none transition-all duration-150
                ${color === opt.value ? 'ring-2 ring-offset-2 ring-sky-500 border-sky-500' : 'border-transparent hover:border-slate-400'}`}
              style={{ backgroundColor: opt.value }}
              onClick={() => setColor(opt.value)}
              aria-label={`Selecionar cor ${opt.name}`}
            />
          ))}
        </div>
      </div>
    </Modal>
  );
};

export default EventModal;