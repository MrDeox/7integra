
import React, { useState, useCallback } from 'react';
import Input from './ui/Input';
import Button from './ui/Button';

const RendimentoCalculator: React.FC = () => {
  const [pesoCaminhao, setPesoCaminhao] = useState<number>(0);
  const [valorKg, setValorKg] = useState<number>(0);
  const [caminhoesDia, setCaminhoesDia] = useState<number>(1);
  const [diasLote, setDiasLote] = useState<number>(1);
  const [resultado, setResultado] = useState<{ valorCaminhao: number; valorDia: number; valorLote: number } | null>(null);

  const handleCalcularRendimento = useCallback(() => {
    if (pesoCaminhao <= 0 || valorKg <= 0 || caminhoesDia <= 0 || diasLote <= 0) {
      alert('Preencha todos os campos com valores válidos.');
      return;
    }
    const valCaminhao = pesoCaminhao * valorKg;
    const valDia = valCaminhao * caminhoesDia;
    const valLote = valDia * diasLote;
    setResultado({ valorCaminhao: valCaminhao, valorDia: valDia, valorLote: valLote });
  }, [pesoCaminhao, valorKg, caminhoesDia, diasLote]);

  return (
    <div>
      <h2 className="text-2xl font-semibold text-slate-800 mb-6">Cálculo de Rendimento por Caminhão</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Input
          label="Peso Médio por Caminhão (kg):"
          id="peso-caminhao"
          type="number"
          step="0.01"
          min="0"
          value={pesoCaminhao}
          onChange={(e) => setPesoCaminhao(parseFloat(e.target.value) || 0)}
        />
        <Input
          label="Valor por Quilo (R$):"
          id="valor-kg"
          type="number"
          step="0.01"
          min="0"
          value={valorKg}
          onChange={(e) => setValorKg(parseFloat(e.target.value) || 0)}
        />
        <Input
          label="Número de Caminhões por Dia:"
          id="caminhoes-dia"
          type="number"
          min="1"
          value={caminhoesDia}
          onChange={(e) => setCaminhoesDia(parseInt(e.target.value, 10) || 1)}
        />
        <Input
          label="Dias de Envio do Lote:"
          id="dias-lote"
          type="number"
          min="1"
          value={diasLote}
          onChange={(e) => setDiasLote(parseInt(e.target.value, 10) || 1)}
        />
      </div>
      <Button onClick={handleCalcularRendimento} className="mt-6">
        Calcular Rendimento
      </Button>

      {resultado && (
        <div className="mt-6 p-4 bg-slate-50 rounded-md border border-slate-200">
          <h3 className="text-lg font-semibold text-slate-700 mb-2">Resultado</h3>
          <p className="text-sm">Valor Bruto por Caminhão: <span className="font-medium">R$ {resultado.valorCaminhao.toFixed(2)}</span></p>
          <p className="text-sm">Valor Bruto por Dia: <span className="font-medium">R$ {resultado.valorDia.toFixed(2)}</span></p>
          <p className="text-sm">Valor Bruto Total do Lote: <span className="font-medium">R$ {resultado.valorLote.toFixed(2)}</span></p>
        </div>
      )}
    </div>
  );
};

export default RendimentoCalculator;
