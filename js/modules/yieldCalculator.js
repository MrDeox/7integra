import { Utils } from './utils.js';

// Yield Calculator Module
const YieldCalculator = (() => {
    const calculateBtn = Utils.qs('#calcular-rendimento');
    const resultDiv = Utils.qs('#rendimento-result');

    const calculate = () => {
        const weightPerTruck = Utils.getFloatValue('#peso-caminhao');
        const valuePerKg = Utils.getFloatValue('#valor-kg');
        const trucksPerDay = Utils.getIntValue('#caminhoes-dia');
        const daysOfLot = Utils.getIntValue('#dias-lote');

        if (weightPerTruck <= 0 || valuePerKg <= 0 || trucksPerDay <= 0 || daysOfLot <= 0) {
            Utils.showAlert('Preencha todos os campos com valores válidos e maiores que zero.', 'error');
            return;
        }

        const valuePerTruck = weightPerTruck * valuePerKg;
        const valuePerDay = valuePerTruck * trucksPerDay;
        const totalLotValue = valuePerDay * daysOfLot;

        Utils.setText('#valor-caminhao', valuePerTruck.toFixed(2));
        Utils.setText('#valor-dia', valuePerDay.toFixed(2));
        Utils.setText('#valor-lote', totalLotValue.toFixed(2));
        if (resultDiv) Utils.showElement(resultDiv);
    };

    const init = () => {
        if (calculateBtn) {
            calculateBtn.addEventListener('click', calculate);
        }
    };
    return { init };
})();

export default YieldCalculator;
