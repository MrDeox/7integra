
import React, { useState, useCallback, useContext, useEffect, useMemo } from 'react';
import Input from './ui/Input';
import Button from './ui/Button';
import Select from './ui/Select';
import { AppContext } from '../App';
import { GPD_REFERENCE_TABLE, findGpdReference, GpdReferenceItem } from '../utils/gpdData';
import { getLotes, getBarracoes } from '../utils/dataManager';
import { LoteData, BarracaoData } from '../types';
import GpdReferenceModal from './GpdReferenceModal';

type PerformanceStatus = 'ideal' | 'abaixo' | 'acima' | 'sem_referencia' | 'erro_calculo' | 'dados_insuficientes' | 'aguardando_dados';

interface GpdResult {
  gpdCalculadoKg?: number;
  gpdReferenciaKg?: number;
  performanceStatus?: PerformanceStatus;
  performanceMessage?: string;
  referenceAgeRange?: string;
  idadeAtual?: number;
  pesoAtual?: number;
  pesoInicial?: number;
  diasConsiderados?: number;
}

const GpdCalculator: React.FC = () => {
  const appContext = useContext(AppContext);
  const currentUser = appContext?.currentUser;

  // Admin state
  const [pesoInicialAdmin, setPesoInicialAdmin] = useState<number>(0);
  const [pesoAtualAdmin, setPesoAtualAdmin] = useState<number>(0);
  const [diasGPDAdmin, setDiasGPDAdmin] = useState<number>(0);

  // Client state
  const [lotes, setLotes] = useState<LoteData[]>([]);
  const [barracoes, setBarracoes] = useState<BarracaoData[]>([]);
  const [selectedLoteId, setSelectedLoteId] = useState<string>('');
  const [pesoAtualCliente, setPesoAtualCliente] = useState<number | ''>('');
  
  const [resultado, setResultado] = useState<GpdResult | null>(null);
  const [isReferenceModalOpen, setIsReferenceModalOpen] = useState(false);

  useEffect(() => {
    if (currentUser?.role === 'client') {
      const allLotes = getLotes();
      const allBarracoes = getBarracoes();
      setLotes(allLotes);
      setBarracoes(allBarracoes);
      if (allLotes.length > 0 && !selectedLoteId) {
        setSelectedLoteId(allLotes[0].id);
      }
    }
  }, [currentUser, selectedLoteId]);

  const getPerformanceFeedback = (gpdCalculado: number, gpdReferencia: number): { status: PerformanceStatus, message: string } => {
    if (gpdReferencia <= 0) return { status: 'sem_referencia', message: 'GPD de referência inválido ou não aplicável.' };
    
    const diffPercent = ((gpdCalculado - gpdReferencia) / gpdReferencia) * 100;

    if (diffPercent > 10) {
      return { status: 'acima', message: 'Excelente! Desempenho significativamente acima da referência.' };
    } else if (diffPercent >= -10) {
      return { status: 'ideal', message: 'Bom! Desempenho dentro da faixa de referência.' };
    } else {
      return { status: 'abaixo', message: 'Atenção! Desempenho abaixo da referência. Verifique manejo e nutrição.' };
    }
  };
  
  const calculateClientGPD = useCallback(() => {
    if (!selectedLoteId || !pesoAtualCliente || pesoAtualCliente <= 0) {
      setResultado({
        performanceStatus: 'aguardando_dados',
        performanceMessage: 'Selecione um lote e informe o peso atual médio para ver o comparativo de GPD.',
      });
      return;
    }

    const lote = lotes.find(l => l.id === selectedLoteId);
    if (!lote) {
      setResultado({ performanceStatus: 'erro_calculo', performanceMessage: 'Lote selecionado não encontrado.' });
      return;
    }

    const dataEntrada = new Date(lote.dataEntrada);
    const today = new Date();
    // Ensure we don't compare times, only dates
    today.setHours(0,0,0,0);
    const diasPassados = Math.round((today.getTime() - dataEntrada.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diasPassados < 0) {
       setResultado({ performanceStatus: 'erro_calculo', performanceMessage: 'A data de entrada do lote está no futuro. Verifique os dados do lote.' });
       return;
    }

    const idadeAtual = lote.idadeInicial + diasPassados;
    const referenceItem = findGpdReference(idadeAtual);
    
    if (!referenceItem) {
      setResultado({
          performanceStatus: 'sem_referencia',
          performanceMessage: `Não há dados de referência para a idade atual de ${idadeAtual} dias.`,
          idadeAtual,
          pesoAtual: pesoAtualCliente,
          pesoInicial: lote.pesoInicial,
      });
      return;
    }

    if (pesoAtualCliente < lote.pesoInicial) {
       setResultado({
          performanceStatus: 'erro_calculo',
          performanceMessage: `Peso atual (${pesoAtualCliente}kg) é menor que o peso inicial do lote (${lote.pesoInicial}kg). Verifique o peso informado.`,
          idadeAtual, pesoAtual: pesoAtualCliente, pesoInicial: lote.pesoInicial,
       });
       return;
    }

    const diasConsiderados = diasPassados > 0 ? diasPassados : 1; // Avoid division by zero, assume at least 1 day
    const gpdCalculadoKg = (pesoAtualCliente - lote.pesoInicial) / diasConsiderados;
    
    const gpdReferenciaKg = referenceItem.expectedGpdGrams / 1000;
    const feedback = getPerformanceFeedback(gpdCalculadoKg, gpdReferenciaKg);
    let performanceMessage = feedback.message;
    if (diasPassados === 0 && pesoAtualCliente > lote.pesoInicial) {
        performanceMessage += " (Cálculo considera 1 dia de período, pois hoje é a data de entrada do lote)."
    }
    
    setResultado({
      gpdCalculadoKg,
      gpdReferenciaKg,
      performanceStatus: feedback.status,
      performanceMessage,
      referenceAgeRange: `${referenceItem.ageRangeStart} - ${referenceItem.ageRangeEnd} dias`,
      idadeAtual,
      pesoAtual: pesoAtualCliente,
      pesoInicial: lote.pesoInicial,
      diasConsiderados: diasConsiderados,
    });
  }, [selectedLoteId, pesoAtualCliente, lotes]);

  useEffect(() => {
    if (currentUser?.role === 'client') {
      calculateClientGPD();
    }
  }, [currentUser, calculateClientGPD]);


  // Handler for Admin calculation button
  const handleAdminCalculateGPD = useCallback(() => {
    setResultado(null); 
    if (pesoInicialAdmin <= 0 || pesoAtualAdmin <= 0 || diasGPDAdmin <= 0 || pesoAtualAdmin < pesoInicialAdmin) {
      alert('Preencha todos os campos com valores válidos. O peso atual deve ser maior ou igual ao peso inicial.');
      setResultado({ performanceStatus: 'erro_calculo', performanceMessage: 'Dados de entrada inválidos para cálculo de GPD (Admin).' });
      return;
    }
    const calculatedGpd = (pesoAtualAdmin - pesoInicialAdmin) / diasGPDAdmin;
    setResultado({ gpdCalculadoKg: calculatedGpd });
  }, [pesoInicialAdmin, pesoAtualAdmin, diasGPDAdmin]);
  
  const renderPerformanceIcon = (status?: PerformanceStatus) => {
    switch (status) {
        case 'acima': return <i className="fas fa-rocket text-green-500 mr-2 text-xl"></i>;
        case 'ideal': return <i className="fas fa-check-circle text-green-500 mr-2 text-xl"></i>;
        case 'abaixo': return <i className="fas fa-exclamation-triangle text-orange-500 mr-2 text-xl"></i>;
        case 'sem_referencia': return <i className="fas fa-question-circle text-slate-500 mr-2 text-xl"></i>;
        case 'dados_insuficientes': return <i className="fas fa-info-circle text-sky-500 mr-2 text-xl"></i>;
        case 'aguardando_dados': return <i className="fas fa-hourglass-half text-sky-500 mr-2 text-xl"></i>;
        case 'erro_calculo': return <i className="fas fa-times-circle text-red-500 mr-2 text-xl"></i>;
        default: return null;
    }
  };

  const loteOptions = useMemo(() => {
    if (lotes.length === 0) return [{ value: '', label: 'Nenhum lote para calcular' }];
    return lotes.map(lote => {
      const barracao = barracoes.find(b => b.id === lote.barracaoId);
      return {
        value: lote.id,
        label: `${lote.nome} (${barracao?.nome || 'N/A'})`
      };
    });
  }, [lotes, barracoes]);

  return (
    <div>
      <h2 className="text-2xl font-semibold text-slate-800 mb-6">Cálculo de GPD e Comparativo de Desempenho</h2>
      
      {currentUser?.role === 'client' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <Select
            label="Selecione o Lote:"
            id="select-lote-gpd"
            options={loteOptions}
            value={selectedLoteId}
            onChange={(e) => {
              setSelectedLoteId(e.target.value);
              setResultado(null); // Reset result when lote changes
            }}
            disabled={lotes.length === 0}
          />
          <Input
            label="Peso Atual Médio do Lote (kg):"
            id="peso-atual-cliente"
            type="number"
            step="0.01"
            min="0"
            value={pesoAtualCliente}
            onChange={(e) => setPesoAtualCliente(parseFloat(e.target.value) || '')}
            placeholder="Ex: 25.5"
            disabled={!selectedLoteId}
          />
        </div>
      ) : ( // Admin UI
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <Input
            label="Peso Inicial (kg):"
            id="peso-inicial-admin"
            type="number"
            step="0.01"
            min="0"
            value={pesoInicialAdmin}
            onChange={(e) => setPesoInicialAdmin(parseFloat(e.target.value) || 0)}
          />
          <Input
            label="Peso Atual (kg):"
            id="peso-atual-admin"
            type="number"
            step="0.01"
            min="0"
            value={pesoAtualAdmin}
            onChange={(e) => setPesoAtualAdmin(parseFloat(e.target.value) || 0)}
          />
          <Input
            label="Dias entre Pesagens:"
            id="dias-gpd-admin"
            type="number"
            min="1"
            value={diasGPDAdmin}
            onChange={(e) => setDiasGPDAdmin(parseInt(e.target.value, 10) || 0)}
          />
        </div>
      )}

      <div className="flex flex-wrap gap-3 items-center">
        {currentUser?.role === 'admin' && (
          <Button onClick={handleAdminCalculateGPD} variant="primary">
            <i className="fas fa-calculator mr-2"></i>Calcular GPD (Admin)
          </Button>
        )}
        <Button onClick={() => setIsReferenceModalOpen(true)} variant="light">
          <i className="fas fa-table mr-2"></i>Ver Tabela de Referência
        </Button>
      </div>

      {resultado && (
        <div className="mt-8 p-4 sm:p-6 bg-slate-50 rounded-lg border border-slate-200 shadow-md">
          <h3 className="text-xl font-semibold text-slate-700 mb-4">
            {currentUser?.role === 'client' ? 'Comparativo de Desempenho' : 'Resultado do Cálculo de GPD'}
          </h3>
          
          {currentUser?.role === 'client' && resultado.idadeAtual !== undefined && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3 text-sm mb-4">
              <p><strong>Idade Atual Estimada:</strong> {resultado.idadeAtual.toFixed(0)} dias</p>
              <p><strong>Peso Atual Informado:</strong> {resultado.pesoAtual?.toFixed(2)} kg</p>
              <p><strong>Peso Inicial do Lote:</strong> {resultado.pesoInicial?.toFixed(2)} kg</p>
              {resultado.referenceAgeRange && <p><strong>Faixa de Referência:</strong> {resultado.referenceAgeRange}</p>}
              {resultado.diasConsiderados !== undefined && <p><strong>Período Considerado:</strong> {resultado.diasConsiderados} dia(s)</p>}
            </div>
          )}

          {resultado.gpdCalculadoKg !== undefined && (
            <p className="text-lg my-3 py-3 border-y border-slate-200">
              GPD Calculado: 
              <span className="font-bold text-sky-600 ml-2 text-xl">{resultado.gpdCalculadoKg.toFixed(3)} kg/dia</span>
            </p>
          )}

          {currentUser?.role === 'client' && resultado.gpdReferenciaKg !== undefined && (
            <p className="text-sm text-slate-600 mb-3">
              GPD de Referência Esperado: 
              <span className="font-semibold ml-1">{resultado.gpdReferenciaKg.toFixed(3)} kg/dia</span>
            </p>
          )}
          
          {resultado.performanceMessage && (
            <div className={`mt-2 p-3.5 rounded-md border text-sm flex items-start shadow-sm
              ${resultado.performanceStatus === 'acima' || resultado.performanceStatus === 'ideal' ? 'bg-green-50 border-green-300 text-green-800' : 
                resultado.performanceStatus === 'abaixo' ? 'bg-orange-50 border-orange-300 text-orange-800' :
                resultado.performanceStatus === 'erro_calculo' ? 'bg-red-50 border-red-300 text-red-800' :
                'bg-sky-50 border-sky-300 text-sky-800'}`}>
              <span className="mr-2.5 mt-0.5">{renderPerformanceIcon(resultado.performanceStatus)}</span>
              <span className="flex-1">{resultado.performanceMessage}</span>
            </div>
          )}
        </div>
      )}
      <GpdReferenceModal 
        isOpen={isReferenceModalOpen}
        onClose={() => setIsReferenceModalOpen(false)}
      />
    </div>
  );
};

export default GpdCalculator;
