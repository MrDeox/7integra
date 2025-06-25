import { Utils } from './utils.js';

// Feed Management Module
const FeedManager = (() => {
    const silosQtyInput = Utils.qs('#silos-quantidade');
    const silosContainer = Utils.qs('#silos-container');
    const distributeAutoBtn = Utils.qs('#distribuir-auto');
    const saveFeedBtn = Utils.qs('#salvar-racao');
    const feedResultDiv = Utils.qs('#racao-result');

    const generateSiloInputs = () => {
        if (!silosQtyInput || !silosContainer) return; // Elements might not exist on all pages if HTML is split later

        const silosQty = parseInt(silosQtyInput.value, 10);
        silosContainer.innerHTML = '';

        if (silosQty > 0 && silosQty <= 20) { // Limit max silos for performance/UI
            for (let i = 1; i <= silosQty; i++) {
                const div = document.createElement('div');
                div.className = 'form-group silo-entry';
                div.innerHTML = `
                    <h4>Silo ${i}</h4>
                    <label for="silo-capacity-${i}">Capacidade do Silo ${i} (kg):</label>
                    <input type="number" id="silo-capacity-${i}" data-silo-index="${i}" class="silo-capacity-input" step="0.01" min="0" value="0" required>
                    <label for="silo-feed-${i}">Ração Atual no Silo ${i} (kg):</label>
                    <input type="number" id="silo-feed-${i}" data-silo-index="${i}" class="silo-feed-input" step="0.01" min="0" value="0" required>
                `;
                silosContainer.appendChild(div);
            }
        } else if (silosQty > 20) {
            Utils.showAlert('Número máximo de 20 silos permitido.', 'warning');
            silosQtyInput.value = "20"; // Reset to max
            generateSiloInputs(); // Recurse with corrected value
        } else if (silosQty < 0) {
            silosQtyInput.value = "1";
             generateSiloInputs();
        }
    };

    const autoDistributeFeed = () => {
        const totalFeed = Utils.getFloatValue('#racao-quantidade');
        if (!silosQtyInput) return;
        const silosQty = parseInt(silosQtyInput.value, 10) || 0;
        const feedInputs = Utils.qsa('.silo-feed-input');

        if (totalFeed <= 0) {
            Utils.showAlert('Informe a quantidade de ração recebida.', 'error');
            return;
        }
        if (silosQty === 0 || feedInputs.length === 0) {
            Utils.showAlert('Nenhum silo disponível para distribuição. Gere os formulários dos silos primeiro.', 'warning');
            return;
        }

        const feedPerSilo = totalFeed / silosQty;
        feedInputs.forEach(input => {
            input.value = feedPerSilo.toFixed(2);
        });
        Utils.showAlert('Ração distribuída automaticamente.', 'success');
    };

    const saveFeedDistribution = () => {
        if (!silosQtyInput || !feedResultDiv) return;
        const silosQty = parseInt(silosQtyInput.value, 10) || 0;
        let summaryHTML = '<ul>';
        let totalDistributed = 0;
        let allValid = true;

        if (silosQty === 0) {
            Utils.setHtml('#racao-summary', '<p>Nenhum silo configurado.</p>');
            Utils.showElement(feedResultDiv);
            return;
        }

        for (let i = 1; i <= silosQty; i++) {
            const capacityInput = Utils.qs(`#silo-capacity-${i}`);
            const feedInput = Utils.qs(`#silo-feed-${i}`);

            if (!capacityInput || !feedInput) {
                allValid = false;
                break;
            }
            const capacity = parseFloat(capacityInput.value) || 0;
            const feed = parseFloat(feedInput.value) || 0;

            if (feed > capacity && capacity > 0) {
                Utils.showAlert(`Ração no Silo ${i} (${feed}kg) excede a capacidade (${capacity}kg).`, 'error');
                feedInput.focus();
                allValid = false;
                break;
            }
            if (feed < 0 || capacity < 0) {
                 Utils.showAlert(`Valores negativos não são permitidos para Silo ${i}.`, 'error');
                (feed < 0 ? feedInput : capacityInput).focus();
                allValid = false;
                break;
            }

            let percentage = 0;
            if (capacity > 0) {
                percentage = (feed / capacity) * 100;
            } else if (feed > 0) { // Capacity is 0 or not set, but feed is present
                percentage = 100; // Or handle as an error/warning
            }

            summaryHTML += `<li>Silo ${i}: ${feed.toFixed(2)}kg (${percentage.toFixed(1)}% da capacidade de ${capacity.toFixed(2)}kg)</li>`;
            totalDistributed += feed;
        }

        if (!allValid) {
            Utils.hideElement(feedResultDiv);
            return;
        }

        summaryHTML += `</ul><p><strong>Total Distribuído:</strong> ${totalDistributed.toFixed(2)}kg</p>`;
        Utils.setHtml('#racao-summary', summaryHTML);
        Utils.showElement(feedResultDiv);
        Utils.showAlert('Distribuição de ração salva e resumida.', 'success');
    };

    const init = () => {
        if (silosQtyInput) silosQtyInput.addEventListener('change', generateSiloInputs);
        if (distributeAutoBtn) distributeAutoBtn.addEventListener('click', autoDistributeFeed);
        if (saveFeedBtn) saveFeedBtn.addEventListener('click', saveFeedDistribution);
        if (silosQtyInput && silosContainer) generateSiloInputs(); // Initial generation if elements exist
    };

    return { init };
})();

export default FeedManager;
