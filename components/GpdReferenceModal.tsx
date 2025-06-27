
import React from 'react';
import Modal from './ui/Modal';
import { GPD_REFERENCE_TABLE, GpdReferenceItem } from '../utils/gpdData'; 

interface GpdReferenceModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const GpdReferenceModal: React.FC<GpdReferenceModalProps> = ({ isOpen, onClose }) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Tabela de Referência GPD Suíno (15-150 dias)">
      <div className="max-h-[60vh] overflow-y-auto text-sm">
        <p className="mb-3 text-xs text-slate-600">
          Esta tabela apresenta valores médios de referência para o Ganho de Peso Diário (GPD) de suínos.
          O desempenho real pode variar conforme genética, nutrição, manejo e sanidade do lote.
        </p>
        <table className="min-w-full divide-y divide-slate-200 border border-slate-200">
          <thead className="bg-slate-100 sticky top-0">
            <tr>
              <th className="px-3 py-2 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Faixa de Idade (dias)</th>
              <th className="px-3 py-2 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Peso Vivo Médio (kg)</th>
              <th className="px-3 py-2 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">GPD Médio (g/dia)</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-slate-200">
            {GPD_REFERENCE_TABLE.map((item, index) => (
              <tr key={index} className={index % 2 === 0 ? 'bg-white' : 'bg-slate-50'}>
                <td className="px-3 py-2 whitespace-nowrap text-slate-700">{item.ageRangeStart} – {item.ageRangeEnd}</td>
                <td className="px-3 py-2 whitespace-nowrap text-slate-700">
                  {item.weightRangeStartKg.toLocaleString('pt-BR', { minimumFractionDigits: 1, maximumFractionDigits: 1 })} 
                  {' → '} 
                  {item.weightRangeEndKg.toLocaleString('pt-BR', { minimumFractionDigits: 1, maximumFractionDigits: (item.isEstimate ? 1 : 1) })}
                  {item.isEstimate ? '*' : ''}
                </td>
                <td className="px-3 py-2 whitespace-nowrap text-slate-700">
                    {item.expectedGpdGrams}
                    {item.isEstimate ? '*' : ''}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {GPD_REFERENCE_TABLE.some(item => item.isEstimate) && (
            <p className="mt-3 text-xs text-slate-500">* Valores estimados para o final do período.</p>
        )}
      </div>
    </Modal>
  );
};

export default GpdReferenceModal;
