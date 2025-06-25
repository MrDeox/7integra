import { Utils } from './utils.js';

// Mortality Calculator Module
const MortalityCalculator = (() => {
    const calculateBtn = Utils.qs('#calcular-mortalidade');
    const resultDiv = Utils.qs('#mortalidade-result');

    const calculate = () => {
        const initialAnimals = Utils.getIntValue('#animais-iniciais');
        const losses = Utils.getIntValue('#animais-baixas');

        if (initialAnimals <= 0) {
            Utils.showAlert('Informe um número inicial de animais válido.', 'error');
            return;
        }
        if (losses < 0) {
            Utils.showAlert('Número de baixas não pode ser negativo.', 'error');
            return;
        }
        if (losses > initialAnimals) {
            Utils.showAlert('Número de baixas não pode ser maior que o número inicial de animais.', 'error');
            return;
        }

        const currentAnimals = initialAnimals - losses;
        const mortalityRate = initialAnimals > 0 ? (losses / initialAnimals) * 100 : 0;

        Utils.setText('#animais-atuais', currentAnimals);
        Utils.setText('#taxa-mortalidade', mortalityRate.toFixed(2));
        if(resultDiv) Utils.showElement(resultDiv);
    };

    const init = () => {
        if (calculateBtn) {
            calculateBtn.addEventListener('click', calculate);
        }
    };

    return { init };
})();

export default MortalityCalculator;
