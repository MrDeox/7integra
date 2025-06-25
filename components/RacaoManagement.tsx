
import React, { useState, useCallback, ChangeEvent } from 'react';
import { SiloData } from '../types';
import Input from './ui/Input';
import Button from './ui/Button';

const RacaoManagement: React.FC = () => {
  const [racaoQuantidade, setRacaoQuantidade] = useState<number>(0);
  const [silosQuantidade, setSilosQuantidade] = useState<number>(1);
  const [silos, setSilos] = useState<SiloData[]>([{ id: 'silo-1', capacidade: 0, racaoAtual: 0 }]);
  const [resumo, setResumo] = useState<React.ReactNode | null>(null);

  const handleSilosQuantidadeChange = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    const qty = parseInt(e.target.value, 10) || 1;
    setSilosQuantidade(qty);
    setSilos(Array.from({ length: qty }, (_, i) => ({
      id: `silo-${i + 1}`,
      capacidade: silos[i]?.capacidade || 0,
      racaoAtual: silos[i]?.racaoAtual || 0,
    })));
  }, [silos]);

  const handleSiloInputChange = useCallback((index: number, field: keyof SiloData, value: string) => {
    const numericValue = parseFloat(value) || 0;
    setSilos(prevSilos => 
      prevSilos.map((silo, i) => 
        i === index ? { ...silo, [field]: numericValue } : silo
      )
    );
  }, []);

  const handleDistribuirAutomaticamente = useCallback(() => {
    if (racaoQuantidade <= 0 || silos.length === 0) {
      alert('Informe a quantidade de ração recebida e o número de silos.');
      return;
    }
    const racaoPorSilo = racaoQuantidade / silos.length;
    setSilos(prevSilos => 
      prevSilos.map(silo => ({ ...silo, racaoAtual: parseFloat(racaoPorSilo.toFixed(2)) }))
    );
  }, [racaoQuantidade, silos.length]);

  const handleSalvarDistribuicao = useCallback(() => {
    let totalDistribuido = 0;
    const summaryItems = silos.map(silo => {
      totalDistribuido += silo.racaoAtual;
      const percentual = silo.capacidade > 0 ? ((silo.racaoAtual / silo.capacidade) * 100).toFixed(1) : 'N/A';
      return (
        <li key={silo.id} className="text-sm">
          Silo {silo.id.split('-')[1]}: {silo.racaoAtual.toFixed(2)}kg ({percentual}% da capacidade de {silo.capacidade.toFixed(2)}kg)
        </li>
      );
    });

    setResumo(
      <div className="mt-4 p-4 bg-slate-50 rounded-md border border-slate-200">
        <h3 className="text-lg font-semibold text-slate-700 mb-2">Resumo da Distribuição</h3>
        <ul className="list-disc list-inside space-y-1">{summaryItems}</ul>
        <p className="mt-2 font-bold text-slate-700">Total Distribuído: {totalDistribuido.toFixed(2)}kg</p>
      </div>
    );
  }, [silos]);

  return (
    <div>
      <h2 className="text-2xl font-semibold text-slate-800 mb-6">Gestão de Ração</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Input
          label="Quantidade Recebida (kg):"
          id="racao-quantidade"
          type="number"
          step="0.01"
          value={racaoQuantidade}
          onChange={(e) => setRacaoQuantidade(parseFloat(e.target.value) || 0)}
        />
        <Input
          label="Número de Silo(s):"
          id="silos-quantidade"
          type="number"
          min="1"
          value={silosQuantidade}
          onChange={handleSilosQuantidadeChange}
        />
      </div>

      <div className="mt-6 space-y-4">
        {silos.map((silo, index) => (
          <div key={silo.id} className="p-4 border border-slate-200 rounded-md">
            <h4 className="text-md font-semibold text-slate-700 mb-2">Silo {index + 1}</h4>
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
                label={`Ração no Silo ${index + 1} (kg):`}
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

      <div className="mt-6 flex space-x-3">
        <Button variant="success" onClick={handleDistribuirAutomaticamente}>Distribuir Automaticamente</Button>
        <Button onClick={handleSalvarDistribuicao}>Salvar Distribuição</Button>
      </div>
      
      {resumo}
    </div>
  );
};

export default RacaoManagement;
