import { Utils } from './utils.js';

// GPD Calculator Module
const GPDCalculator = (() => {
    const calculateBtn = Utils.qs('#calcular-gpd');
    const resultDiv = Utils.qs('#gpd-result');

    const calculate = () => {
        const initialWeight = Utils.getFloatValue('#peso-inicial');
        const currentWeight = Utils.getFloatValue('#peso-atual');
        const days = Utils.getIntValue('#dias-gpd');

        if (initialWeight <= 0 || currentWeight <= 0 || days <= 0) {
            Utils.showAlert('Preencha todos os campos com valores válidos e maiores que zero.', 'error');
            return;
        }
        if (currentWeight < initialWeight) {
            Utils.showAlert('Peso atual não pode ser menor que o peso inicial.', 'error');
            return;
        }

        const gpd = (currentWeight - initialWeight) / days;
        Utils.setText('#valor-gpd', gpd.toFixed(3));
        if(resultDiv) Utils.showElement(resultDiv);
    };

    const init = () => {
        if (calculateBtn) {
            calculateBtn.addEventListener('click', calculate);
        }
    };

    return { init };
})();

export default GPDCalculator;
