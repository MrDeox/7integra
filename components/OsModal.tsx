
import React, { useState, useEffect, useCallback } from 'react';
import { OrdemServico, OsPrioridade, OsStatus } from '../types';
import Input from './ui/Input';
import Textarea from './ui/Textarea';
import Select from './ui/Select';
import Button from './ui/Button';
import Modal from './ui/Modal';

interface OsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (os: OrdemServico) => void;
  osData?: OrdemServico;
  onDelete?: () => void;
}

const prioridadeOptions: { value: OsPrioridade; label: string }[] = [
  { value: 'Baixa', label: 'Baixa' },
  { value: 'Média', label: 'Média' },
  { value: 'Alta', label: 'Alta' },
  { value: 'Urgente', label: 'Urgente' },
];

const statusOptions: { value: OsStatus; label: string }[] = [
  { value: 'Aberto', label: 'Aberto' },
  { value: 'Em andamento', label: 'Em andamento' },
  { value: 'Concluído', label: 'Concluído' },
];

const OsModal: React.FC<OsModalProps> = ({ isOpen, onClose, onSave, osData, onDelete }) => {
  const [id, setId] = useState<string>('');
  const [titulo, setTitulo] = useState('');
  const [descricao, setDescricao] = useState('');
  const [prioridade, setPrioridade] = useState<OsPrioridade>('Média');
  const [status, setStatus] = useState<OsStatus>('Aberto');

  useEffect(() => {
    if (osData) {
      setId(osData.id);
      setTitulo(osData.titulo);
      setDescricao(osData.descricao);
      setPrioridade(osData.prioridade);
      setStatus(osData.status);
    } else {
      // New OS defaults
      setId(Date.now().toString()); // Temporary ID, could be overwritten on save if backend generates one
      setTitulo('');
      setDescricao('');
      setPrioridade('Média');
      setStatus('Aberto');
    }
  }, [osData, isOpen]);

  const handleSubmit = useCallback(() => {
    if (!titulo || !descricao) {
      alert('Preencha pelo menos o título e a descrição da OS.');
      return;
    }
    onSave({ id, titulo, descricao, prioridade, status });
  }, [id, titulo, descricao, prioridade, status, onSave]);

  const modalFooter = (
    <div className="flex justify-between w-full">
      <div>
        {osData && onDelete && (
          <Button variant="danger" onClick={onDelete}>Excluir OS</Button>
        )}
      </div>
      <div className="space-x-3">
        <Button variant="light" onClick={onClose}>Cancelar</Button>
        <Button onClick={handleSubmit}>Salvar OS</Button>
      </div>
    </div>
  );

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={osData ? 'Editar Ordem de Serviço' : 'Nova Ordem de Serviço'} footer={modalFooter}>
      <Input
        label="Título:"
        id="os-titulo"
        value={titulo}
        onChange={(e) => setTitulo(e.target.value)}
      />
      <Textarea
        label="Descrição:"
        id="os-descricao"
        rows={4}
        value={descricao}
        onChange={(e) => setDescricao(e.target.value)}
      />
      <Select
        label="Prioridade:"
        id="os-prioridade"
        options={prioridadeOptions}
        value={prioridade}
        onChange={(e) => setPrioridade(e.target.value as OsPrioridade)}
      />
      <Select
        label="Status:"
        id="os-status"
        options={statusOptions}
        value={status}
        onChange={(e) => setStatus(e.target.value as OsStatus)}
      />
    </Modal>
  );
};

export default OsModal;
