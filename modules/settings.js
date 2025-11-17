import { db, auth } from './firebase.js';
import { showAlert } from './ui.js';
import { currentUser } from './auth.js';

// --- User Settings ---

function renderUserSettings() {
    const modalId = 'user-settings-modal';
    if (document.getElementById(modalId)) return;

    const user = currentUser;
    if (!user) {
        showAlert('Usuário não autenticado.', 'danger');
        return;
    }

    db.collection('users').doc(user.uid).get().then(doc => {
        const userData = doc.data();
        const modalHtml = `
            <div id="${modalId}" class="modal-premium confirm-modal show" style="display: block;">
                <div class="modal-backdrop-premium"></div>
                <div class="modal-dialog-premium modal-dialog-centered modal-lg">
                    <div class="modal-content-premium animate-bounce-in">
                        <div class="modal-header-premium">
                            <h5 class="modal-title"><i class="fas fa-user-cog me-2"></i>Minhas Configurações</h5>
                            <button type="button" class="btn-close-premium"><i class="fas fa-times"></i></button>
                        </div>
                        <div class="modal-body-premium">
                            <ul class="nav nav-pills mb-3" id="pills-tab" role="tablist">
                                <li class="nav-item" role="presentation"><button class="nav-link active" id="pills-profile-tab" data-bs-toggle="pill" data-bs-target="#pills-profile" type="button" role="tab">Perfil</button></li>
                                <li class="nav-item" role="presentation"><button class="nav-link" id="pills-password-tab" data-bs-toggle="pill" data-bs-target="#pills-password" type="button" role="tab">Segurança</button></li>
                            </ul>
                            <div class="tab-content" id="pills-tabContent">
                                <!-- Profile Tab -->
                                <div class="tab-pane fade show active" id="pills-profile" role="tabpanel">
                                    <form id="user-profile-form">
                                        <div class="mb-3"><label class="form-label">Email</label><input type="email" class="form-control-premium" value="${userData.email}" disabled></div>
                                        <div class="mb-3"><label for="user-name" class="form-label">Nome</label><input type="text" id="user-name" class="form-control-premium" value="${userData.name || ''}"></div>
                                        <div class="mb-3"><label for="user-apartment" class="form-label">Apartamento</label><input type="text" id="user-apartment" class="form-control-premium" value="${userData.apartment || ''}"></div>
                                        <button type="submit" class="btn btn-premium btn-primary-premium">Salvar Perfil</button>
                                    </form>
                                </div>
                                <!-- Password Tab -->
                                <div class="tab-pane fade" id="pills-password" role="tabpanel">
                                    <form id="change-password-form">
                                        <div class="mb-3"><label for="new-password" class="form-label">Nova Senha</label><input type="password" id="new-password" class="form-control-premium" required></div>
                                        <div class="mb-3"><label for="confirm-password" class="form-label">Confirmar Nova Senha</label><input type="password" id="confirm-password" class="form-control-premium" required></div>
                                        <button type="submit" class="btn btn-premium btn-primary-premium">Alterar Senha</button>
                                    </form>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
        document.body.insertAdjacentHTML('beforeend', modalHtml);
        initUserSettingsEventListeners(modalId);
    });
}

function initUserSettingsEventListeners(modalId) {
    const modalElement = document.getElementById(modalId);
    const closeModal = () => modalElement.remove();

    modalElement.querySelector('.btn-close-premium').addEventListener('click', closeModal);
    modalElement.querySelector('.modal-backdrop-premium').addEventListener('click', closeModal);

    document.getElementById('user-profile-form').addEventListener('submit', e => {
        e.preventDefault();
        saveUserProfile();
    });

    document.getElementById('change-password-form').addEventListener('submit', e => {
        e.preventDefault();
        changeUserPassword();
    });
}

function saveUserProfile() {
    const user = currentUser;
    const name = document.getElementById('user-name').value;
    const apartment = document.getElementById('user-apartment').value;

    db.collection('users').doc(user.uid).update({ name, apartment })
        .then(() => showAlert('Perfil atualizado com sucesso!', 'success'))
        .catch(err => showAlert(`Erro ao atualizar perfil: ${err.message}`, 'danger'));
}

function changeUserPassword() {
    const newPassword = document.getElementById('new-password').value;
    const confirmPassword = document.getElementById('confirm-password').value;

    if (newPassword !== confirmPassword) {
        showAlert('As senhas não coincidem.', 'warning');
        return;
    }
    if (newPassword.length < 6) {
        showAlert('A senha deve ter no mínimo 6 caracteres.', 'warning');
        return;
    }

    auth.currentUser.updatePassword(newPassword)
        .then(() => {
            showAlert('Senha alterada com sucesso!', 'success');
            document.getElementById('change-password-form').reset();
        })
        .catch(err => showAlert(`Erro ao alterar senha: ${err.message}`, 'danger'));
}


// --- System Settings (for Admins) ---

async function renderSystemSettings() {
    const modalId = 'system-settings-modal';
    if (document.getElementById(modalId)) return;

    try {
        const settingsDoc = await db.collection('settings').doc('config').get();
        const settings = settingsDoc.exists ? settingsDoc.data() : {};

        const modalHtml = `
            <div id="${modalId}" class="modal-premium confirm-modal show" style="display: block;">
                <div class="modal-backdrop-premium"></div>
                <div class="modal-dialog-premium modal-dialog-centered modal-lg">
                    <div class="modal-content-premium animate-bounce-in">
                        <div class="modal-header-premium">
                            <h5 class="modal-title"><i class="fas fa-sliders-h me-2"></i>Configurações do Sistema</h5>
                            <button type="button" class="btn-close-premium"><i class="fas fa-times"></i></button>
                        </div>
                        <div class="modal-body-premium">
                            <form id="system-settings-form">
                                <div class="row">
                                    <div class="col-md-6 mb-3">
                                        <label for="condoName" class="form-label">Nome do Condomínio</label>
                                        <input type="text" class="form-control-premium" id="condoName" value="${settings.condoName || 'Condomínio Elite'}">
                                    </div>
                                    <div class="col-md-6 mb-3">
                                        <label for="minPasswordLength" class="form-label">Tamanho Mínimo da Senha</label>
                                        <input type="number" class="form-control-premium" id="minPasswordLength" value="${settings.minPasswordLength || '8'}">
                                    </div>
                                </div>
                                <div class="form-check form-switch mb-3">
                                    <input class="form-check-input" type="checkbox" id="emailNotifications" ${settings.emailNotifications ? 'checked' : ''}>
                                    <label class="form-check-label" for="emailNotifications">Habilitar Notificações por Email</label>
                                </div>
                                <div class="form-check form-switch mb-3">
                                    <input class="form-check-input" type="checkbox" id="twoFactorAuth" ${settings.twoFactorAuth ? 'checked' : ''}>
                                    <label class="form-check-label" for="twoFactorAuth">Habilitar Autenticação de Dois Fatores (2FA)</label>
                                </div>
                            </form>
                        </div>
                        <div class="modal-footer-premium">
                            <button type="button" class="btn-premium btn-outline-secondary btn-cancel">Cancelar</button>
                            <button type="button" class="btn-premium btn-primary-premium btn-save">Salvar Alterações</button>
                        </div>
                    </div>
                </div>
            </div>
        `;
        document.body.insertAdjacentHTML('beforeend', modalHtml);
        initSystemSettingsEventListeners(modalId);

    } catch (error) {
        showAlert('Erro ao carregar configurações do sistema.', 'danger');
        console.error(error);
    }
}

function initSystemSettingsEventListeners(modalId) {
    const modalElement = document.getElementById(modalId);
    const closeModal = () => modalElement.remove();

    modalElement.querySelector('.btn-close-premium').addEventListener('click', closeModal);
    modalElement.querySelector('.btn-cancel').addEventListener('click', closeModal);
    modalElement.querySelector('.modal-backdrop-premium').addEventListener('click', closeModal);
    modalElement.querySelector('.btn-save').addEventListener('click', saveSystemSettings);
}

async function saveSystemSettings() {
    const settings = {
        condoName: document.getElementById('condoName').value,
        minPasswordLength: parseInt(document.getElementById('minPasswordLength').value, 10),
        emailNotifications: document.getElementById('emailNotifications').checked,
        twoFactorAuth: document.getElementById('twoFactorAuth').checked,
    };

    try {
        await db.collection('settings').doc('config').set(settings, { merge: true });
        showAlert('Configurações do sistema salvas com sucesso!', 'success');
        document.getElementById('system-settings-modal').remove();
    } catch (error) {
        showAlert('Erro ao salvar configurações.', 'danger');
        console.error(error);
    }
}

export { renderSystemSettings, renderUserSettings };
