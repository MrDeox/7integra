
import React, { useState, useCallback } from 'react';
import Input from './ui/Input';
import Button from './ui/Button';

const MortalidadeCalculator: React.FC = () => {
  const [animaisIniciais, setAnimaisIniciais] = useState<number>(0);
  const [animaisBaixas, setAnimaisBaixas] = useState<number>(0);
  const [resultado, setResultado] = useState<{ animaisAtuais: number; taxaMortalidade: number } | null>(null);

  const handleCalcularMortalidade = useCallback(() => {
    if (animaisIniciais <= 0) {
      alert('Informe o número inicial de animais.');
      return;
    }
    const atuais = animaisIniciais - animaisBaixas;
    const taxa = (animaisBaixas / animaisIniciais) * 100;
    setResultado({ animaisAtuais: atuais, taxaMortalidade: taxa });
  }, [animaisIniciais, animaisBaixas]);

  return (
    <div>
      <h2 className="text-2xl font-semibold text-slate-800 mb-6">Cálculo de Mortalidade</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Input
          label="Número Inicial de Animais:"
          id="animais-iniciais"
          type="number"
          min="1"
          value={animaisIniciais}
          onChange={(e) => setAnimaisIniciais(parseInt(e.target.value, 10) || 0)}
        />
        <Input
          label="Número de Baixas:"
          id="animais-baixas"
          type="number"
          min="0"
          value={animaisBaixas}
          onChange={(e) => setAnimaisBaixas(parseInt(e.target.value, 10) || 0)}
        />
      </div>
      <Button onClick={handleCalcularMortalidade} className="mt-6">
        Calcular Mortalidade
      </Button>

      {resultado && (
        <div className="mt-6 p-4 bg-slate-50 rounded-md border border-slate-200">
          <h3 className="text-lg font-semibold text-slate-700 mb-2">Resultado</h3>
          <p className="text-sm">Animais Atuais: <span className="font-medium">{resultado.animaisAtuais}</span></p>
          <p className="text-sm">Taxa de Mortalidade: <span className="font-medium">{resultado.taxaMortalidade.toFixed(2)}%</span></p>
        </div>
      )}
    </div>
  );
};

export default MortalidadeCalculator;
