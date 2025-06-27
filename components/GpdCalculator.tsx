
import React, { useState, useCallback, useContext, useEffect } from 'react';
import Input from './ui/Input';
import Button from './ui/Button';
import { AppContext } from '../App';
import { GPD_REFERENCE_TABLE, findGpdReference, GpdReferenceItem } from '../utils/gpdData';
import GpdReferenceModal from './GpdReferenceModal';

type PerformanceStatus = 'ideal' | 'abaixo' | 'acima' | 'sem_referencia' | 'erro_calculo' | 'dados_insuficientes' | 'aguardando_dados';

interface GpdResult {
  gpdCalculadoKg?: number;
  gpdReferenciaKg?: number;
  performanceStatus?: PerformanceStatus;
  performanceMessage?: string;
  referenceAgeRange?: string;
  idadeAtualCliente?: number;
  pesoAtualCliente?: number;
  pesoInicialTeorico?: number;
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
  const [idadeAtualCliente, setIdadeAtualCliente] = useState<number>(() => {
    const storedAge = localStorage.getItem('gpdClienteIdade');
    return storedAge ? parseInt(storedAge, 10) : 0;
  });
  const [pesoAtualCliente, setPesoAtualCliente] = useState<number>(() => {
    const storedWeight = localStorage.getItem('gpdClientePeso');
    return storedWeight ? parseFloat(storedWeight) : 0;
  });
  
  const [resultado, setResultado] = useState<GpdResult | null>(null);
  const [isReferenceModalOpen, setIsReferenceModalOpen] = useState(false);

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
    if (idadeAtualCliente <= 0 || pesoAtualCliente <= 0) {
      setResultado({ 
        performanceStatus: 'aguardando_dados', 
        performanceMessage: 'Preencha a idade e o peso atual para ver o comparativo de GPD.',
        idadeAtualCliente: idadeAtualCliente > 0 ? idadeAtualCliente : undefined,
        pesoAtualCliente: pesoAtualCliente > 0 ? pesoAtualCliente : undefined,
      });
      return;
    }

    localStorage.setItem('gpdClienteIdade', idadeAtualCliente.toString());
    localStorage.setItem('gpdClientePeso', pesoAtualCliente.toString());

    const referenceItem = findGpdReference(idadeAtualCliente);
    if (!referenceItem) {
      setResultado({ 
          performanceStatus: 'sem_referencia', 
          performanceMessage: `Não há dados de referência para ${idadeAtualCliente} dias. A tabela de referência cobre de 15 a 150 dias.`,
          idadeAtualCliente,
          pesoAtualCliente,
      });
      return;
    }

    const pesoInicialTeorico = referenceItem.weightRangeStartKg;
    let diasConsiderados = idadeAtualCliente - referenceItem.ageRangeStart;

    if (pesoAtualCliente < pesoInicialTeorico && diasConsiderados >= 0 ) {
       setResultado({ 
          performanceStatus: 'erro_calculo', 
          performanceMessage: `Peso atual (${pesoAtualCliente}kg) é menor que o peso inicial teórico (${pesoInicialTeorico}kg) para a faixa de ${referenceItem.ageRangeStart}-${referenceItem.ageRangeEnd} dias. Verifique os dados.`,
          idadeAtualCliente,
          pesoAtualCliente,
          pesoInicialTeorico,
          referenceAgeRange: `${referenceItem.ageRangeStart} - ${referenceItem.ageRangeEnd} dias`,
       });
      return;
    }
    
    if (diasConsiderados < 0) { 
      setResultado({ 
        performanceStatus: 'erro_calculo', 
        performanceMessage: 'Erro ao calcular período. Idade informada é anterior ao início da faixa de referência selecionada.',
        idadeAtualCliente,
        pesoAtualCliente,
        referenceAgeRange: `${referenceItem.ageRangeStart} - ${referenceItem.ageRangeEnd} dias`,
      });
      return;
    }

    let gpdCalculadoKg: number;
    let performanceMessageSuffix = "";

    if (diasConsiderados === 0) {
       if (pesoAtualCliente === pesoInicialTeorico) {
          gpdCalculadoKg = 0;
          performanceMessageSuffix = ` Idade (${idadeAtualCliente}d) no início da faixa de referência. GPD é 0 kg/dia pois o peso atual (${pesoAtualCliente}kg) é igual ao inicial teórico. Avalie após alguns dias.`;
           setResultado({
                performanceStatus: 'dados_insuficientes',
                performanceMessage: `Idade (${idadeAtualCliente}d) no início da faixa de referência (${referenceItem.ageRangeStart}d). GPD é 0 kg/dia pois o peso atual (${pesoAtualCliente}kg) é igual ao inicial teórico. Avalie após alguns dias.`,
                gpdCalculadoKg: 0,
                gpdReferenciaKg: referenceItem.expectedGpdGrams / 1000,
                referenceAgeRange: `${referenceItem.ageRangeStart} - ${referenceItem.ageRangeEnd} dias`,
                idadeAtualCliente, pesoAtualCliente, pesoInicialTeorico, diasConsiderados: 1 
            });
            return; // Exit early for this specific message case
       } else {
         // If weight has changed but days is 0, we imply gain over a very short period.
         // Let's assume gain over 1 day to avoid division by zero and give some indication.
         diasConsiderados = 1; 
         gpdCalculadoKg = (pesoAtualCliente - pesoInicialTeorico) / diasConsiderados;
         performanceMessageSuffix = " (Cálculo considera 1 dia de período, pois a idade está no início da faixa de referência).";
       }
    } else {
        gpdCalculadoKg = (pesoAtualCliente - pesoInicialTeorico) / diasConsiderados;
    }

    const gpdReferenciaKg = referenceItem.expectedGpdGrams / 1000;
    const feedback = getPerformanceFeedback(gpdCalculadoKg, gpdReferenciaKg);
    
    setResultado({
      gpdCalculadoKg,
      gpdReferenciaKg,
      performanceStatus: feedback.status,
      performanceMessage: feedback.message + performanceMessageSuffix,
      referenceAgeRange: `${referenceItem.ageRangeStart} - ${referenceItem.ageRangeEnd} dias`,
      idadeAtualCliente,
      pesoAtualCliente,
      pesoInicialTeorico,
      diasConsiderados,
    });
  }, [idadeAtualCliente, pesoAtualCliente]);

  useEffect(() => {
    if (currentUser?.role === 'client') {
      calculateClientGPD();
    } else {
      // Clear client-specific results if role changes or on initial admin load
      const storedAge = localStorage.getItem('gpdClienteIdade');
      const storedWeight = localStorage.getItem('gpdClientePeso');
      if (!storedAge && !storedWeight) { // Only clear if no stored client data
        setResultado(null);
      }
    }
  }, [currentUser, idadeAtualCliente, pesoAtualCliente, calculateClientGPD]);


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
        default: return null; // No icon if no specific status or message tied to it
    }
  };

  return (
    <div>
      <h2 className="text-2xl font-semibold text-slate-800 mb-6">Cálculo de GPD e Comparativo de Desempenho</h2>
      
      {currentUser?.role === 'client' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <Input
            label="Idade Atual dos Animais (dias):"
            id="idade-atual-cliente"
            type="number"
            min="1"
            value={idadeAtualCliente > 0 ? idadeAtualCliente : ''}
            onChange={(e) => setIdadeAtualCliente(parseInt(e.target.value, 10) || 0)}
            placeholder="Ex: 45"
          />
          <Input
            label="Peso Atual Médio do Lote (kg):"
            id="peso-atual-cliente"
            type="number"
            step="0.01"
            min="0"
            value={pesoAtualCliente > 0 ? pesoAtualCliente : ''}
            onChange={(e) => setPesoAtualCliente(parseFloat(e.target.value) || 0)}
            placeholder="Ex: 15.5"
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
        {currentUser?.role !== 'client' && (
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
          
          {currentUser?.role === 'client' && resultado.idadeAtualCliente !== undefined && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3 text-sm mb-4">
              <p><strong>Idade Informada:</strong> {resultado.idadeAtualCliente} dias</p>
              <p><strong>Peso Atual Informado:</strong> {resultado.pesoAtualCliente?.toFixed(2)} kg</p>
              {resultado.referenceAgeRange && <p><strong>Faixa de Referência:</strong> {resultado.referenceAgeRange}</p>}
              {resultado.pesoInicialTeorico !== undefined && <p><strong>Peso Inicial Estimado:</strong> {resultado.pesoInicialTeorico.toFixed(2)} kg</p>}
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
