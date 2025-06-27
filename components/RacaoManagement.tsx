
import React, { useState, useCallback, ChangeEvent, useEffect, useMemo } from 'react';
import { SiloData, LoteData } from '../types';
import Input from './ui/Input';
import Button from './ui/Button';
import { getLotes } from '../utils/dataManager';
import { findConsumoReference } from '../utils/consumoData';

const RacaoManagement: React.FC = () => {
  const [silosQuantidade, setSilosQuantidade] = useState<number>(() => parseInt(localStorage.getItem('silosQuantidade') || '1', 10));
  const [silos, setSilos] = useState<SiloData[]>(() => {
    const storedSilos = localStorage.getItem('silosData');
    if (storedSilos) return JSON.parse(storedSilos);
    return Array.from({ length: parseInt(localStorage.getItem('silosQuantidade') || '1', 10) }, (_, i) => ({
      id: `silo-${i + 1}`, capacidade: 0, racaoAtual: 0,
    }));
  });
  const [resumo, setResumo] = useState<React.ReactNode | null>(() => {
    const storedSilosData = localStorage.getItem('silosData');
    const storedResumoVisible = localStorage.getItem('racaoResumoVisible') === 'true';
    if (storedSilosData && storedResumoVisible) {
        const tempSilos: SiloData[] = JSON.parse(storedSilosData);
        return buildResumoNode(tempSilos);
    }
    return null;
  });
  const [saveStatus, setSaveStatus] = useState<string | null>(null);

  // Persist state to localStorage
  useEffect(() => {
    localStorage.setItem('silosQuantidade', silosQuantidade.toString());
    localStorage.setItem('silosData', JSON.stringify(silos));
    localStorage.setItem('racaoResumoVisible', resumo !== null ? 'true' : 'false');
  }, [silosQuantidade, silos, resumo]);

  const stockEstimation = useMemo(() => {
    const lotes = getLotes();
    if (lotes.length === 0) {
      return { totalConsumoDiario: 0, duracaoEstimada: Infinity, totalAnimais: 0 };
    }

    const today = new Date();
    let totalConsumoDiario = 0;
    let totalAnimais = 0;

    lotes.forEach(lote => {
      const dataEntrada = new Date(lote.dataEntrada);
      const diffTime = today.getTime() - dataEntrada.getTime();
      const diffDays = Math.max(0, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));
      const idadeAtual = lote.idadeInicial + diffDays;
      
      const consumoRef = findConsumoReference(idadeAtual);
      if (consumoRef && lote.quantidadeAtual > 0) {
        totalConsumoDiario += lote.quantidadeAtual * consumoRef.consumoDiarioKg;
        totalAnimais += lote.quantidadeAtual;
      }
    });

    const totalRacaoEstoque = silos.reduce((acc, silo) => acc + silo.racaoAtual, 0);
    const duracaoEstimada = totalConsumoDiario > 0 ? totalRacaoEstoque / totalConsumoDiario : Infinity;

    return { totalConsumoDiario, duracaoEstimada, totalAnimais };
  }, [silos, silosQuantidade]); // Re-calculate when silos change

  const handleSilosQuantidadeChange = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    const qty = parseInt(e.target.value, 10) || 1;
    setSilosQuantidade(qty);
    setSilos(prevSilos => Array.from({ length: qty }, (_, i) => ({
      id: `silo-${i + 1}`,
      capacidade: prevSilos[i]?.capacidade || 0,
      racaoAtual: prevSilos[i]?.racaoAtual || 0,
    })));
    setResumo(null);
    setSaveStatus(null);
  }, []);

  const handleSiloInputChange = useCallback((index: number, field: keyof Omit<SiloData, 'id'>, value: string) => {
    const numericValue = parseFloat(value) || 0;
    setSilos(prevSilos => 
      prevSilos.map((silo, i) => 
        i === index ? { ...silo, [field]: numericValue } : silo
      )
    );
    setResumo(null);
    setSaveStatus(null);
  }, []);


  const buildResumoNode = (silosToSummarize: SiloData[]): React.ReactNode => {
    let totalRacao = 0;
    const summaryItems = silosToSummarize.map(silo => {
      totalRacao += silo.racaoAtual;
      const percentual = silo.capacidade > 0 ? (silo.racaoAtual / silo.capacidade) * 100 : 0;
      const displayPercentual = silo.capacidade > 0 ? percentual.toFixed(1) + '%' : 'N/A (defina capacidade)';

      return (
        <li key={silo.id} className="text-sm mb-3 p-3 bg-white rounded-md shadow-sm border border-slate-100">
          <div className="flex justify-between items-center mb-1">
            <span className="font-medium text-slate-700">Silo {silo.id.split('-')[1]}: {silo.racaoAtual.toFixed(2)}kg / {silo.capacidade.toFixed(2)}kg</span>
            <span className="text-xs font-semibold text-sky-600">{displayPercentual}</span>
          </div>
          <div className="w-full bg-slate-200 rounded-full h-2.5">
            <div 
              className="bg-sky-500 h-2.5 rounded-full transition-all duration-500 ease-out" 
              style={{ width: `${Math.min(percentual, 100)}%` }}
              title={`${displayPercentual} cheio`}
            ></div>
          </div>
        </li>
      );
    });
     return (
      <>
        <h3 className="text-lg font-semibold text-slate-700 mb-3">Resumo do Estoque nos Silos</h3>
        <ul className="space-y-1">{summaryItems}</ul>
        <p className="mt-3 pt-3 border-t border-slate-200 font-bold text-slate-700">Total em Estoque: {totalRacao.toFixed(2)}kg</p>
      </>
    );
  }

  const handleSalvarSilos = useCallback(() => {
    if (silos.some(s => s.capacidade <= 0 && s.racaoAtual > 0)) {
        alert("Atenção: Alguns silos com ração não têm capacidade definida. O percentual pode não ser calculado corretamente.");
    }
    setResumo(buildResumoNode(silos));
    setSaveStatus('Dados dos silos salvos com sucesso!');
    setTimeout(() => setSaveStatus(null), 3000);
  }, [silos]);

  return (
    <div>
      <h2 className="text-2xl font-semibold text-slate-800 mb-6">Gestão e Estimativa de Ração</h2>
      
      {/* Stock Estimation Card */}
      <div className="mb-8 p-6 bg-sky-50 border-2 border-sky-200 rounded-xl shadow-md">
        <h3 className="text-xl font-semibold text-sky-800 mb-4 flex items-center">
            <i className="fas fa-calculator mr-3 text-sky-500"></i>
            Estimativa de Duração do Estoque
        </h3>
        {stockEstimation.totalAnimais > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
                <div>
                    <p className="text-sm text-slate-500">Total de Animais</p>
                    <p className="text-2xl font-bold text-slate-700">{stockEstimation.totalAnimais}</p>
                </div>
                <div>
                    <p className="text-sm text-slate-500">Consumo Diário Estimado</p>
                    <p className="text-2xl font-bold text-slate-700">{stockEstimation.totalConsumoDiario.toFixed(2)} kg</p>
                </div>
                <div>
                    <p className="text-sm text-slate-500">Duração Estimada</p>
                    <p className="text-2xl font-bold text-sky-600">
                        {isFinite(stockEstimation.duracaoEstimada) ? `${Math.floor(stockEstimation.duracaoEstimada)} dias` : 'Indefinida'}
                    </p>
                </div>
            </div>
        ) : (
            <p className="text-center text-slate-600">Nenhum lote de animais encontrado. Adicione lotes na Gestão de Barracões para calcular a estimativa.</p>
        )}
      </div>

      <div className="mb-6">
        <Input
          label="Número de Silo(s):"
          id="silos-quantidade"
          type="number"
          min="1"
          value={silosQuantidade}
          onChange={handleSilosQuantidadeChange}
          className="max-w-xs"
        />
      </div>

      <div className="space-y-6">
        {silos.map((silo, index) => (
          <div key={silo.id} className="p-4 border border-slate-200 rounded-lg shadow-sm bg-white">
            <h4 className="text-lg font-semibold text-slate-700 mb-3">Silo {index + 1}</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
               <Input
                label={`Capacidade do Silo ${index + 1} (kg):`}
                id={`silo-capacidade-${index}`}
                type="number"
                step="0.01"
                min="0"
                value={silo.capacidade}
                onChange={(e) => handleSiloInputChange(index, 'capacidade', e.target.value)}
              />
              <Input
                label={`Ração Atual no Silo ${index + 1} (kg):`}
                id={`silo-racao-${index}`}
                type="number"
                step="0.01"
                min="0"
                value={silo.racaoAtual}
                onChange={(e) => handleSiloInputChange(index, 'racaoAtual', e.target.value)}
              />
            </div>
          </div>
        ))}
      </div>

      <div className="mt-8 flex flex-wrap gap-3">
        <Button onClick={handleSalvarSilos} variant="primary">
            <i className="fas fa-save mr-2"></i>Salvar Dados dos Silos
        </Button>
      </div>
      
      {saveStatus && (
        <div className="mt-4 p-3 bg-green-50 border border-green-200 text-green-700 rounded-md text-sm">
          {saveStatus}
        </div>
      )}

      {resumo && (
        <div className="mt-8 p-4 sm:p-6 bg-slate-50 rounded-lg border border-slate-200">
          {resumo}
        </div>
      )}
    </div>
  );
};

export default RacaoManagement;
