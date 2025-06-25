import { Utils, createCustomAlertBox } from './modules/utils.js';
import TabManager from './modules/tabManager.js';
import FeedManager from './modules/feedManager.js';
import MortalityCalculator from './modules/mortalityCalculator.js';
import GPDCalculator from './modules/gpdCalculator.js';
import ShedManager from './modules/shedManager.js';
import CalendarManager from './modules/calendarManager.js';
import YieldCalculator from './modules/yieldCalculator.js';
import ServiceOrderManager from './modules/serviceOrderManager.js';
import ContactForm from './modules/contactForm.js';

// Main App Initialization
const App = (() => {
    const initializeModules = () => {
        // Ensure alert box is in DOM for Utils.showAlert by creating it early
        // Utils relies on createCustomAlertBox being available globally or imported and called.
        // Since createCustomAlertBox is also in utils.js, it's better if Utils.showAlert calls it directly if needed.
        // For now, let's ensure it's called once.
        createCustomAlertBox();

        TabManager.init();
        FeedManager.init();
        MortalityCalculator.init();
        GPDCalculator.init();
        ShedManager.init();
        CalendarManager.init();
        YieldCalculator.init();
        ServiceOrderManager.init();
        ContactForm.init();
    };

    const init = () => {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', initializeModules);
        } else {
            initializeModules(); // DOM already loaded
        }
    };
    return { init };
})();

App.init();
