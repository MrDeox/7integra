import React, { useState, useCallback, ChangeEvent } from 'react';
import { BarracaoData } from '../types';
import Input from './ui/Input';
import Button from './ui/Button';

const BarracoesManagement: React.FC = () => {
  const [barracoesQuantidade, setBarracoesQuantidade] = useState<number>(1);
  const [barracoes, setBarracoes] = useState<BarracaoData[]>([{ id: 'barracao-1', machos: 0, femeas: 0 }]);
  const [resumoVisivel, setResumoVisivel] = useState<boolean>(false);

  const handleBarracoesQuantidadeChange = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    const qty = parseInt(e.target.value, 10) || 1;
    setBarracoesQuantidade(qty);
    setBarracoes(Array.from({ length: qty }, (_, i) => ({
      id: `barracao-${i + 1}`,
      machos: barracoes[i]?.machos || 0,
      femeas: barracoes[i]?.femeas || 0,
    })));
    setResumoVisivel(false);
  }, [barracoes]);

  const handleBarracaoInputChange = useCallback((index: number, field: 'machos' | 'femeas', value: string) => {
    const numericValue = parseInt(value, 10) || 0;
    setBarracoes(prevBarracoes =>
      prevBarracoes.map((barracao, i) =>
        i === index ? { ...barracao, [field]: numericValue } : barracao
      )
    );
    setResumoVisivel(false); 
  }, []);

  const handleSalvarBarracoes = useCallback(() => {
    setResumoVisivel(true);
  }, []);

  const totalMachos = barracoes.reduce((sum, b) => sum + b.machos, 0);
  const totalFemeas = barracoes.reduce((sum, b) => sum + b.femeas, 0);
  const totalGeral = totalMachos + totalFemeas;

  return (
    <div>
      <h2 className="text-2xl font-semibold text-slate-800 mb-6">Gestão de Barracões</h2>
      <Input
        label="Número de Barracões:"
        id="barracoes-quantidade"
        type="number"
        min="1"
        value={barracoesQuantidade}
        onChange={handleBarracoesQuantidadeChange}
        className="max-w-xs"
      />

      <div className="mt-6 space-y-4">
        {barracoes.map((barracao, index) => (
          <div key={barracao.id} className="p-4 border border-slate-200 rounded-md">
            <h3 className="text-md font-semibold text-slate-700 mb-2">Barracão {index + 1}</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Número de Machos:"
                id={`barracao-${index}-machos`}
                type="number"
                min="0"
                value={barracao.machos}
                onChange={(e) => handleBarracaoInputChange(index, 'machos', e.target.value)}
              />
              <Input
                label="Número de Fêmeas:"
                id={`barracao-${index}-femeas`}
                type="number"
                min="0"
                value={barracao.femeas}
                onChange={(e) => handleBarracaoInputChange(index, 'femeas', e.target.value)}
              />
            </div>
          </div>
        ))}
      </div>

      <Button onClick={handleSalvarBarracoes} className="mt-6">Salvar Dados dos Barracões</Button>

      {resumoVisivel && (
        <div className="mt-6">
          <h3 className="text-lg font-semibold text-slate-700 mb-3">Resumo dos Barracões</h3>
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white border border-slate-200">
              <thead className="bg-sky-600 text-white">
                <tr>
                  <th className="py-2 px-4 text-left text-sm font-semibold">Barracão</th>
                  <th className="py-2 px-4 text-left text-sm font-semibold">Machos</th>
                  <th className="py-2 px-4 text-left text-sm font-semibold">Fêmeas</th>
                  <th className="py-2 px-4 text-left text-sm font-semibold">Total</th>
                </tr>
              </thead>
              <tbody>
                {barracoes.map((barracao, index) => (
                  <tr key={barracao.id} className="border-b border-slate-200 hover:bg-slate-50">
                    <td className="py-2 px-4 text-sm">Barracão {index + 1}</td>
                    <td className="py-2 px-4 text-sm">{barracao.machos}</td>
                    <td className="py-2 px-4 text-sm">{barracao.femeas}</td>
                    <td className="py-2 px-4 text-sm">{barracao.machos + barracao.femeas}</td>
                  </tr>
                ))}
                <tr className="bg-slate-100 font-bold">
                  <td className="py-2 px-4 text-sm">Total Geral</td>
                  <td className="py-2 px-4 text-sm">{totalMachos}</td>
                  <td className="py-2 px-4 text-sm">{totalFemeas}</td>
                  <td className="py-2 px-4 text-sm">{totalGeral}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default BarracoesManagement;