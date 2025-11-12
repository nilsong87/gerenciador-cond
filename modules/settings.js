import { db } from './firebase.js';
import { showAlert } from './ui.js';

function showSystemSettings() {
    const modalId = 'system-settings-modal';
    const modalHtml = `
        <div id="${modalId}" class="modal-premium confirm-modal show" style="display: block;">
            <div class="modal-backdrop-premium" onclick="closeModal('${modalId}')"></div>
            <div class="modal-dialog-premium modal-dialog-centered modal-lg">
                <div class="modal-content-premium animate-bounce-in">
                    <div class="modal-header-premium">
                        <h5 class="modal-title"><i class="fas fa-sliders-h me-2"></i>Configurações do Sistema</h5>
                        <button type="button" class="btn-close-premium" onclick="closeModal('${modalId}')"><i class="fas fa-times"></i></button>
                    </div>
                    <div class="modal-body-premium">
                        <div class="container-fluid">
                            <div class="row">
                                <div class="col-md-6">
                                    <h5>Geral</h5>
                                    <div class="mb-3">
                                        <label for="condoName" class="form-label">Nome do Condomínio</label>
                                        <input type="text" class="form-control" id="condoName" value="Condomínio Elite">
                                    </div>
                                    <div class="mb-3">
                                        <label for="condoLogo" class="form-label">Logo do Condomínio</label>
                                        <input type="file" class="form-control" id="condoLogo">
                                    </div>
                                </div>
                                <div class="col-md-6">
                                    <h5>Aparência</h5>
                                    <div class="mb-3">
                                        <label for="theme" class="form-label">Tema</label>
                                        <select class="form-select" id="theme">
                                            <option value="light">Claro</option>
                                            <option value="dark">Escuro</option>
                                        </select>
                                    </div>
                                    <div class="mb-3">
                                        <label for="primaryColor" class="form-label">Cor Primária</label>
                                        <input type="color" class="form-control" id="primaryColor" value="#4a90e2">
                                    </div>
                                </div>
                            </div>
                            <hr>
                            <div class="row">
                                <div class="col-md-6">
                                    <h5>Notificações</h5>
                                    <div class="form-check form-switch mb-3">
                                        <input class="form-check-input" type="checkbox" id="emailNotifications" checked>
                                        <label class="form-check-label" for="emailNotifications">Habilitar Notificações por Email</label>
                                    </div>
                                </div>
                                <div class="col-md-6">
                                    <h5>Segurança</h5>
                                    <div class="mb-3">
                                        <label for="minPasswordLength" class="form-label">Tamanho Mínimo da Senha</label>
                                        <input type="number" class="form-control" id="minPasswordLength" value="8">
                                    </div>
                                    <div class="form-check form-switch mb-3">
                                        <input class="form-check-input" type="checkbox" id="twoFactorAuth">
                                        <label class="form-check-label" for="twoFactorAuth">Habilitar Autenticação de Dois Fatores</label>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="modal-footer-premium">
                        <button type="button" class="btn-premium btn-outline-primary" onclick="closeModal('${modalId}')">Cancelar</button>
                        <button type="button" class="btn-premium btn-primary-premium" onclick="saveSystemSettings()">Salvar Alterações</button>
                    </div>
                </div>
            </div>
        </div>
    `;
    document.body.insertAdjacentHTML('beforeend', modalHtml);
}

window.closeModal = function(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.remove();
    }
}

window.saveSystemSettings = async function() {
    showAlert('Configurações salvas com sucesso!', 'success');
    closeModal('system-settings-modal');
}

export { showSystemSettings };
