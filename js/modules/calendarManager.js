import { Utils } from './utils.js';

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
        if (!calendarDaysContainer || !currentMonthDisplay) return;

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
        if (!eventModal || !eventTitleInput || !eventDateInput || !eventColorInput || !colorOptionsContainer ) return;
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
        if (!eventModal) return;
        eventModal.setAttribute('aria-hidden', 'true');
        Utils.hideElement(eventModal);
    };

    const saveEvent = () => {
        if (!eventTitleInput || !eventDateInput || !eventDescriptionInput || !eventColorInput) return;

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
        if (prevMonthBtn) prevMonthBtn.addEventListener('click', () => { currentDate.setMonth(currentDate.getMonth() - 1); render(); });
        if (nextMonthBtn) nextMonthBtn.addEventListener('click', () => { currentDate.setMonth(currentDate.getMonth() + 1); render(); });
        if (addEventBtn) addEventBtn.addEventListener('click', openEventModal);
        if (eventModalCloseBtn) eventModalCloseBtn.addEventListener('click', closeEventModal);
        if (saveEventBtn) saveEventBtn.addEventListener('click', saveEvent);

        if (colorOptionsContainer) {
            colorOptionsContainer.addEventListener('click', (e) => {
                const target = e.target.closest('.color-option');
                if (target) {
                    Utils.qsa('.color-option', colorOptionsContainer).forEach(opt => opt.style.borderColor = 'transparent');
                    target.style.borderColor = 'var(--dark-color)';
                    if(eventColorInput) eventColorInput.value = target.getAttribute('data-color');
                }
            });
        }

        window.addEventListener('click', (e) => { if (eventModal && e.target === eventModal) closeEventModal(); });
        window.addEventListener('keydown', (e) => { if (eventModal && e.key === 'Escape' && eventModal.getAttribute('aria-hidden') === 'false') closeEventModal(); });

        if (calendarDaysContainer && currentMonthDisplay) render(); // Initial render
    };

    return { init };
})();

export default CalendarManager;
