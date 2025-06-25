import { Utils } from './utils.js';

// Contact Form Module
const ContactForm = (() => {
    const contactForm = Utils.qs('#contact-form');
    const sendBtn = Utils.qs('#enviar-contato');
    const resultDiv = Utils.qs('#contato-result');

    const send = (event) => {
        event.preventDefault();
        if(!contactForm || !resultDiv) return;

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
        if (sendBtn) {
            sendBtn.addEventListener('click', send);
        }
    };
    return { init };
})();

export default ContactForm;
