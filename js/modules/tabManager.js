import { Utils } from './utils.js';

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
        const tabsContainer = Utils.qs('.tabs');
        if (tabsContainer) {
            tabsContainer.addEventListener('click', switchTab);
            // Ensure initial state is correct based on HTML
            const activeButton = Utils.qs('.tab-button.active');
            if (activeButton) {
                const tabId = activeButton.getAttribute('data-tab');
                const activeContent = Utils.qs(`#${tabId}`);
                if (activeContent) {
                    activeContent.classList.add('active');
                    activeContent.setAttribute('aria-hidden', 'false');
                }
            }
        }
    };

    return { init };
})();

export default TabManager;
