import React, { useState, useCallback, useEffect, useMemo, useContext } from 'react';
import { BarracaoData, LoteData } from '../types';
import { getBarracoes, saveBarracoes, getLotes, saveLotes } from '../utils/dataManager';
import Input from './ui/Input';
import Button from './ui/Button';
import Modal from './ui/Modal';
import { addActivity } from '../utils/activityLog';
import { AppContext } from '../App';

const BarracoesManagement: React.FC = () => {
    const appContext = useContext(AppContext);
    const currentUser = appContext?.currentUser;

    const [barracoes, setBarracoes] = useState<BarracaoData[]>([]);
    const [lotes, setLotes] = useState<LoteData[]>([]);
    
    const [isBarracaoModalOpen, setIsBarracaoModalOpen] = useState(false);
    const [editingBarracao, setEditingBarracao] = useState<BarracaoData | null>(null);
    const [barracaoNome, setBarracaoNome] = useState('');

    const [isLoteModalOpen, setIsLoteModalOpen] = useState(false);
    const [editingLote, setEditingLote] = useState<LoteData | null>(null);
    const [loteForm, setLoteForm] = useState<Partial<LoteData>>({});

    useEffect(() => {
        setBarracoes(getBarracoes());
        setLotes(getLotes());
    }, []);

    const handleSaveBarracao = () => {
        if (!barracaoNome.trim()) {
            alert('O nome do barracão não pode ser vazio.');
            return;
        }
        let updatedBarracoes;
        if (editingBarracao) {
            updatedBarracoes = barracoes.map(b => b.id === editingBarracao.id ? { ...b, nome: barracaoNome } : b);
            addActivity(`Nome do barracão "${editingBarracao.nome}" atualizado para "${barracaoNome}".`, 'barracao', undefined, currentUser);
        } else {
            const newBarracao = { id: Date.now().toString(), nome: barracaoNome };
            updatedBarracoes = [...barracoes, newBarracao];
            addActivity(`Novo barracão "${barracaoNome}" adicionado.`, 'barracao', undefined, currentUser);
        }
        setBarracoes(updatedBarracoes);
        saveBarracoes(updatedBarracoes);
        closeBarracaoModal();
    };
    
    const handleDeleteBarracao = (id: string) => {
        if (lotes.some(lote => lote.barracaoId === id)) {
            alert('Não é possível excluir um barracão que contém lotes. Remova os lotes primeiro.');
            return;
        }
        if (window.confirm('Tem certeza que deseja excluir este barracão?')) {
            const barracaoToDelete = barracoes.find(b => b.id === id);
            const updatedBarracoes = barracoes.filter(b => b.id !== id);
            setBarracoes(updatedBarracoes);
            saveBarracoes(updatedBarracoes);
            if (barracaoToDelete) {
                addActivity(`Barracão "${barracaoToDelete.nome}" excluído.`, 'barracao', 'fas fa-trash-alt', currentUser);
            }
        }
    };

    const openBarracaoModal = (barracao: BarracaoData | null = null) => {
        setEditingBarracao(barracao);
        setBarracaoNome(barracao ? barracao.nome : '');
        setIsBarracaoModalOpen(true);
    };

    const closeBarracaoModal = () => {
        setIsBarracaoModalOpen(false);
        setEditingBarracao(null);
        setBarracaoNome('');
    };

    // --- Lote Logic ---
    const handleSaveLote = () => {
        const { barracaoId, nome, dataEntrada, idadeInicial, pesoInicial, quantidadeInicial } = loteForm;
        if (!barracaoId || !nome?.trim() || !dataEntrada || !idadeInicial || !pesoInicial || !quantidadeInicial) {
            alert('Todos os campos do lote são obrigatórios.');
            return;
        }

        let updatedLotes;
        if (editingLote) {
            updatedLotes = lotes.map(l => l.id === editingLote.id ? { ...editingLote, ...loteForm } as LoteData : l);
            addActivity(`Lote "${loteForm.nome}" atualizado.`, 'lote', undefined, currentUser);
        } else {
            const newLote: LoteData = {
                id: Date.now().toString(),
                barracaoId,
                nome,
                dataEntrada,
                idadeInicial,
                pesoInicial,
                quantidadeInicial,
                quantidadeAtual: quantidadeInicial,
            };
            updatedLotes = [...lotes, newLote];
            addActivity(`Novo lote "${nome}" adicionado ao barracão.`, 'lote', undefined, currentUser);
        }
        setLotes(updatedLotes);
        saveLotes(updatedLotes);
        closeLoteModal();
    };

    const handleDeleteLote = (id: string) => {
        if (window.confirm('Tem certeza que deseja excluir este lote? Esta ação não pode ser desfeita.')) {
            const loteToDelete = lotes.find(l => l.id === id);
            const updatedLotes = lotes.filter(l => l.id !== id);
            setLotes(updatedLotes);
            saveLotes(updatedLotes);
             if (loteToDelete) {
                addActivity(`Lote "${loteToDelete.nome}" excluído.`, 'lote', 'fas fa-trash-alt', currentUser);
            }
        }
    };

    const openLoteModal = (barracaoId: string, lote: LoteData | null = null) => {
        setEditingLote(lote);
        setLoteForm(lote ? { ...lote } : { barracaoId, dataEntrada: new Date().toISOString().split('T')[0] });
        setIsLoteModalOpen(true);
    };
    
    const closeLoteModal = () => {
        setIsLoteModalOpen(false);
        setEditingLote(null);
        setLoteForm({});
    };
    
    const handleLoteFormChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value, type } = e.target;
        setLoteForm(prev => ({
            ...prev,
            [name]: type === 'number' ? parseFloat(value) || 0 : value
        }));
    };

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-semibold text-slate-800">Gestão de Barracões e Lotes</h2>
                <Button onClick={() => openBarracaoModal()}>
                    <i className="fas fa-plus mr-2"></i>Novo Barracão
                </Button>
            </div>

            <div className="space-y-6">
                {barracoes.length > 0 ? barracoes.map(barracao => {
                    const lotesNoBarracao = lotes.filter(l => l.barracaoId === barracao.id);
                    const totalAnimais = lotesNoBarracao.reduce((sum, lote) => sum + lote.quantidadeAtual, 0);

                    return (
                        <div key={barracao.id} className="p-4 sm:p-6 border border-slate-200 rounded-lg shadow-sm bg-white">
                            <div className="flex justify-between items-start mb-4">
                                <div>
                                    <h3 className="text-xl font-bold text-sky-700">{barracao.nome}</h3>
                                    <p className="text-sm text-slate-500">{totalAnimais} animais em {lotesNoBarracao.length} lote(s)</p>
                                </div>
                                <div className="flex-shrink-0 flex items-center gap-2">
                                    <Button size="sm" variant="light" onClick={() => openBarracaoModal(barracao)}><i className="fas fa-edit"></i></Button>
                                    <Button size="sm" variant="danger" onClick={() => handleDeleteBarracao(barracao.id)}><i className="fas fa-trash-alt"></i></Button>
                                </div>
                            </div>

                            <div className="mb-4">
                                <Button onClick={() => openLoteModal(barracao.id)} variant="success" size="sm">
                                    <i className="fas fa-plus-circle mr-2"></i> Adicionar Lote
                                </Button>
                            </div>

                            {lotesNoBarracao.length > 0 && (
                                <div className="overflow-x-auto">
                                    <table className="min-w-full text-sm">
                                        <thead className="text-left text-xs text-slate-500 uppercase bg-slate-50">
                                            <tr>
                                                <th className="p-2">Lote</th>
                                                <th className="p-2">Qtd. Atual</th>
                                                <th className="p-2">Idade Inicial</th>
                                                <th className="p-2">Data Entrada</th>
                                                <th className="p-2">Ações</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {lotesNoBarracao.map(lote => (
                                                <tr key={lote.id} className="border-b border-slate-100">
                                                    <td className="p-2 font-medium">{lote.nome}</td>
                                                    <td className="p-2">{lote.quantidadeAtual} / {lote.quantidadeInicial}</td>
                                                    <td className="p-2">{lote.idadeInicial} dias</td>
                                                    <td className="p-2">{new Date(lote.dataEntrada).toLocaleDateString('pt-BR', {timeZone: 'UTC'})}</td>
                                                    <td className="p-2 flex gap-2">
                                                        <Button size="sm" variant="light" onClick={() => openLoteModal(barracao.id, lote)}><i className="fas fa-edit"></i></Button>
                                                        <Button size="sm" variant="danger" onClick={() => handleDeleteLote(lote.id)}><i className="fas fa-trash-alt"></i></Button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>
                    );
                }) : (
                     <div className="text-center py-12 bg-white rounded-lg shadow-md border border-slate-200">
                        <i className="fas fa-th-large fa-3x text-slate-400 mb-4"></i>
                        <p className="text-slate-600 font-semibold text-lg">Nenhum barracão cadastrado.</p>
                        <p className="text-sm text-slate-500 mt-1">Crie um novo barracão para começar a adicionar lotes de animais.</p>
                    </div>
                )}
            </div>

            {/* Barracão Modal */}
            <Modal isOpen={isBarracaoModalOpen} onClose={closeBarracaoModal} title={editingBarracao ? "Editar Barracão" : "Novo Barracão"}>
                <Input label="Nome do Barracão" id="barracao-nome" value={barracaoNome} onChange={e => setBarracaoNome(e.target.value)} />
                <div className="flex justify-end gap-2 mt-4">
                    <Button variant="light" onClick={closeBarracaoModal}>Cancelar</Button>
                    <Button onClick={handleSaveBarracao}>Salvar</Button>
                </div>
            </Modal>
            
            {/* Lote Modal */}
            <Modal isOpen={isLoteModalOpen} onClose={closeLoteModal} title={editingLote ? "Editar Lote" : "Adicionar Novo Lote"}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Input name="nome" label="Nome/ID do Lote" id="lote-nome" value={loteForm.nome || ''} onChange={handleLoteFormChange} placeholder="Ex: Lote 24-A" />
                    <Input name="dataEntrada" label="Data de Entrada" id="lote-data" type="date" value={loteForm.dataEntrada || ''} onChange={handleLoteFormChange} />
                    <Input name="idadeInicial" label="Idade Inicial (dias)" id="lote-idade" type="number" min="0" value={loteForm.idadeInicial || ''} onChange={handleLoteFormChange} />
                    <Input name="pesoInicial" label="Peso Inicial Médio (kg)" id="lote-peso" type="number" min="0" step="0.1" value={loteForm.pesoInicial || ''} onChange={handleLoteFormChange} />
                    <Input name="quantidadeInicial" label="Quantidade de Animais" id="lote-qtd" type="number" min="1" value={loteForm.quantidadeInicial || ''} onChange={handleLoteFormChange} disabled={!!editingLote} />
                </div>
                {editingLote && <p className="text-xs text-slate-500 mt-2">A quantidade inicial não pode ser alterada após a criação do lote.</p>}
                 <div className="flex justify-end gap-2 mt-6">
                    <Button variant="light" onClick={closeLoteModal}>Cancelar</Button>
                    <Button onClick={handleSaveLote}>Salvar Lote</Button>
                </div>
            </Modal>
        </div>
    );
};

export default BarracoesManagement;
