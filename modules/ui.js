import { renderUserSettings } from './settings.js';
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
    if (loadingScreen) {
        loadingScreen.style.display = 'flex';
        loadingScreen.style.opacity = '1';
    }
}

function hideLoadingScreen() {
    const loadingScreen = document.getElementById('loading-screen');
    if (loadingScreen) {
        loadingScreen.style.opacity = '0';
        setTimeout(() => {
            loadingScreen.style.display = 'none';
        }, 500);
    }
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

function renderNavigation(userRole, currentUser) {
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

// Navigation Event Handlers
function setupNavigationHandlers() {
    // Main navigation items
    const navItems = [
        'nav-dashboard', 'nav-packages', 'nav-reservations', 'nav-visitors',
        'nav-incidents', 'nav-notices', 'nav-lost-found', 'nav-admin',
        'nav-logo', 'nav-notifications'
    ];

    navItems.forEach(itemId => {
        const element = document.getElementById(itemId);
        if (element) {
            // Remove existing listeners to avoid duplicates
            element.replaceWith(element.cloneNode(true));
            const newElement = document.getElementById(itemId);
            
            newElement.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                handleNavigationClick(itemId);
            });
        }
    });

    // User dropdown items
    const userNavItems = ['nav-user-profile', 'nav-settings', 'nav-logout'];
    userNavItems.forEach(itemId => {
        const element = document.getElementById(itemId);
        if (element) {
            // Remove existing listeners to avoid duplicates
            element.replaceWith(element.cloneNode(true));
            const newElement = document.getElementById(itemId);
            
            newElement.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                handleUserNavigationClick(itemId);
            });
        }
    });

    console.log('Navigation handlers setup completed');
}

function handleNavigationClick(itemId) {
    console.log('Navigation clicked:', itemId);
    
    // Close mobile menu when a link is clicked
    closeMobileMenu();
    
    // Set active navigation item
    setActiveNavItem(itemId);
    
    // Handle specific navigation actions
    switch (itemId) {
        case 'nav-dashboard':
            showDashboard();
            break;
        case 'nav-packages':
            showPackages();
            break;
        case 'nav-reservations':
            showReservations();
            break;
        case 'nav-visitors':
            showVisitors();
            break;
        case 'nav-incidents':
            showIncidents();
            break;
        case 'nav-notices':
            showNotices();
            break;
        case 'nav-lost-found':
            showLostFound();
            break;
        case 'nav-admin':
            showAdmin();
            break;
        case 'nav-notifications':
            showNotifications();
            break;
        case 'nav-logo':
            showDashboard(); // Logo goes to dashboard
            break;
        default:
            console.log('Navigation item clicked:', itemId);
            showAlert(`Navegando para: ${itemId.replace('nav-', '')}`, 'info');
    }
}

function handleUserNavigationClick(itemId) {
    console.log('User navigation clicked:', itemId);
    
    switch (itemId) {
        case 'nav-user-profile':
            showUserProfile();
            break;
        case 'nav-settings':
            showSettings();
            break;
        case 'nav-logout':
            handleLogout();
            break;
        default:
            console.log('User navigation item clicked:', itemId);
    }
}

function closeMobileMenu() {
    const customNavbarCollapse = document.getElementById('customNavbarCollapse');
    const customMenuToggler = document.querySelector('.custom-menu-toggle');
    
    if (customNavbarCollapse && customNavbarCollapse.classList.contains('show')) {
        customNavbarCollapse.classList.remove('show');
        if (customMenuToggler) {
            customMenuToggler.setAttribute('aria-expanded', 'false');
        }
    }
}

// Placeholder Functions for navigation
function showDashboard() {
    showAlert('Dashboard carregado', 'success');
    // Implementar carregamento do dashboard
    loadDashboardContent();
}

function showPackages() {
    showAlert('Encomendas carregadas', 'success');
    // Implementar carregamento de encomendas
    loadPackagesContent();
}

function showReservations() {
    showAlert('Reservas carregadas', 'success');
    // Implementar carregamento de reservas
    loadReservationsContent();
}

function showVisitors() {
    showAlert('Visitantes carregados', 'success');
    // Implementar carregamento de visitantes
    loadVisitorsContent();
}

function showIncidents() {
    showAlert('Ocorrências carregadas', 'success');
    // Implementar carregamento de ocorrências
    loadIncidentsContent();
}

function showNotices() {
    showAlert('Avisos carregados', 'success');
    // Implementar carregamento de avisos
    loadNoticesContent();
}

function showLostFound() {
    showAlert('Achados e Perdidos carregados', 'success');
    // Implementar carregamento de achados e perdidos
    loadLostFoundContent();
}

function showAdmin() {
    showAlert('Administração carregada', 'success');
    // Implementar carregamento da administração
    loadAdminContent();
}

function showNotifications() {
    showAlert('Notificações carregadas', 'success');
    markNoticesAsRead();
    // Implementar carregamento de notificações
    loadNotificationsContent();
}

function handleLogout() {
    if (confirm('Tem certeza que deseja sair?')) {
        showAlert('Saindo do sistema...', 'info');
        // Implementar lógica de logout
        cleanup();
        // Redirecionar para página de login
        setTimeout(() => {
            window.location.href = 'login.html';
        }, 1000);
    }
}

// Content loading placeholder functions
function loadDashboardContent() {
    const mainContent = document.getElementById('main-content');
    if (mainContent) {
        mainContent.innerHTML = `
            <div class="container-fluid">
                <div class="row">
                    <div class="col-12">
                        <div class="card premium-card">
                            <div class="card-header">
                                <h3><i class="fas fa-tachometer-alt me-2"></i>Dashboard</h3>
                            </div>
                            <div class="card-body">
                                <p>Conteúdo do Dashboard será carregado aqui...</p>
                                <div class="row">
                                    <div class="col-md-3">
                                        <div class="stat-card">
                                            <i class="fas fa-box"></i>
                                            <h4>Encomendas</h4>
                                            <span class="stat-number">12</span>
                                        </div>
                                    </div>
                                    <div class="col-md-3">
                                        <div class="stat-card">
                                            <i class="fas fa-calendar-alt"></i>
                                            <h4>Reservas</h4>
                                            <span class="stat-number">5</span>
                                        </div>
                                    </div>
                                    <div class="col-md-3">
                                        <div class="stat-card">
                                            <i class="fas fa-users"></i>
                                            <h4>Visitantes</h4>
                                            <span class="stat-number">8</span>
                                        </div>
                                    </div>
                                    <div class="col-md-3">
                                        <div class="stat-card">
                                            <i class="fas fa-exclamation-triangle"></i>
                                            <h4>Ocorrências</h4>
                                            <span class="stat-number">2</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }
}

function loadPackagesContent() {
    const mainContent = document.getElementById('main-content');
    if (mainContent) {
        mainContent.innerHTML = `
            <div class="container-fluid">
                <div class="row">
                    <div class="col-12">
                        <div class="card premium-card">
                            <div class="card-header">
                                <h3><i class="fas fa-box me-2"></i>Encomendas</h3>
                            </div>
                            <div class="card-body">
                                <p>Conteúdo de Encomendas será carregado aqui...</p>
                                <button class="btn btn-primary">
                                    <i class="fas fa-plus me-2"></i>Nova Encomenda
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }
}

function loadReservationsContent() {
    const mainContent = document.getElementById('main-content');
    if (mainContent) {
        mainContent.innerHTML = `
            <div class="container-fluid">
                <div class="row">
                    <div class="col-12">
                        <div class="card premium-card">
                            <div class="card-header">
                                <h3><i class="fas fa-calendar-alt me-2"></i>Reservas</h3>
                            </div>
                            <div class="card-body">
                                <p>Conteúdo de Reservas será carregado aqui...</p>
                                <button class="btn btn-primary">
                                    <i class="fas fa-plus me-2"></i>Nova Reserva
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }
}

function loadVisitorsContent() {
    const mainContent = document.getElementById('main-content');
    if (mainContent) {
        mainContent.innerHTML = `
            <div class="container-fluid">
                <div class="row">
                    <div class="col-12">
                        <div class="card premium-card">
                            <div class="card-header">
                                <h3><i class="fas fa-users me-2"></i>Visitantes</h3>
                            </div>
                            <div class="card-body">
                                <p>Conteúdo de Visitantes será carregado aqui...</p>
                                <button class="btn btn-primary">
                                    <i class="fas fa-plus me-2"></i>Registrar Visitante
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }
}

function loadIncidentsContent() {
    const mainContent = document.getElementById('main-content');
    if (mainContent) {
        mainContent.innerHTML = `
            <div class="container-fluid">
                <div class="row">
                    <div class="col-12">
                        <div class="card premium-card">
                            <div class="card-header">
                                <h3><i class="fas fa-exclamation-triangle me-2"></i>Ocorrências</h3>
                            </div>
                            <div class="card-body">
                                <p>Conteúdo de Ocorrências será carregado aqui...</p>
                                <button class="btn btn-primary">
                                    <i class="fas fa-plus me-2"></i>Nova Ocorrência
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }
}

function loadNoticesContent() {
    const mainContent = document.getElementById('main-content');
    if (mainContent) {
        mainContent.innerHTML = `
            <div class="container-fluid">
                <div class="row">
                    <div class="col-12">
                        <div class="card premium-card">
                            <div class="card-header">
                                <h3><i class="fas fa-bullhorn me-2"></i>Avisos</h3>
                            </div>
                            <div class="card-body">
                                <p>Conteúdo de Avisos será carregado aqui...</p>
                                <button class="btn btn-primary">
                                    <i class="fas fa-plus me-2"></i>Novo Aviso
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }
}

function loadLostFoundContent() {
    const mainContent = document.getElementById('main-content');
    if (mainContent) {
        mainContent.innerHTML = `
            <div class="container-fluid">
                <div class="row">
                    <div class="col-12">
                        <div class="card premium-card">
                            <div class="card-header">
                                <h3><i class="fas fa-search-location me-2"></i>Achados e Perdidos</h3>
                            </div>
                            <div class="card-body">
                                <p>Conteúdo de Achados e Perdidos será carregado aqui...</p>
                                <button class="btn btn-primary">
                                    <i class="fas fa-plus me-2"></i>Novo Item
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }
}

function loadAdminContent() {
    const mainContent = document.getElementById('main-content');
    if (mainContent) {
        mainContent.innerHTML = `
            <div class="container-fluid">
                <div class="row">
                    <div class="col-12">
                        <div class="card premium-card">
                            <div class="card-header">
                                <h3><i class="fas fa-cogs me-2"></i>Administração</h3>
                            </div>
                            <div class="card-body">
                                <p>Conteúdo de Administração será carregado aqui...</p>
                                <div class="row">
                                    <div class="col-md-4 mb-3">
                                        <button class="btn btn-admin w-100">
                                            <i class="fas fa-users-cog me-2"></i>Gerenciar Usuários
                                        </button>
                                    </div>
                                    <div class="col-md-4 mb-3">
                                        <button class="btn btn-admin w-100">
                                            <i class="fas fa-chart-bar me-2"></i>Relatórios
                                        </button>
                                    </div>
                                    <div class="col-md-4 mb-3">
                                        <button class="btn btn-admin w-100">
                                            <i class="fas fa-cog me-2"></i>Configurações
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }
}

function loadNotificationsContent() {
    const mainContent = document.getElementById('main-content');
    if (mainContent) {
        mainContent.innerHTML = `
            <div class="container-fluid">
                <div class="row">
                    <div class="col-12">
                        <div class="card premium-card">
                            <div class="card-header">
                                <h3><i class="fas fa-bell me-2"></i>Notificações</h3>
                            </div>
                            <div class="card-body">
                                <p>Conteúdo de Notificações será carregado aqui...</p>
                                <div class="list-group">
                                    <div class="list-group-item">
                                        <i class="fas fa-box text-primary me-2"></i>
                                        Nova encomenda chegou
                                        <small class="text-muted ms-2">Há 2 horas</small>
                                    </div>
                                    <div class="list-group-item">
                                        <i class="fas fa-calendar-alt text-success me-2"></i>
                                        Reserva confirmada
                                        <small class="text-muted ms-2">Há 1 dia</small>
                                    </div>
                                    <div class="list-group-item">
                                        <i class="fas fa-exclamation-triangle text-warning me-2"></i>
                                        Nova ocorrência reportada
                                        <small class="text-muted ms-2">Há 2 dias</small>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }
}

function markNoticesAsRead() {
    console.log('Notificações marcadas como lidas');
    showAlert('Notificações marcadas como lidas', 'success');
}

function showUserProfile() {
    showAlert('Funcionalidade de perfil do usuário em desenvolvimento.', 'info');
}

function showSettings() {
    renderUserSettings();
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
    
    // Setup navigation handlers
    setupNavigationHandlers();
    
    // Load dashboard content by default
    showDashboard();
    
    console.log('Navigation initialized');
}

// Função para inicializar ouvintes de eventos globais
function initGlobalEventListeners() {
    // Lógica de alternância do menu hambúrguer personalizado
    const customMenuToggler = document.querySelector('.custom-menu-toggle');
    const customNavbarCollapse = document.getElementById('customNavbarCollapse');

    if (customMenuToggler && customNavbarCollapse) {
        customMenuToggler.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            customNavbarCollapse.classList.toggle('show');
            const isExpanded = customNavbarCollapse.classList.contains('show');
            customMenuToggler.setAttribute('aria-expanded', isExpanded);
        });
    }

    // Close menu when clicking outside
    document.addEventListener('click', (e) => {
        const customNavbarCollapse = document.getElementById('customNavbarCollapse');
        const customMenuToggler = document.querySelector('.custom-menu-toggle');
        
        if (customNavbarCollapse && customMenuToggler && 
            !customNavbarCollapse.contains(e.target) && 
            !customMenuToggler.contains(e.target) &&
            customNavbarCollapse.classList.contains('show')) {
            closeMobileMenu();
        }
    });

    // Close menu on window resize (if needed)
    window.addEventListener('resize', () => {
        if (window.innerWidth > 768) {
            closeMobileMenu();
        }
    });

    console.log('Global event listeners initialized');
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
    sanitizeHTML,
    setupNavigationHandlers,
    handleNavigationClick,
    handleUserNavigationClick,
    closeMobileMenu,
    showDashboard,
    showPackages,
    showReservations,
    showVisitors,
    showIncidents,
    showNotices,
    showLostFound,
    showAdmin,
    showNotifications,
    handleLogout
};