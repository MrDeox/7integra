
import React, { useState, useCallback, useEffect } from 'react';
import { OrdemServico, OsPrioridade, OsStatus } from '../types';
import Button from './ui/Button';
import OsModal from './OsModal';

const OsManagement: React.FC = () => {
  const [osList, setOsList] = useState<OrdemServico[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingOs, setEditingOs] = useState<OrdemServico | undefined>(undefined);

  const handleOpenModal = (os?: OrdemServico) => {
    setEditingOs(os);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingOs(undefined);
  };

  const handleSaveOs = (os: OrdemServico) => {
    setOsList(prevList => {
      if (editingOs) {
        return prevList.map(item => (item.id === os.id ? os : item));
      } else {
        return [...prevList, { ...os, id: Date.now().toString() }];
      }
    });
    handleCloseModal();
  };

  const handleDeleteOs = (id: string) => {
    if (window.confirm('Tem certeza que deseja excluir esta OS?')) {
      setOsList(prevList => prevList.filter(item => item.id !== id));
      if(editingOs?.id === id) handleCloseModal();
    }
  };
  
  useEffect(() => {
    const storedOsList = localStorage.getItem('osList');
    if (storedOsList) {
      setOsList(JSON.parse(storedOsList));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('osList', JSON.stringify(osList));
  }, [osList]);

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-semibold text-slate-800">Ordens de Serviço (OS)</h2>
        <Button onClick={() => handleOpenModal()}>
          <i className="fas fa-plus mr-2"></i>Nova OS
        </Button>
      </div>

      {osList.length > 0 ? (
        <div className="overflow-x-auto bg-white rounded-lg shadow">
          <table className="min-w-full divide-y divide-slate-200">
            <thead className="bg-slate-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Título</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Prioridade</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Status</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Ações</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-slate-200">
              {osList.map(os => (
                <tr key={os.id} className="hover:bg-slate-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900">{os.titulo}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">{os.prioridade}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                      ${os.status === 'Concluído' ? 'bg-green-100 text-green-800' : 
                       os.status === 'Em andamento' ? 'bg-yellow-100 text-yellow-800' : 
                       'bg-blue-100 text-blue-800'}`}>
                      {os.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                    <Button variant="light" size="sm" onClick={() => handleOpenModal(os)}>
                      <i className="fas fa-edit mr-1"></i>Editar
                    </Button>
                    <Button variant="danger" size="sm" onClick={() => handleDeleteOs(os.id)}>
                      <i className="fas fa-trash-alt mr-1"></i>Excluir
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="text-center py-10 bg-white rounded-lg shadow">
            <i className="fas fa-folder-open fa-3x text-slate-400 mb-4"></i>
            <p className="text-slate-600 font-semibold">Nenhuma ordem de serviço cadastrada.</p>
            <p className="text-sm text-slate-500">Crie uma nova OS para começar.</p>
        </div>
      )}
      
      <OsModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSave={handleSaveOs}
        osData={editingOs}
        onDelete={editingOs ? () => handleDeleteOs(editingOs.id) : undefined}
      />
    </div>
  );
};

export default OsManagement;