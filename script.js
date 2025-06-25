// Utility functions
const Utils = {
    qs: (selector, parent = document) => parent.querySelector(selector),
    qsa: (selector, parent = document) => parent.querySelectorAll(selector),
    showElement: (element) => element.style.display = 'block',
    hideElement: (element) => element.style.display = 'none',
    getValue: (selector) => Utils.qs(selector).value,
    getIntValue: (selector) => parseInt(Utils.getValue(selector), 10) || 0,
    getFloatValue: (selector) => parseFloat(Utils.getValue(selector)) || 0,
    setText: (selector, text) => Utils.qs(selector).textContent = text,
    setHtml: (selector, html) => Utils.qs(selector).innerHTML = html,
    isValidEmail: (email) => /^\S+@\S+\.\S+$/.test(email),
    showAlert: (message, type = 'info') => { // type can be 'info', 'error', 'success'
        // Replace with a more sophisticated notification system if desired
        const alertBox = Utils.qs('#custom-alert') || createCustomAlertBox();
        alertBox.textContent = message;
        alertBox.className = `custom-alert custom-alert-${type} show`;
        setTimeout(() => {
            alertBox.classList.remove('show');
        }, 3000);
    }
};

function createCustomAlertBox() {
    const alertBox = document.createElement('div');
    alertBox.id = 'custom-alert';
    alertBox.className = 'custom-alert'; // Base class
    document.body.appendChild(alertBox);
    // Add styles for custom-alert in style.css
    // e.g., position fixed, top, right, padding, bg-color, transitions
    return alertBox;
}


// Tab Management Module
const TabManager = (() => {
    const tabButtons = Utils.qsa('.tab-button');
    const tabContents = Utils.qsa('.tab-content');

    const switchTab = (event) => {
        const clickedButton = event.target.closest('.tab-button');
        if (!clickedButton) return;

        tabButtons.forEach(btn => {
            btn.classList.remove('active');
            btn.setAttribute('aria-selected', 'false');
        });
        tabContents.forEach(content => {
            content.classList.remove('active');
            content.setAttribute('aria-hidden', 'true');
        });

        clickedButton.classList.add('active');
        clickedButton.setAttribute('aria-selected', 'true');
        const tabId = clickedButton.getAttribute('data-tab');
        const activeContent = Utils.qs(`#${tabId}`);
        activeContent.classList.add('active');
        activeContent.setAttribute('aria-hidden', 'false');
    };

    const init = () => {
        Utils.qs('.tabs').addEventListener('click', switchTab);
         // Ensure initial state is correct based on HTML
        const activeButton = Utils.qs('.tab-button.active');
        if (activeButton) {
            const tabId = activeButton.getAttribute('data-tab');
            Utils.qs(`#${tabId}`).classList.add('active');
            Utils.qs(`#${tabId}`).setAttribute('aria-hidden', 'false');

        }

    };

    return { init };
})();

// Feed Management Module
const FeedManager = (() => {
    const silosQtyInput = Utils.qs('#silos-quantidade');
    const silosContainer = Utils.qs('#silos-container');
    const distributeAutoBtn = Utils.qs('#distribuir-auto');
    const saveFeedBtn = Utils.qs('#salvar-racao');
    const feedResultDiv = Utils.qs('#racao-result');
    // const feedSummaryDiv = Utils.qs('#racao-summary'); // Not used directly, use setHtml
    // const receivedQtyInput = Utils.qs('#racao-quantidade'); // Not used directly, use getValue

    const generateSiloInputs = () => {
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
        }
    };

    const autoDistributeFeed = () => {
        const totalFeed = Utils.getFloatValue('#racao-quantidade');
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
        silosQtyInput.addEventListener('change', generateSiloInputs);
        distributeAutoBtn.addEventListener('click', autoDistributeFeed);
        saveFeedBtn.addEventListener('click', saveFeedDistribution);
        generateSiloInputs();
    };

    return { init };
})();

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
        Utils.showElement(resultDiv);
    };

    const init = () => {
        calculateBtn.addEventListener('click', calculate);
    };

    return { init };
})();

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
        Utils.showElement(resultDiv);
    };

    const init = () => {
        calculateBtn.addEventListener('click', calculate);
    };

    return { init };
})();

// Shed Management Module
const ShedManager = (() => {
    const shedsQtyInput = Utils.qs('#barracoes-quantidade');
    const generateShedsBtn = Utils.qs('#gerar-barracoes');
    const shedsContainer = Utils.qs('#barracoes-container');
    const saveShedsBtn = Utils.qs('#salvar-barracoes');
    const shedsSummaryDiv = Utils.qs('#barracoes-summary');
    const shedsTableBody = Utils.qs('#barracoes-table tbody');

    const generateShedForms = () => {
        const shedsQty = Utils.getIntValue('#barracoes-quantidade');
        shedsContainer.innerHTML = '';

        if (shedsQty <= 0 || shedsQty > 20) { // Limit max sheds
            Utils.showAlert('Informe um número de barracões válido (1-20).', 'warning');
            shedsQtyInput.value = Math.max(1, Math.min(20, shedsQty)); // Correct value
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

            if (!malesInput || !femalesInput) { // Should not happen if forms generated correctly
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
        generateShedsBtn.addEventListener('click', generateShedForms);
        saveShedsBtn.addEventListener('click', saveShedData);
        shedsQtyInput.addEventListener('change', generateShedForms);
        generateShedForms();
    };

    return { init };
})();

// Calendar Module
const CalendarManager = (() => {
    const EVENT_STORAGE_KEY = 'farmCalendarEvents';
    let currentDate = new Date();
    let events = JSON.parse(localStorage.getItem(EVENT_STORAGE_KEY)) || [];

    const calendarDaysContainer = Utils.qs('#calendar-days');
    const currentMonthDisplay = Utils.qs('#current-month');
    const prevMonthBtn = Utils.qs('#prev-month');
    const nextMonthBtn = Utils.qs('#next-month');
    const eventModal = Utils.qs('#event-modal');
    const eventModalCloseBtn = Utils.qs('#event-modal .close');
    const addEventBtn = Utils.qs('#adicionar-evento');
    const saveEventBtn = Utils.qs('#save-event');
    const eventTitleInput = Utils.qs('#event-title');
    const eventDateInput = Utils.qs('#event-date');
    const eventDescriptionInput = Utils.qs('#event-description');
    const eventColorInput = Utils.qs('#event-color');
    const colorOptionsContainer = Utils.qs('#event-modal .form-group div[role="radiogroup"]');


    const saveEventsToStorage = () => {
        localStorage.setItem(EVENT_STORAGE_KEY, JSON.stringify(events));
    };

    const render = () => {
        const year = currentDate.getFullYear();
        const month = currentDate.getMonth();
        currentMonthDisplay.textContent = `${currentDate.toLocaleString('pt-BR', { month: 'long' })} ${year}`;
        calendarDaysContainer.innerHTML = '';
        const firstDayOfMonth = new Date(year, month, 1);
        const lastDayOfMonth = new Date(year, month + 1, 0);
        const daysInMonth = lastDayOfMonth.getDate();

        for (let i = 0; i < firstDayOfMonth.getDay(); i++) {
            calendarDaysContainer.insertAdjacentHTML('beforeend', '<div class="calendar-day"></div>');
        }

        for (let i = 1; i <= daysInMonth; i++) {
            const dayCell = document.createElement('div');
            dayCell.className = 'calendar-day';
            dayCell.textContent = i;
            const isoDate = `${year}-${String(month + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`;
            dayCell.setAttribute('data-date', isoDate);

            const dayEvents = events.filter(event => event.date === isoDate);
            dayEvents.forEach(event => {
                const eventElement = document.createElement('div');
                eventElement.className = 'event';
                eventElement.textContent = event.title;
                eventElement.style.backgroundColor = event.color;
                eventElement.setAttribute('data-id', event.id);
                eventElement.setAttribute('role', 'button');
                eventElement.tabIndex = 0; // Make it focusable
                eventElement.addEventListener('click', () => showEventDetails(event));
                eventElement.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') showEventDetails(event); });
                dayCell.appendChild(eventElement);
            });
            calendarDaysContainer.appendChild(dayCell);
        }
    };

    const showEventDetails = (event) => {
        Utils.showAlert(`Evento: ${event.title}\nData: ${new Date(event.date + 'T00:00:00Z').toLocaleDateString('pt-BR', {timeZone: 'UTC'})}\nDescrição: ${event.description || 'N/A'}\nCor: ${event.color}`, 'info');
    };

    const openEventModal = () => {
        Utils.qs('#event-form').reset(); // Reset form fields
        eventDateInput.valueAsDate = new Date(); // Default to today
        eventColorInput.value = '#3498db'; // Default color
        Utils.qsa('.color-option', colorOptionsContainer).forEach(opt => {
            opt.style.borderColor = 'transparent'; // Reset border
            if (opt.getAttribute('data-color') === eventColorInput.value) {
                opt.style.borderColor = 'var(--dark-color)'; // Highlight default
            }
        });
        eventModal.setAttribute('aria-hidden', 'false');
        Utils.showElement(eventModal);
        eventTitleInput.focus();
    };

    const closeEventModal = () => {
        eventModal.setAttribute('aria-hidden', 'true');
        Utils.hideElement(eventModal);
    };

    const saveEvent = () => {
        const title = eventTitleInput.value.trim();
        const date = eventDateInput.value; // YYYY-MM-DD format
        const description = eventDescriptionInput.value.trim();
        const color = eventColorInput.value;

        if (!title || !date) {
            Utils.showAlert('Título e data do evento são obrigatórios.', 'error');
            return;
        }
        events.push({ id: Date.now(), title, date, description, color });
        saveEventsToStorage();
        Utils.showAlert('Evento salvo com sucesso!', 'success');
        closeEventModal();
        render();
    };

    const init = () => {
        prevMonthBtn.addEventListener('click', () => { currentDate.setMonth(currentDate.getMonth() - 1); render(); });
        nextMonthBtn.addEventListener('click', () => { currentDate.setMonth(currentDate.getMonth() + 1); render(); });
        addEventBtn.addEventListener('click', openEventModal);
        eventModalCloseBtn.addEventListener('click', closeEventModal);
        saveEventBtn.addEventListener('click', saveEvent);

        colorOptionsContainer.addEventListener('click', (e) => {
            const target = e.target.closest('.color-option');
            if (target) {
                Utils.qsa('.color-option', colorOptionsContainer).forEach(opt => opt.style.borderColor = 'transparent');
                target.style.borderColor = 'var(--dark-color)';
                eventColorInput.value = target.getAttribute('data-color');
            }
        });

        window.addEventListener('click', (e) => { if (e.target === eventModal) closeEventModal(); });
        window.addEventListener('keydown', (e) => { if (e.key === 'Escape' && eventModal.getAttribute('aria-hidden') === 'false') closeEventModal(); });
        render(); // Initial render
    };

    return { init };
})();

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
        Utils.showElement(resultDiv);
    };

    const init = () => {
        calculateBtn.addEventListener('click', calculate);
    };
    return { init };
})();

// Service Order (OS) Module
const ServiceOrderManager = (() => {
    const OS_STORAGE_KEY = 'farmServiceOrders';
    let osList = JSON.parse(localStorage.getItem(OS_STORAGE_KEY)) || [];
    let editingOsId = null;

    const osModal = Utils.qs('#os-modal');
    const osModalCloseBtn = Utils.qs('#os-modal .close');
    const osModalTitle = Utils.qs('#os-modal-title-h2'); // Corrected ID from HTML
    const osTitleInput = Utils.qs('#os-titulo');
    const osDescriptionInput = Utils.qs('#os-descricao');
    const osPrioritySelect = Utils.qs('#os-prioridade');
    const osStatusSelect = Utils.qs('#os-status');
    const osIdInput = Utils.qs('#os-id');
    const newOsBtn = Utils.qs('#nova-os');
    const saveOsBtn = Utils.qs('#save-os');
    const deleteOsBtnModal = Utils.qs('#os-modal #delete-os');
    const osTableBody = Utils.qs('#os-table tbody');

    const saveOsListToStorage = () => {
        localStorage.setItem(OS_STORAGE_KEY, JSON.stringify(osList));
    };

    const renderTable = () => {
        osTableBody.innerHTML = '';
        if (osList.length === 0) {
            osTableBody.innerHTML = '<tr><td colspan="5" style="text-align:center;">Nenhuma ordem de serviço cadastrada.</td></tr>';
            return;
        }
        osList.forEach(os => {
            const row = osTableBody.insertRow();
            row.innerHTML = `
                <td>${Utils.escapeHtml(os.titulo)}</td>
                <td>${Utils.escapeHtml(os.descricao)}</td>
                <td>${Utils.escapeHtml(os.prioridade)}</td>
                <td>${Utils.escapeHtml(os.status)}</td>
                <td>
                    <button class="edit-os" data-id="${os.id}" aria-label="Editar OS ${Utils.escapeHtml(os.titulo)}">Editar</button>
                    <button class="delete-os-row btn-danger" data-id="${os.id}" aria-label="Excluir OS ${Utils.escapeHtml(os.titulo)}">Excluir</button>
                </td>
            `;
        });
    };

    // Add escapeHtml to Utils if not already present
    Utils.escapeHtml = Utils.escapeHtml || function(unsafe) {
        if (unsafe === null || typeof unsafe === 'undefined') return '';
        return unsafe
             .toString()
             .replace(/&/g, "&amp;")
             .replace(/</g, "&lt;")
             .replace(/>/g, "&gt;")
             .replace(/"/g, "&quot;")
             .replace(/'/g, "&#039;");
    };

    const handleTableActions = (event) => {
        const target = event.target;
        if (target.classList.contains('edit-os')) {
            const osId = parseInt(target.getAttribute('data-id'));
            openModalForEdit(osId);
        } else if (target.classList.contains('delete-os-row')) {
            const osId = parseInt(target.getAttribute('data-id'));
            if (confirm(`Tem certeza que deseja excluir a OS "${osList.find(os=>os.id===osId)?.titulo || ''}"?`)) {
                deleteOsItem(osId);
            }
        }
    };

    const openModalForNew = () => {
        editingOsId = null;
        Utils.qs('#os-form').reset();
        osModalTitle.textContent = 'Nova Ordem de Serviço';
        osIdInput.value = '';
        osPrioritySelect.value = 'Média'; // Default
        osStatusSelect.value = 'Aberto'; // Default
        Utils.hideElement(deleteOsBtnModal);
        osModal.setAttribute('aria-hidden', 'false');
        Utils.showElement(osModal);
        osTitleInput.focus();
    };

    const openModalForEdit = (id) => {
        const os = osList.find(item => item.id === id);
        if (!os) return;
        editingOsId = id;
        Utils.qs('#os-form').reset();
        osModalTitle.textContent = 'Editar Ordem de Serviço';
        osIdInput.value = os.id;
        osTitleInput.value = os.titulo;
        osDescriptionInput.value = os.descricao;
        osPrioritySelect.value = os.prioridade;
        osStatusSelect.value = os.status;
        Utils.showElement(deleteOsBtnModal);
        osModal.setAttribute('aria-hidden', 'false');
        Utils.showElement(osModal);
        osTitleInput.focus();
    };

    const closeModal = () => {
        osModal.setAttribute('aria-hidden', 'true');
        Utils.hideElement(osModal);
        editingOsId = null;
    };

    const saveOs = () => {
        const titulo = osTitleInput.value.trim();
        const descricao = osDescriptionInput.value.trim();
        const prioridade = osPrioritySelect.value;
        const status = osStatusSelect.value;
        const id = editingOsId; // Already an int or null

        if (!titulo || !descricao) {
            Utils.showAlert('Título e descrição da OS são obrigatórios.', 'error');
            return;
        }

        if (id) {
            const index = osList.findIndex(item => item.id === id);
            if (index !== -1) {
                osList[index] = { ...osList[index], titulo, descricao, prioridade, status };
                Utils.showAlert('OS atualizada com sucesso!', 'success');
            }
        } else {
            osList.push({ id: Date.now(), titulo, descricao, prioridade, status });
            Utils.showAlert('Nova OS criada com sucesso!', 'success');
        }
        saveOsListToStorage();
        closeModal();
        renderTable();
    };

    const deleteOsItem = (id) => {
        osList = osList.filter(item => item.id !== id);
        saveOsListToStorage();
        Utils.showAlert('OS excluída com sucesso.', 'success');
        if (editingOsId === id) {
            closeModal();
        }
        renderTable();
    };

    const init = () => {
        newOsBtn.addEventListener('click', openModalForNew);
        osModalCloseBtn.addEventListener('click', closeModal);
        saveOsBtn.addEventListener('click', saveOs);
        deleteOsBtnModal.addEventListener('click', () => {
            if (editingOsId && confirm(`Tem certeza que deseja excluir a OS "${osList.find(os=>os.id===editingOsId)?.titulo || ''}"?`)) {
                deleteOsItem(editingOsId);
            }
        });
        osTableBody.addEventListener('click', handleTableActions);
        window.addEventListener('click', (e) => { if (e.target === osModal) closeModal(); });
        window.addEventListener('keydown', (e) => { if (e.key === 'Escape' && osModal.getAttribute('aria-hidden') === 'false') closeModal(); });
        renderTable();
    };

    return { init };
})();

// Contact Form Module
const ContactForm = (() => {
    const contactForm = Utils.qs('#contact-form');
    const sendBtn = Utils.qs('#enviar-contato');
    const resultDiv = Utils.qs('#contato-result');

    const send = (event) => {
        event.preventDefault(); // Prevent default form submission if it were a submit button
        const name = Utils.getValue('#contato-nome').trim();
        const email = Utils.getValue('#contato-email').trim();
        const phone = Utils.getValue('#contato-telefone').trim();
        const message = Utils.getValue('#contato-mensagem').trim();

        if (!name || !email || !message) {
            Utils.setHtml('#contato-result', '<p style="color: var(--accent-color);">Nome, email e mensagem são obrigatórios.</p>');
            Utils.showElement(resultDiv);
            return;
        }
        if (!Utils.isValidEmail(email)) {
            Utils.setHtml('#contato-result', '<p style="color: var(--accent-color);">Email inválido.</p>');
            Utils.showElement(resultDiv);
            return;
        }

        // Simulate send - In a real app, this would be an API call
        console.log('Dados do Contato para Envio:', { name, email, phone, message });
        Utils.setHtml('#contato-result', `
            <p style="color: var(--success-color);">Mensagem enviada com sucesso!</p>
            <p>Entraremos em contato em breve.</p>
        `);
        Utils.showElement(resultDiv);
        contactForm.reset(); // Reset the form
        setTimeout(() => Utils.hideElement(resultDiv), 5000);
    };

    const init = () => {
        sendBtn.addEventListener('click', send); // Or contactForm.addEventListener('submit', send) if button type="submit"
    };
    return { init };
})();

// Main App Initialization
const App = (() => {
    const initializeModules = () => {
        TabManager.init();
        FeedManager.init();
        MortalityCalculator.init();
        GPDCalculator.init();
        ShedManager.init();
        CalendarManager.init();
        YieldCalculator.init();
        ServiceOrderManager.init();
        ContactForm.init();
        createCustomAlertBox(); // Ensure alert box is in DOM for Utils.showAlert
    };

    const init = () => {
        // DOMContentLoaded might be too early if script is in <head> without defer
        // If script is at end of body, it's fine. Otherwise, use DOMContentLoaded.
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', initializeModules);
        } else {
            initializeModules(); // DOM already loaded
        }
    };
    return { init };
})();

App.init();
