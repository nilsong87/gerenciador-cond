import { userRole, currentUser, logout } from './auth.js';

let chartInstances = {};
let firestoreListeners = {};

function cleanup() {
    for (const chartId in chartInstances) {
        if (chartInstances.hasOwnProperty(chartId)) {
            chartInstances[chartId].destroy();
            delete chartInstances[chartId];
        }
    }

    for (const listener in firestoreListeners) {
        if (firestoreListeners.hasOwnProperty(listener)) {
            firestoreListeners[listener]();
        }
    }
    firestoreListeners = {};
}

// Loading Screen Functions
function showLoadingScreen() {
    const loadingScreen = document.getElementById('loading-screen');
    loadingScreen.style.display = 'flex';
    loadingScreen.style.opacity = '1';
}

function hideLoadingScreen() {
    const loadingScreen = document.getElementById('loading-screen');
    loadingScreen.style.opacity = '0';
    setTimeout(() => {
        loadingScreen.style.display = 'none';
    }, 500);
}

// Alert System
function showAlert(message, type = 'info', duration = 5000) {
    const alertId = 'alert-' + Date.now();
    const alertHtml = `
        <div id="${alertId}" class="alert alert-${type} alert-dismissible fade show animate-bounce-in"
             style="border-left: 4px solid var(--${type}-color);">
            <div class="d-flex align-items-center">
                <i class="fas fa-${getAlertIcon(type)} me-3 fa-lg"></i>
                <div class="flex-grow-1">${message}</div>
                <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
            </div>
        </div>
    `;

    let alertsContainer = document.getElementById('alerts-container');
    if (!alertsContainer) {
        alertsContainer = document.createElement('div');
        alertsContainer.id = 'alerts-container';
        alertsContainer.className = 'position-fixed top-0 end-0 p-3';
        alertsContainer.style.zIndex = '9999';
        alertsContainer.style.width = '100%';
        alertsContainer.style.maxWidth = '400px';
        document.body.appendChild(alertsContainer);
    }

    alertsContainer.insertAdjacentHTML('afterbegin', alertHtml);

    // Auto remove after duration
    setTimeout(() => {
        const alertElement = document.getElementById(alertId);
        if (alertElement) {
            alertElement.remove();
        }
    }, duration);
}

function getAlertIcon(type) {
    const icons = {
        success: 'check-circle',
        danger: 'exclamation-triangle',
        warning: 'exclamation-circle',
        info: 'info-circle'
    };
    return icons[type] || 'info-circle';
}

// Navigation Functions
function setActiveNavItem(activeItemId) {
    document.querySelectorAll('.nav-link-premium').forEach(item => {
        item.classList.remove('active');
    });
    
    if (activeItemId) {
        const itemToActivate = document.getElementById(activeItemId);
        if (itemToActivate) {
            itemToActivate.classList.add('active');
        }
    }
}

function renderNavigation() {
    const isAdmin = userRole === 'admin';
    
    return `
        <nav class="navbar navbar-premium">
            <div class="navbar-container">
                <!-- Logo Section - Lado Esquerdo -->
                <div class="navbar-brand-section">
                    <a class="navbar-brand-premium" href="#" id="nav-logo">
                        <i class="fas fa-building"></i>
                        <span>Condomínio Elite</span>
                    </a>
                </div>

                <!-- Mobile Toggle Button -->
                <button class="navbar-toggler custom-menu-toggle" type="button" aria-expanded="false">
                    <span class="navbar-toggler-icon"></span>
                </button>

                <!-- Navigation Center - Menu Centralizado -->
                <div class="custom-navbar-collapse" id="customNavbarCollapse">
                    <ul class="navbar-nav-center">
                        <li class="nav-item">
                            <a class="nav-link-premium" href="#" id="nav-dashboard">
                                <i class="fas fa-tachometer-alt me-2"></i>Dashboard
                            </a>
                        </li>
                        <li class="nav-item">
                            <a class="nav-link-premium" href="#" id="nav-packages">
                                <i class="fas fa-box me-2"></i>Encomendas
                            </a>
                        </li>
                        <li class="nav-item">
                            <a class="nav-link-premium" href="#" id="nav-reservations">
                                <i class="fas fa-calendar-alt me-2"></i>Reservas
                            </a>
                        </li>
                        <li class="nav-item">
                            <a class="nav-link-premium" href="#" id="nav-visitors">
                                <i class="fas fa-users me-2"></i>Visitantes
                            </a>
                        </li>
                        <li class="nav-item">
                            <a class="nav-link-premium" href="#" id="nav-incidents">
                                <i class="fas fa-exclamation-triangle me-2"></i>Ocorrências
                            </a>
                        </li>
                        <li class="nav-item">
                            <a class="nav-link-premium" href="#" id="nav-notices">
                                <i class="fas fa-bullhorn me-2"></i>Avisos
                            </a>
                        </li>
                        <li class="nav-item">
                            <a class="nav-link-premium" href="#" id="nav-lost-found">
                                <i class="fas fa-search-location me-2"></i>Achados e Perdidos
                            </a>
                        </li>
                        ${isAdmin ? `
                        <li class="nav-item">
                            <a class="nav-link-premium" href="#" id="nav-admin">
                                <i class="fas fa-cogs me-2"></i>Administração
                            </a>
                        </li>
                        ` : ''}
                    </ul>
                </div>

                <!-- Right Section - Lado Direito -->
                <div class="navbar-right">
                    <!-- Notification Bell -->
                    <a class="nav-link-premium notification-bell" href="#" id="nav-notifications">
                        <i class="fas fa-bell"></i>
                        <span class="notification-dot"></span>
                    </a>

                    <!-- User Dropdown -->
                    <div class="nav-item dropdown user-dropdown">
                        <a class="nav-link-premium dropdown-toggle" href="#" role="button" 
                           data-bs-toggle="dropdown" aria-expanded="false">
                            <i class="fas fa-user-circle me-2"></i>
                            <span>${currentUser.email.split('@')[0]}</span>
                        </a>
                        <ul class="dropdown-menu dropdown-menu-end">
                            <li>
                                <span class="dropdown-item-text">
                                    <small class="text-muted">Logado como</small><br>
                                    <strong>${currentUser.email}</strong>
                                </span>
                            </li>
                            <li><hr class="dropdown-divider"></li>
                            <li>
                                <span class="dropdown-item-text">
                                    <span class="badge ${isAdmin ? 'bg-danger' : 'bg-primary'}">
                                        ${isAdmin ? 'Administrador' : 'Morador'}
                                    </span>
                                </span>
                            </li>
                            <li><hr class="dropdown-divider"></li>
                            <li>
                                <a class="dropdown-item" href="#" id="nav-user-profile">
                                    <i class="fas fa-user me-2"></i>Meu Perfil
                                </a>
                            </li>
                            <li>
                                <a class="dropdown-item" href="#" id="nav-settings">
                                    <i class="fas fa-cog me-2"></i>Configurações
                                </a>
                            </li>
                            <li><hr class="dropdown-divider"></li>
                            <li>
                                <a class="dropdown-item text-danger" href="#" id="nav-logout">
                                    <i class="fas fa-sign-out-alt me-2"></i>Sair
                                </a>
                            </li>
                        </ul>
                    </div>
                </div>
            </div>
        </nav>
    `;
}

// Placeholder Functions
function markNoticesAsRead() {
    // Implementar lógica de marcar notificações como lidas
    console.log('Notificações marcadas como lidas');
    showAlert('Notificações marcadas como lidas', 'success');
}

function showUserProfile() {
    showAlert('Funcionalidade de perfil do usuário em desenvolvimento.', 'info');
}

function showSettings() {
    showAlert('Funcionalidade de configurações em desenvolvimento.', 'info');
}

function toggleTheme() {
    const body = document.body;
    body.classList.toggle('dark-mode');
    
    // Salvar preferência do usuário
    if (body.classList.contains('dark-mode')) {
        localStorage.setItem('theme', 'dark');
        showAlert('Tema escuro ativado', 'info');
    } else {
        localStorage.setItem('theme', 'light');
        showAlert('Tema claro ativado', 'info');
    }
}

// Initialize navigation active state
function initNavigation() {
    // Set dashboard as active by default
    setActiveNavItem('nav-dashboard');
}

// Função para inicializar ouvintes de eventos globais, como o menu hambúrguer
function initGlobalEventListeners() {
    // Lógica de alternância do menu hambúrguer personalizado
    const customMenuToggler = document.querySelector('.custom-menu-toggle');
    const customNavbarCollapse = document.getElementById('customNavbarCollapse');

    if (customMenuToggler && customNavbarCollapse) {
        customMenuToggler.addEventListener('click', (e) => {
            e.preventDefault(); // Prevenir comportamento padrão
            customNavbarCollapse.classList.toggle('show');
            const isExpanded = customNavbarCollapse.classList.contains('show');
            customMenuToggler.setAttribute('aria-expanded', isExpanded);
        });
    }
}

function sanitizeHTML(str) {
    const temp = document.createElement('div');
    temp.textContent = str;
    return temp.innerHTML;
}

// Export all functions
export { 
    showLoadingScreen, 
    hideLoadingScreen, 
    showAlert, 
    getAlertIcon, 
    setActiveNavItem, 
    renderNavigation, 
    markNoticesAsRead, 
    showUserProfile, 
    showSettings,
    toggleTheme,
    initNavigation,
    initGlobalEventListeners,
    cleanup,
    chartInstances,
    firestoreListeners,
    sanitizeHTML
};