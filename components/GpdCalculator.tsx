
import React, { useState, useCallback } from 'react';
import Input from './ui/Input';
import Button from './ui/Button';

const GpdCalculator: React.FC = () => {
  const [pesoInicial, setPesoInicial] = useState<number>(0);
  const [pesoAtual, setPesoAtual] = useState<number>(0);
  const [diasGPD, setDiasGPD] = useState<number>(0);
  const [gpd, setGpd] = useState<number | null>(null);

  const handleCalcularGPD = useCallback(() => {
    if (pesoInicial <= 0 || pesoAtual <= 0 || diasGPD <= 0 || pesoAtual < pesoInicial) {
      alert('Preencha todos os campos com valores válidos. O peso atual deve ser maior ou igual ao peso inicial.');
      return;
    }
    const calculatedGpd = (pesoAtual - pesoInicial) / diasGPD;
    setGpd(calculatedGpd);
  }, [pesoInicial, pesoAtual, diasGPD]);

  return (
    <div>
      <h2 className="text-2xl font-semibold text-slate-800 mb-6">Cálculo de GPD (Ganho de Peso Diário)</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Input
          label="Peso Inicial (kg):"
          id="peso-inicial"
          type="number"
          step="0.01"
          min="0"
          value={pesoInicial}
          onChange={(e) => setPesoInicial(parseFloat(e.target.value) || 0)}
        />
        <Input
          label="Peso Atual (kg):"
          id="peso-atual"
          type="number"
          step="0.01"
          min="0"
          value={pesoAtual}
          onChange={(e) => setPesoAtual(parseFloat(e.target.value) || 0)}
        />
        <Input
          label="Dias entre Pesagens:"
          id="dias-gpd"
          type="number"
          min="1"
          value={diasGPD}
          onChange={(e) => setDiasGPD(parseInt(e.target.value, 10) || 0)}
        />
      </div>
      <Button onClick={handleCalcularGPD} className="mt-6">
        Calcular GPD
      </Button>

      {gpd !== null && (
        <div className="mt-6 p-4 bg-slate-50 rounded-md border border-slate-200">
          <h3 className="text-lg font-semibold text-slate-700 mb-2">Resultado</h3>
          <p className="text-sm">Ganho de Peso Diário (GPD): <span className="font-medium">{gpd.toFixed(3)} kg/dia</span></p>
        </div>
      )}
    </div>
  );
};

export default GpdCalculator;
