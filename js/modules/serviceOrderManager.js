import { Utils } from './utils.js';

// Service Order (OS) Module
const ServiceOrderManager = (() => {
    const OS_STORAGE_KEY = 'farmServiceOrders';
    let osList = JSON.parse(localStorage.getItem(OS_STORAGE_KEY)) || [];
    let editingOsId = null;

    const osModal = Utils.qs('#os-modal');
    const osModalCloseBtn = Utils.qs('#os-modal .close');
    const osModalTitle = Utils.qs('#os-modal-title-h2');
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
        if (!osTableBody) return;
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

    const handleTableActions = (event) => {
        const target = event.target;
        if (target.classList.contains('edit-os')) {
            const osId = parseInt(target.getAttribute('data-id'));
            openModalForEdit(osId);
        } else if (target.classList.contains('delete-os-row')) {
            const osId = parseInt(target.getAttribute('data-id'));
            const osItem = osList.find(os => os.id === osId);
            if (osItem && confirm(`Tem certeza que deseja excluir a OS "${osItem.titulo || ''}"?`)) {
                deleteOsItem(osId);
            }
        }
    };

    const openModalForNew = () => {
        if (!osModal || !osTitleInput || !osIdInput || !osPrioritySelect || !osStatusSelect || !deleteOsBtnModal || !osModalTitle) return;
        editingOsId = null;
        const osForm = Utils.qs('#os-form');
        if(osForm) osForm.reset();
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
        if (!osModal || !osTitleInput || !osDescriptionInput || !osPrioritySelect || !osStatusSelect || !osIdInput || !deleteOsBtnModal || !osModalTitle) return;
        const os = osList.find(item => item.id === id);
        if (!os) return;
        editingOsId = id;
        const osForm = Utils.qs('#os-form');
        if(osForm) osForm.reset();
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
        if (!osModal) return;
        osModal.setAttribute('aria-hidden', 'true');
        Utils.hideElement(osModal);
        editingOsId = null;
    };

    const saveOs = () => {
        if (!osTitleInput || !osDescriptionInput || !osPrioritySelect || !osStatusSelect) return;
        const titulo = osTitleInput.value.trim();
        const descricao = osDescriptionInput.value.trim();
        const prioridade = osPrioritySelect.value;
        const status = osStatusSelect.value;
        const id = editingOsId;

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
        if (newOsBtn) newOsBtn.addEventListener('click', openModalForNew);
        if (osModalCloseBtn) osModalCloseBtn.addEventListener('click', closeModal);
        if (saveOsBtn) saveOsBtn.addEventListener('click', saveOs);
        if (deleteOsBtnModal) {
            deleteOsBtnModal.addEventListener('click', () => {
                const osItem = osList.find(os => os.id === editingOsId);
                if (editingOsId && osItem && confirm(`Tem certeza que deseja excluir a OS "${osItem.titulo || ''}"?`)) {
                    deleteOsItem(editingOsId);
                }
            });
        }
        if (osTableBody) osTableBody.addEventListener('click', handleTableActions);

        window.addEventListener('click', (e) => { if (osModal && e.target === osModal) closeModal(); });
        window.addEventListener('keydown', (e) => { if (osModal && e.key === 'Escape' && osModal.getAttribute('aria-hidden') === 'false') closeModal(); });
        renderTable();
    };

    return { init };
})();

export default ServiceOrderManager;
