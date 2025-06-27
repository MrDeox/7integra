import React, { useState, useCallback, useEffect, useMemo, useContext } from 'react';
import { MortalidadeEntry, LoteData, BarracaoData } from '../types';
import { getMortalidades, addMortalidade, getLotes, getBarracoes } from '../utils/dataManager';
import Input from './ui/Input';
import Button from './ui/Button';
import Textarea from './ui/Textarea';
import Select from './ui/Select';
import { addActivity } from '../utils/activityLog';
import { AppContext } from '../App';

const MortalidadeLog: React.FC = () => {
  const appContext = useContext(AppContext);
  const currentUser = appContext?.currentUser;
  
  const [mortalidades, setMortalidades] = useState<MortalidadeEntry[]>([]);
  const [lotes, setLotes] = useState<LoteData[]>([]);
  const [barracoes, setBarracoes] = useState<BarracaoData[]>([]);

  const [selectedLoteId, setSelectedLoteId] = useState<string>('');
  const [quantidade, setQuantidade] = useState<number | ''>('');
  const [data, setData] = useState<string>(new Date().toISOString().split('T')[0]);
  const [causa, setCausa] = useState('');

  const refreshData = useCallback(() => {
    setMortalidades(getMortalidades());
    setLotes(getLotes());
    setBarracoes(getBarracoes());
  }, []);

  useEffect(() => {
    refreshData();
  }, [refreshData]);

  const handleRegistrarMortalidade = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedLoteId || !quantidade || quantidade <= 0) {
      alert('Selecione um lote e informe uma quantidade válida.');
      return;
    }
    const lote = lotes.find(l => l.id === selectedLoteId);
    if (!lote) {
      alert('Lote não encontrado.');
      return;
    }
    if (quantidade > lote.quantidadeAtual) {
      alert(`A quantidade de baixas (${quantidade}) não pode ser maior que a quantidade de animais no lote (${lote.quantidadeAtual}).`);
      return;
    }

    addMortalidade({ loteId: selectedLoteId, quantidade, data, causa });
    addActivity(`${quantidade} baixa(s) registrada(s) para o lote "${lote.nome}".`, 'mortalidade', undefined, currentUser);

    // Reset form and refresh data
    setSelectedLoteId('');
    setQuantidade('');
    setData(new Date().toISOString().split('T')[0]);
    setCausa('');
    refreshData();
  }, [selectedLoteId, quantidade, data, causa, lotes, refreshData, currentUser]);
  
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
      <h2 className="text-2xl font-semibold text-slate-800 mb-6">Registro de Mortalidade</h2>

      <div className="bg-white p-6 rounded-lg shadow-lg border border-slate-200 mb-8">
        <h3 className="text-lg font-semibold text-slate-700 mb-4">Registrar Nova Baixa</h3>
        <form onSubmit={handleRegistrarMortalidade} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 items-end">
          <Select
            label="Lote"
            id="lote-mortalidade"
            options={loteOptions}
            value={selectedLoteId}
            onChange={(e) => setSelectedLoteId(e.target.value)}
            className="lg:col-span-2"
          />
          <Input
            label="Quantidade"
            id="quantidade-mortalidade"
            type="number"
            min="1"
            value={quantidade}
            onChange={(e) => setQuantidade(parseInt(e.target.value) || '')}
            required
          />
          <Input
            label="Data"
            id="data-mortalidade"
            type="date"
            value={data}
            onChange={(e) => setData(e.target.value)}
            required
          />
          <Textarea
            label="Causa da Morte (Opcional)"
            id="causa-mortalidade"
            rows={2}
            value={causa}
            onChange={(e) => setCausa(e.target.value)}
            className="md:col-span-2 lg:col-span-3"
          />
          <Button type="submit" className="w-full">
            <i className="fas fa-save mr-2"></i>Registrar
          </Button>
        </form>
      </div>

      <div>
        <h3 className="text-lg font-semibold text-slate-700 mb-4">Histórico de Mortalidade</h3>
        {mortalidades.length > 0 ? (
          <div className="overflow-x-auto bg-white rounded-lg shadow-md">
            <table className="min-w-full divide-y divide-slate-200">
              <thead className="bg-slate-100">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Data</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Lote (Barracão)</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Quantidade</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Causa</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-slate-200">
                {mortalidades.map((entry, index) => (
                  <tr key={entry.id} className={index % 2 === 0 ? 'bg-white' : 'bg-slate-50 hover:bg-slate-100'}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-700">{new Date(entry.data).toLocaleDateString('pt-BR', {timeZone: 'UTC'})}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900">{getLoteInfo(entry.loteId)}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-red-600 font-semibold">{entry.quantidade}</td>
                    <td className="px-6 py-4 text-sm text-slate-600">{entry.causa || '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-12 bg-white rounded-lg shadow-md">
            <i className="fas fa-history fa-4x text-slate-300 mb-4"></i>
            <p className="text-slate-600 font-semibold text-lg">Nenhum registro de mortalidade encontrado.</p>
            <p className="text-sm text-slate-500 mt-1">Use o formulário acima para adicionar o primeiro registro.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default MortalidadeLog;
