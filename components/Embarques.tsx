import React, { useState, useCallback, useEffect, useMemo, useContext } from 'react';
import { EmbarqueEntry, LoteData, BarracaoData } from '../types';
import { getEmbarques, addEmbarque, getLotes, getBarracoes } from '../utils/dataManager';
import Input from './ui/Input';
import Button from './ui/Button';
import Select from './ui/Select';
import { addActivity } from '../utils/activityLog';
import { AppContext } from '../App';

const Embarques: React.FC = () => {
  const appContext = useContext(AppContext);
  const currentUser = appContext?.currentUser;
  
  const [embarques, setEmbarques] = useState<EmbarqueEntry[]>([]);
  const [lotes, setLotes] = useState<LoteData[]>([]);
  const [barracoes, setBarracoes] = useState<BarracaoData[]>([]);

  const [selectedLoteId, setSelectedLoteId] = useState<string>('');
  const [quantidadeAnimais, setQuantidadeAnimais] = useState<number | ''>('');
  const [quantidadeCaminhoes, setQuantidadeCaminhoes] = useState<number | ''>(1);
  const [data, setData] = useState<string>(new Date().toISOString().split('T')[0]);

  const refreshData = useCallback(() => {
    setEmbarques(getEmbarques());
    setLotes(getLotes());
    setBarracoes(getBarracoes());
  }, []);

  useEffect(() => {
    refreshData();
  }, [refreshData]);

  const handleRegistrarEmbarque = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedLoteId || !quantidadeAnimais || quantidadeAnimais <= 0 || !quantidadeCaminhoes || quantidadeCaminhoes <=0) {
      alert('Selecione um lote e informe as quantidades válidas.');
      return;
    }
    const lote = lotes.find(l => l.id === selectedLoteId);
    if (!lote) {
      alert('Lote não encontrado.');
      return;
    }
    if (quantidadeAnimais > lote.quantidadeAtual) {
      alert(`A quantidade de animais embarcados (${quantidadeAnimais}) não pode ser maior que a quantidade atual no lote (${lote.quantidadeAtual}).`);
      return;
    }

    addEmbarque({ loteId: selectedLoteId, quantidadeAnimais, quantidadeCaminhoes, data });
    addActivity(`${quantidadeAnimais} animais do lote "${lote.nome}" embarcados.`, 'embarque', undefined, currentUser);

    // Reset form and refresh data
    setSelectedLoteId('');
    setQuantidadeAnimais('');
    setQuantidadeCaminhoes(1);
    setData(new Date().toISOString().split('T')[0]);
    refreshData();
  }, [selectedLoteId, quantidadeAnimais, quantidadeCaminhoes, data, lotes, refreshData, currentUser]);
  
  const loteOptions = useMemo(() => {
    if (lotes.length === 0) return [{ value: '', label: 'Nenhum lote cadastrado' }];
    return lotes.map(lote => {
      const barracao = barracoes.find(b => b.id === lote.barracaoId);
      return {
        value: lote.id,
        label: `${lote.nome} (${barracao?.nome || 'Sem Barracão'}) - ${lote.quantidadeAtual} animais`,
      };
    });
  }, [lotes, barracoes]);

  const getLoteInfo = (loteId: string) => {
      const lote = lotes.find(l => l.id === loteId);
      if (!lote) return 'Lote não encontrado';
      const barracao = barracoes.find(b => b.id === lote.barracaoId);
      return `${lote.nome} (${barracao?.nome || 'Sem Barracão'})`;
  }

  return (
    <div>
      <h2 className="text-2xl font-semibold text-slate-800 mb-6">Registro de Embarques</h2>

      <div className="bg-white p-6 rounded-lg shadow-lg border border-slate-200 mb-8">
        <h3 className="text-lg font-semibold text-slate-700 mb-4">Registrar Novo Embarque</h3>
        <form onSubmit={handleRegistrarEmbarque} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 items-end">
          <Select
            label="Lote de Origem"
            id="lote-embarque"
            options={loteOptions}
            value={selectedLoteId}
            onChange={(e) => setSelectedLoteId(e.target.value)}
          />
          <Input
            label="Animais Embarcados"
            id="quantidade-animais"
            type="number"
            min="1"
            value={quantidadeAnimais}
            onChange={(e) => setQuantidadeAnimais(parseInt(e.target.value) || '')}
            required
          />
          <Input
            label="Caminhões"
            id="quantidade-caminhoes"
            type="number"
            min="1"
            value={quantidadeCaminhoes}
            onChange={(e) => setQuantidadeCaminhoes(parseInt(e.target.value) || '')}
            required
          />
          <Input
            label="Data do Embarque"
            id="data-embarque"
            type="date"
            value={data}
            onChange={(e) => setData(e.target.value)}
            required
          />
          <div className="lg:col-start-4">
            <Button type="submit" className="w-full">
                <i className="fas fa-save mr-2"></i>Registrar
            </Button>
          </div>
        </form>
      </div>

      <div>
        <h3 className="text-lg font-semibold text-slate-700 mb-4">Histórico de Embarques</h3>
        {embarques.length > 0 ? (
          <div className="overflow-x-auto bg-white rounded-lg shadow-md">
            <table className="min-w-full divide-y divide-slate-200">
              <thead className="bg-slate-100">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Data</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Lote (Barracão)</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Animais</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Caminhões</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-slate-200">
                {embarques.map((entry, index) => (
                  <tr key={entry.id} className={index % 2 === 0 ? 'bg-white' : 'bg-slate-50 hover:bg-slate-100'}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-700">{new Date(entry.data).toLocaleDateString('pt-BR', {timeZone: 'UTC'})}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900">{getLoteInfo(entry.loteId)}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600 font-semibold">{entry.quantidadeAnimais}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">{entry.quantidadeCaminhoes}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-12 bg-white rounded-lg shadow-md">
            <i className="fas fa-history fa-4x text-slate-300 mb-4"></i>
            <p className="text-slate-600 font-semibold text-lg">Nenhum embarque registrado.</p>
            <p className="text-sm text-slate-500 mt-1">Use o formulário acima para adicionar o primeiro registro.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Embarques;
