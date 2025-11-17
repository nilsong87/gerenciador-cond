import { renderNavigation, setActiveNavItem, showAlert, initGlobalEventListeners } from './ui.js';
import { userRole, currentUser, createUserByAdmin } from './auth.js';
import { renderDashboard } from './dashboard.js';
import { db } from './firebase.js';
import { cleanup } from './dashboard.js';
import { renderNotices } from './notices.js';
import { renderIncidents } from './incidents.js';
import { renderFinancialPage as renderFinancial } from './financial.js';
import { showBackupPanel as renderBackup } from './backup.js';
import { showAnalyticsPanel as renderAnalytics } from './analytics.js';
import { initAppEventListeners } from '../app.js';

function renderAdmin() {
    cleanup();
    if (userRole !== 'admin') {
        showAlert('Acesso restrito aos administradores', 'warning');
        renderDashboard();
        return;
    }

    
    const appContainer = document.getElementById('app');
    appContainer.innerHTML = `
        ${renderNavigation(userRole, currentUser)}
        <div class="container-fluid py-4 animate-fade-in">
            <div class="row mb-4">
                <div class="col-12">
                    <div class="d-flex justify-content-between align-items-center">
                        <h1 class="h3 mb-0 text-gradient">
                            <i class="fas fa-cogs me-2"></i>Painel de Administração
                        </h1>
                        <div class="btn-group">
                            <button id="generate-report-btn" class="btn btn-premium btn-success-premium">
                                <i class="fas fa-file-export me-2"></i>Relatório
                            </button>
                            <button id="system-settings-btn" class="btn btn-premium btn-primary-premium">
                                <i class="fas fa-sliders-h me-2"></i>Configurações
                            </button>
                        </div>
                    </div>
                    <p class="text-muted mb-0">Gestão completa do condomínio</p>
                </div>
            </div>
            
            <!-- Admin Statistics -->
            <div class="row mb-5">
                <div class="col-xl-2 col-md-4 mb-4">
                    <div class="stat-card primary">
                        <div class="text-center">
                            <div class="stat-number" id="total-residents">0</div>
                            <div class="stat-label">Moradores</div>
                        </div>
                    </div>
                </div>
                <div class="col-xl-2 col-md-4 mb-4">
                    <div class="stat-card success">
                        <div class="text-center">
                            <div class="stat-number" id="total-apartments">0</div>
                            <div class="stat-label">Apartamentos</div>
                        </div>
                    </div>
                </div>
                <div class="col-xl-2 col-md-4 mb-4">
                    <div class="stat-card warning">
                        <div class="text-center">
                            <div class="stat-number" id="maintenance-requests">0</div>
                            <div class="stat-label">Manutenções</div>
                        </div>
                    </div>
                </div>
                <div class="col-xl-2 col-md-4 mb-4">
                    <div class="stat-card info">
                        <div class="text-center">
                            <div class="stat-number" id="monthly-reservations">0</div>
                            <div class="stat-label">Reservas/Mês</div>
                        </div>
                    </div>
                </div>
                <div class="col-xl-2 col-md-4 mb-4">
                    <div class="stat-card danger">
                        <div class="text-center">
                            <div class="stat-number" id="pending-tasks">0</div>
                            <div class="stat-label">Tarefas</div>
                        </div>
                    </div>
                </div>
                <div class="col-xl-2 col-md-4 mb-4">
                    <div class="stat-card dark">
                        <div class="text-center">
                            <div class="stat-number" id="system-uptime">99.9%</div>
                            <div class="stat-label">Disponibilidade</div>
                        </div>
                    </div>
                </div>
            </div>
            
            <!-- Quick Actions -->
            <div class="row mb-5">
                <div class="col-12">
                    <div class="card-premium animate-slide-up">
                        <div class="card-header-premium">
                            <h5 class="card-title mb-0">
                                <i class="fas fa-bolt me-2"></i>Ações Rápidas
                            </h5>
                        </div>
                        <div class="card-body-premium">
                            <div class="row text-center">
                                <div class="col-md-2 col-6 mb-3">
                                    <button id="render-notices-btn" class="btn btn-premium btn-outline-primary w-100 h-100 py-3">
                                        <i class="fas fa-bullhorn fa-2x mb-2"></i><br>
                                        Avisos
                                    </button>
                                </div>
                                <div class="col-md-2 col-6 mb-3">
                                    <button id="user-registration-btn" class="btn btn-premium btn-outline-success w-100 h-100 py-3" style="color: blue;">
                                        <i class="fas fa-user-plus fa-2x mb-2"></i><br>
                                        Add Usuário
                                    </button>
                                </div>
                                <div class="col-md-2 col-6 mb-3">
                                    <button id="render-incidents-btn" class="btn btn-premium btn-outline-warning w-100 h-100 py-3" style="color: blue;">
                                        <i class="fas fa-exclamation-triangle fa-2x mb-2"></i><br>
         
                                                                        <span>Ocorrências</span>                                    </button>
                                </div>
                                <div class="col-md-2 col-6 mb-3">
                                    <button id="financial-panel-btn" class="btn btn-premium btn-outline-info w-100 h-100 py-3" style="color: blue;">
                                        <i class="fas fa-chart-line fa-2x mb-2"></i><br>
                                        Financeiro
                                    </button>
                                </div>
                                <div class="col-md-2 col-6 mb-3">
                                    <button id="backup-panel-btn" class="btn btn-premium btn-outline-danger w-100 h-100 py-3" style="color: blue;">
                                        <i class="fas fa-database fa-2x mb-2"></i><br>
                                        Backup
                                    </button>
                                </div>
                                <div class="col-md-2 col-6 mb-3">
                                    <button id="analytics-panel-btn" class="btn btn-premium btn-outline-dark w-100 h-100 py-3" style="color: blue;"ku>
                                        <i class="fas fa-chart-bar fa-2x mb-2"></i><br>
                                        Analytics
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            
            <!-- User Management -->
            <div class="row">
                <div class="col-12">
                    <div class="card-premium animate-slide-up">
                        <div class="card-header-premium d-flex justify-content-between align-items-center">
                            <h5 class="card-title mb-0">
                                <i class="fas fa-users me-2"></i>Gerenciar Usuários
                            </h5>
                            <button id="new-user-btn" class="btn btn-premium btn-primary-premium btn-sm">
                                <i class="fas fa-plus me-2"></i>Novo Usuário
                            </button>
                        </div>
                        <div class="card-body-premium">
                            <div class="table-responsive">
                                <table class="table table-premium">
                                    <thead>
                                        <tr>
                                            <th>Usuário</th>
                                            <th>Email</th>
                                            <th>Apartamento</th>
                                            <th>Tipo</th>
                                            <th>Último Login</th>
                                            <th>Status</th>
                                            <th>Ações</th>
                                        </tr>
                                    </thead>
                                    <tbody id="users-list">
                                        <tr>
                                            <td colspan="7" class="text-center py-5">
                                                <div class="loading"></div>
                                                <p class="text-muted mt-2">Carregando usuários...</p>
                                            </td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;

    setActiveNavItem('renderAdmin()');
    loadEnhancedAdminData();
    initGlobalEventListeners();
    initAppEventListeners();

    document.getElementById('generate-report-btn').addEventListener('click', generateSystemReport);
    document.getElementById('system-settings-btn').addEventListener('click', showSystemSettings);
    document.getElementById('render-notices-btn').addEventListener('click', renderNotices);
    document.getElementById('user-registration-btn').addEventListener('click', showUserRegistration);
    document.getElementById('render-incidents-btn').addEventListener('click', renderIncidents);
    document.getElementById('financial-panel-btn').addEventListener('click', showFinancialPanel);
    document.getElementById('backup-panel-btn').addEventListener('click', showBackupPanel);
    document.getElementById('analytics-panel-btn').addEventListener('click', showAnalyticsPanel);
    document.getElementById('new-user-btn').addEventListener('click', showUserRegistration);
}

function loadEnhancedAdminData() {
    // Placeholder for loading admin data
}

function generateSystemReport() {
    showAlert('Gerando relatório do sistema...', 'info');
}

function showSystemSettings() {
    const modalId = 'system-settings-modal';
    // Remove existing modal if it's already in the DOM
    const existingModal = document.getElementById(modalId);
    if (existingModal) {
        existingModal.remove();
    }

    const modalHtml = `
        <div id="${modalId}" class="modal-premium confirm-modal show" style="display: block;">
            <div class="modal-backdrop-premium"></div>
            <div class="modal-dialog-premium modal-lg modal-dialog-centered">
                <div class="modal-content-premium animate-bounce-in">
                    <form id="system-settings-form">
                        <div class="modal-header-premium">
                            <h5 class="modal-title"><i class="fas fa-sliders-h me-2"></i>Configurações do Sistema</h5>
                            <button type="button" class="btn-close-premium"><i class="fas fa-times"></i></button>
                        </div>
                        <div class="modal-body-premium">
                            <div class="row">
                                <div class="col-md-6">
                                    <h6 class="text-gradient">Aparência</h6>
                                    <div class="form-check form-switch mb-3">
                                        <input class="form-check-input" type="checkbox" id="dark-mode-toggle">
                                        <label class="form-check-label" for="dark-mode-toggle">Modo Escuro</label>
                                    </div>
                                    <div class="form-group mb-3">
                                        <label for="app-name">Nome do Aplicativo</label>
                                        <input type="text" id="app-name" class="form-control-premium" placeholder="Ex: Condomínio Feliz">
                                    </div>
                                    <div class="form-group mb-4">
                                        <label for="app-logo">Logo do Aplicativo</label>
                                        <input type="file" id="app-logo" class="form-control-premium">
                                    </div>
                                </div>
                                <div class="col-md-6">
                                    <h6 class="text-gradient">Notificações</h6>
                                    <div class="form-check form-switch mb-2">
                                        <input class="form-check-input" type="checkbox" id="notification-packages" checked>
                                        <label class="form-check-label" for="notification-packages">Novas Encomendas</label>
                                    </div>
                                    <div class="form-check form-switch mb-2">
                                        <input class="form-check-input" type="checkbox" id="notification-notices" checked>
                                        <label class="form-check-label" for="notification-notices">Novos Avisos</label>
                                    </div>
                                    <div class="form-check form-switch mb-4">
                                        <input class="form-check-input" type="checkbox" id="notification-incidents">
                                        <label class="form-check-label" for="notification-incidents">Novas Ocorrências</label>
                                    </div>
                                    <h6 class="text-gradient">Outros</h6>
                                     <div class="form-group">
                                        <label for="system-language">Idioma</label>
                                        <select id="system-language" class="form-select-premium">
                                            <option value="pt-BR">Português (Brasil)</option>
                                            <option value="en-US" disabled>Inglês (Em breve)</option>
                                        </select>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div class="modal-footer-premium">
                            <button type="button" class="btn-premium btn-outline-secondary btn-cancel">Cancelar</button>
                            <button type="submit" class="btn-premium btn-primary-premium">Salvar Alterações</button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    `;
    document.body.insertAdjacentHTML('beforeend', modalHtml);

    const modalElement = document.getElementById(modalId);
    const closeModal = () => modalElement.remove();

    modalElement.querySelector('.btn-close-premium').addEventListener('click', closeModal);
    modalElement.querySelector('.btn-cancel').addEventListener('click', closeModal);
    modalElement.querySelector('.modal-backdrop-premium').addEventListener('click', closeModal);

    // Load current settings
    const darkModeToggle = document.getElementById('dark-mode-toggle');
    const currentTheme = localStorage.getItem('theme');
    if (currentTheme === 'dark') {
        darkModeToggle.checked = true;
    }
    
    db.collection('settings').doc('app').get().then(doc => {
        if (doc.exists) {
            const settings = doc.data();
            document.getElementById('app-name').value = settings.appName || '';
            // Load notification settings here if saved in firestore
        }
    });


    document.getElementById('system-settings-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        
        // Theme
        if (darkModeToggle.checked) {
            document.body.classList.add('dark-mode');
            localStorage.setItem('theme', 'dark');
        } else {
            document.body.classList.remove('dark-mode');
            localStorage.setItem('theme', 'light');
        }

        // App Name
        const appName = document.getElementById('app-name').value;
        
        // Here you would handle the logo upload, e.g., to Firebase Storage
        const logoFile = document.getElementById('app-logo').files[0];
        if (logoFile) {
            showAlert('Upload de logo ainda não implementado.', 'info');
        }

        // Save settings to Firestore
        try {
            await db.collection('settings').doc('app').set({
                appName: appName,
                // Add other settings here
            }, { merge: true });
            showAlert('Configurações salvas com sucesso!', 'success');
            closeModal();
            // You might want to refresh parts of the UI here
        } catch (error) {
            console.error("Error saving settings: ", error);
            showAlert('Erro ao salvar as configurações.', 'danger');
        }
    });
}

function showUserRegistration() {
    const modalId = 'user-registration-modal';
    const modalHtml = `
        <div id="${modalId}" class="modal-premium confirm-modal show" style="display: block;">
            <div class="modal-backdrop-premium"></div>
            <div class="modal-dialog-premium modal-dialog-centered">
                <div class="modal-content-premium animate-bounce-in">
                    <form id="user-registration-form">
                        <div class="modal-header-premium">
                            <h5 class="modal-title"><i class="fas fa-user-plus me-2"></i>Novo Usuário</h5>
                            <button type="button" class="btn-close-premium"><i class="fas fa-times"></i></button>
                        </div>
                        <div class="modal-body-premium">
                            <div class="form-group mb-3">
                                <label for="user-name">Nome</label>
                                <input type="text" id="user-name" class="form-control-premium" required>
                            </div>
                            <div class="form-group mb-3">
                                <label for="user-email">Email</label>
                                <input type="email" id="user-email" class="form-control-premium" required>
                            </div>
                            <div class="form-group mb-3">
                                <label for="user-password">Senha</label>
                                <input type="password" id="user-password" class="form-control-premium" required>
                            </div>
                            <div class="form-group mb-3">
                                <label for="user-apartment">Apartamento</label>
                                <input type="text" id="user-apartment" class="form-control-premium" required>
                            </div>
                            <div class="form-group">
                                <label for="user-role">Função</label>
                                <select id="user-role" class="form-control-premium">
                                    <option value="resident">Morador</option>
                                    <option value="admin">Administrador</option>
                                </select>
                            </div>
                        </div>
                        <div class="modal-footer-premium">
                            <button type="button" class="btn-premium btn-outline-secondary btn-cancel">Cancelar</button>
                            <button type="submit" class="btn-premium btn-primary-premium">Criar Usuário</button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    `;
    document.body.insertAdjacentHTML('beforeend', modalHtml);

    const modalElement = document.getElementById(modalId);
    const closeModal = () => modalElement.remove();

    modalElement.querySelector('.btn-close-premium').addEventListener('click', closeModal);
    modalElement.querySelector('.btn-cancel').addEventListener('click', closeModal);
    modalElement.querySelector('.modal-backdrop-premium').addEventListener('click', closeModal);

    document.getElementById('user-registration-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        const name = document.getElementById('user-name').value;
        const email = document.getElementById('user-email').value;
        const password = document.getElementById('user-password').value;
        const apartment = document.getElementById('user-apartment').value;
        const role = document.getElementById('user-role').value;

        if (!name || !email || !password || !apartment || !role) {
            showAlert('Por favor, preencha todos os campos.', 'warning');
            return;
        }

        const result = await createUserByAdmin(name, email, password, apartment, role);

        if (result.success) {
            showAlert(result.message, 'success');
            closeModal();
            // TODO: Refresh user list
        } else {
            showAlert(result.message, 'danger');
        }
    });
}

function showFinancialPanel() {
    renderFinancial();
}

function showBackupPanel() {
    renderBackup();
}

function showAnalyticsPanel() {
    renderAnalytics();
}

export { renderAdmin, generateSystemReport, showSystemSettings, showUserRegistration, showFinancialPanel, showBackupPanel, showAnalyticsPanel };