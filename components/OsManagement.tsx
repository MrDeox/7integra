
import React, { useState, useCallback, useEffect, useContext } from 'react';
import { OrdemServico, OsPrioridade, OsStatus, AuthenticatedUser } from '../types';
import Button from './ui/Button';
import OsModal from './OsModal';
import { addActivity } from '../utils/activityLog';
import { AppContext } from '../App'; // Assuming AppContext provides currentUser

const OsManagement: React.FC = () => {
  const appContext = useContext(AppContext);
  const currentUser = appContext?.currentUser;

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
        addActivity(`OS "${os.titulo}" atualizada.`, 'os', 'fas fa-edit', currentUser);
        return prevList.map(item => (item.id === os.id ? os : item));
      } else {
        const newOs = { ...os, id: Date.now().toString() };
        addActivity(`Nova OS "${newOs.titulo}" criada.`, 'os', 'fas fa-plus-circle', currentUser);
        return [...prevList, newOs];
      }
    });
    handleCloseModal();
  };

  const handleDeleteOs = (id: string) => {
    const osToDelete = osList.find(item => item.id === id);
    if (window.confirm('Tem certeza que deseja excluir esta OS?')) {
      setOsList(prevList => prevList.filter(item => item.id !== id));
      if (osToDelete) {
        addActivity(`OS "${osToDelete.titulo}" excluída.`, 'os', 'fas fa-trash-alt', currentUser);
      }
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
        <div className="overflow-x-auto bg-white rounded-lg shadow-md">
          <table className="min-w-full divide-y divide-slate-200">
            <thead className="bg-slate-100">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Título</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Prioridade</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Status</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Ações</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-slate-200">
              {osList.map((os, index) => (
                <tr key={os.id} className={index % 2 === 0 ? 'bg-white' : 'bg-slate-50 hover:bg-slate-100'}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900">{os.titulo}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">{os.prioridade}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">
                    <span className={`px-2.5 py-0.5 inline-flex text-xs leading-5 font-semibold rounded-full 
                      ${os.status === 'Concluído' ? 'bg-green-100 text-green-800' : 
                       os.status === 'Em andamento' ? 'bg-yellow-100 text-yellow-800' : 
                       'bg-sky-100 text-sky-800'}`}>
                      {os.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                    <Button variant="light" size="sm" onClick={() => handleOpenModal(os)} className="!px-3 !py-1">
                      <i className="fas fa-edit mr-1"></i>Editar
                    </Button>
                    <Button variant="danger" size="sm" onClick={() => handleDeleteOs(os.id)} className="!px-3 !py-1">
                      <i className="fas fa-trash-alt mr-1"></i>Excluir
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="text-center py-12 bg-white rounded-lg shadow-md">
            <i className="fas fa-folder-open fa-4x text-slate-300 mb-4"></i>
            <p className="text-slate-600 font-semibold text-lg">Nenhuma ordem de serviço cadastrada.</p>
            <p className="text-sm text-slate-500 mt-1">Crie uma nova OS para começar o gerenciamento.</p>
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
