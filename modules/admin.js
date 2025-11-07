import { renderNavigation, setActiveNavItem, showAlert, initGlobalEventListeners } from './ui.js';
import { userRole, currentUser } from './auth.js';
import { renderDashboard } from './dashboard.js';
import { db } from './firebase.js';
import { cleanup } from './dashboard.js';
import { renderNotices } from './notices.js';
import { renderIncidents } from './incidents.js';
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
                                    <button id="user-registration-btn" class="btn btn-premium btn-outline-success w-100 h-100 py-3">
                                        <i class="fas fa-user-plus fa-2x mb-2"></i><br>
                                        Add Usuário
                                    </button>
                                </div>
                                <div class="col-md-2 col-6 mb-3">
                                    <button id="render-incidents-btn" class="btn btn-premium btn-outline-warning w-100 h-100 py-3">
                                        <i class="fas fa-exclamation-triangle fa-2x mb-2"></i><br>
         
                               Ocorrências
                                    </button>
                                </div>
                                <div class="col-md-2 col-6 mb-3">
                                    <button id="financial-panel-btn" class="btn btn-premium btn-outline-info w-100 h-100 py-3">
                                        <i class="fas fa-chart-line fa-2x mb-2"></i><br>
                                        Financeiro
                                    </button>
                                </div>
                                <div class="col-md-2 col-6 mb-3">
                                    <button id="backup-panel-btn" class="btn btn-premium btn-outline-danger w-100 h-100 py-3">
                                        <i class="fas fa-database fa-2x mb-2"></i><br>
                                        Backup
                                    </button>
                                </div>
                                <div class="col-md-2 col-6 mb-3">
                                    <button id="analytics-panel-btn" class="btn btn-premium btn-outline-dark w-100 h-100 py-3">
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
    showAlert('Funcionalidade de configurações do sistema ainda não implementada.', 'info');
}

function showUserRegistration() {
    showAlert('Funcionalidade de registro de usuário ainda não implementada.', 'info');
}

function showFinancialPanel() {
    showAlert('Funcionalidade de painel financeiro ainda não implementada.', 'info');
}

function showBackupPanel() {
    showAlert('Funcionalidade de painel de backup ainda não implementada.', 'info');
}

function showAnalyticsPanel() {
    showAlert('Funcionalidade de painel de análise ainda não implementada.', 'info');
}

export { renderAdmin, generateSystemReport, showSystemSettings, showUserRegistration, showFinancialPanel, showBackupPanel, showAnalyticsPanel };