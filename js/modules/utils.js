// Utility functions
export const Utils = {
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
        const alertBox = Utils.qs('#custom-alert') || createCustomAlertBox();
        alertBox.textContent = message;
        alertBox.className = `custom-alert custom-alert-${type} show`;
        setTimeout(() => {
            alertBox.classList.remove('show');
        }, 3000);
    },
    escapeHtml: function(unsafe) {
        if (unsafe === null || typeof unsafe === 'undefined') return '';
        return unsafe
             .toString()
             .replace(/&/g, "&amp;")
             .replace(/</g, "&lt;")
             .replace(/>/g, "&gt;")
             .replace(/"/g, "&quot;")
             .replace(/'/g, "&#039;");
    }
};

export function createCustomAlertBox() {
    const alertBox = document.createElement('div');
    alertBox.id = 'custom-alert';
    alertBox.className = 'custom-alert'; // Base class
    document.body.appendChild(alertBox);
    // Add styles for custom-alert in style.css
    // e.g., position fixed, top, right, padding, bg-color, transitions
    return alertBox;
}
