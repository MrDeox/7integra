import { Utils } from './utils.js';

// Shed Management Module
const ShedManager = (() => {
    const shedsQtyInput = Utils.qs('#barracoes-quantidade');
    const generateShedsBtn = Utils.qs('#gerar-barracoes');
    const shedsContainer = Utils.qs('#barracoes-container');
    const saveShedsBtn = Utils.qs('#salvar-barracoes');
    const shedsSummaryDiv = Utils.qs('#barracoes-summary');
    const shedsTableBody = Utils.qs('#barracoes-table tbody');

    const generateShedForms = () => {
        if (!shedsQtyInput || !shedsContainer || !saveShedsBtn || !shedsSummaryDiv) return;

        const shedsQty = Utils.getIntValue('#barracoes-quantidade');
        shedsContainer.innerHTML = '';

        if (shedsQty <= 0 || shedsQty > 20) { // Limit max sheds
            Utils.showAlert('Informe um número de barracões válido (1-20).', 'warning');
            shedsQtyInput.value = Math.max(1, Math.min(20, shedsQty || 1)); // Correct value, ensure not NaN
            Utils.hideElement(saveShedsBtn);
            Utils.hideElement(shedsSummaryDiv);
            return;
        }

        for (let i = 1; i <= shedsQty; i++) {
            const div = document.createElement('div');
            div.className = 'form-group shed-entry';
            div.innerHTML = `
                <h3>Barracão ${i}</h3>
                <label for="barracao-${i}-machos">Número de Machos:</label>
                <input type="number" id="barracao-${i}-machos" class="shed-males" min="0" value="0" required>
                <label for="barracao-${i}-femeas">Número de Fêmeas:</label>
                <input type="number" id="barracao-${i}-femeas" class="shed-females" min="0" value="0" required>
            `;
            shedsContainer.appendChild(div);
        }
        Utils.showElement(saveShedsBtn);
        Utils.hideElement(shedsSummaryDiv); // Hide summary until saved
    };

    const saveShedData = () => {
        if (!shedsQtyInput || !shedsTableBody || !shedsSummaryDiv) return;

        const shedsQty = Utils.getIntValue('#barracoes-quantidade');
        shedsTableBody.innerHTML = '';
        let totalOverallMales = 0;
        let totalOverallFemales = 0;
        let allValid = true;

        if (shedsQty === 0) {
             Utils.hideElement(shedsSummaryDiv);
            return;
        }

        for (let i = 1; i <= shedsQty; i++) {
            const malesInput = Utils.qs(`#barracao-${i}-machos`);
            const femalesInput = Utils.qs(`#barracao-${i}-femeas`);

            if (!malesInput || !femalesInput) {
                allValid = false; break;
            }

            const males = parseInt(malesInput.value, 10) || 0;
            const females = parseInt(femalesInput.value, 10) || 0;

            if (males < 0 || females < 0) {
                Utils.showAlert(`Valores negativos não são permitidos para o Barracão ${i}.`, 'error');
                (males < 0 ? malesInput : femalesInput).focus();
                allValid = false;
                break;
            }

            const total = males + females;
            const row = shedsTableBody.insertRow();
            row.innerHTML = `
                <td>Barracão ${i}</td>
                <td>${males}</td>
                <td>${females}</td>
                <td>${total}</td>
            `;
            totalOverallMales += males;
            totalOverallFemales += females;
        }

        if (!allValid) {
            Utils.hideElement(shedsSummaryDiv);
            return;
        }

        const totalRow = shedsTableBody.insertRow();
        totalRow.style.fontWeight = 'bold';
        totalRow.innerHTML = `
            <td>Total Geral</td>
            <td>${totalOverallMales}</td>
            <td>${totalOverallFemales}</td>
            <td>${totalOverallMales + totalOverallFemales}</td>
        `;
        Utils.showElement(shedsSummaryDiv);
        Utils.showAlert('Dados dos barracões salvos e resumidos.', 'success');
    };

    const init = () => {
        if (generateShedsBtn) generateShedsBtn.addEventListener('click', generateShedForms);
        if (saveShedsBtn) saveShedsBtn.addEventListener('click', saveShedData);
        if (shedsQtyInput) shedsQtyInput.addEventListener('change', generateShedForms);
        if (shedsQtyInput && shedsContainer && saveShedsBtn && shedsSummaryDiv) generateShedForms(); // Initial call
    };

    return { init };
})();

export default ShedManager;
