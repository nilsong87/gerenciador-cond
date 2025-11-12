import { showAlert, showFeatureNotImplementedModal } from './ui.js';
import { userRole, logout, currentUser } from './auth.js';
import { renderDashboard } from './dashboard.js';
import { renderPackages } from './packages.js';
import { renderReservations } from './reservations.js';
import { renderVisitors } from './visitors.js';
import { renderIncidents } from './incidents.js';
import { renderNotices } from './notices.js';
import { renderLostAndFound } from './lostAndFound.js';
import { renderAdmin } from './admin.js';

const pageRenderers = {
    'nav-dashboard': renderDashboard,
    'nav-packages': renderPackages,
    'nav-reservations': renderReservations,
    'nav-visitors': renderVisitors,
    'nav-incidents': renderIncidents,
    'nav-notices': renderNotices,
    'nav-lost-found': renderLostAndFound,
    'nav-admin': renderAdmin,
    'nav-logo': renderDashboard,
};

function handleNavigationClick(e) {
    e.preventDefault();
    const targetId = e.currentTarget.id;

    closeMobileMenu();
    setActiveNavItem(targetId);

    const renderer = pageRenderers[targetId];
    if (renderer) {
        if (targetId === 'nav-admin' && userRole !== 'admin') {
            showAlert('Acesso restrito aos administradores', 'warning');
            renderDashboard();
        } else {
            renderer();
        }
    } else {
        console.warn(`No renderer found for navigation item: ${targetId}`);
    }
}

function handleUserNavigationClick(e) {
    e.preventDefault();
    const targetId = e.currentTarget.id;

    switch (targetId) {
        case 'nav-user-profile':
            showFeatureNotImplementedModal();
            break;
        case 'nav-settings':
            showFeatureNotImplementedModal();
            break;
        case 'nav-logout':
            logout();
            break;
        case 'nav-notifications':
            showFeatureNotImplementedModal();
            break;
        default:
            console.warn(`Unknown user navigation item: ${targetId}`);
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
                <div class="navbar-center custom-navbar-collapse" id="customNavbarCollapse">
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

export function initRouter() {
    document.body.addEventListener('click', (e) => {
        // Delegated listener for main navigation links
        const navLink = e.target.closest('.nav-link-premium, .navbar-brand-premium');
        if (navLink && pageRenderers[navLink.id]) {
            handleNavigationClick({ preventDefault: () => {}, currentTarget: navLink });
            return; // Stop further processing
        }

        // Delegated listener for user-related navigation
        const userNavLink = e.target.closest('.dropdown-item, .notification-bell');
        if (userNavLink && (userNavLink.id.startsWith('nav-') || userNavLink.classList.contains('notification-bell'))) {
             handleUserNavigationClick({ preventDefault: () => {}, currentTarget: userNavLink });
             return; // Stop further processing
        }

        // Delegated listener for the hamburger menu toggle
        const customMenuToggler = e.target.closest('.custom-menu-toggle');
        if (customMenuToggler) {
            e.preventDefault();
            e.stopPropagation();
            const customNavbarCollapse = document.getElementById('customNavbarCollapse');
            if (customNavbarCollapse) {
                customNavbarCollapse.classList.toggle('show');
                const isExpanded = customNavbarCollapse.classList.contains('show');
                customMenuToggler.setAttribute('aria-expanded', isExpanded);
            }
            return; // Stop further processing
        }

        // Close menu if clicking outside
        const customNavbarCollapse = document.getElementById('customNavbarCollapse');
        const isClickInsideMenu = customNavbarCollapse && customNavbarCollapse.contains(e.target);
        const isToggler = e.target.closest('.custom-menu-toggle');

        if (customNavbarCollapse && customNavbarCollapse.classList.contains('show') && !isClickInsideMenu && !isToggler) {
            closeMobileMenu();
        }
    });

    window.addEventListener('resize', () => {
        if (window.innerWidth > 768) { // Corresponds to Bootstrap's 'md' breakpoint
            closeMobileMenu();
        }
    });

    renderDashboard(); 
}

export { renderNavigation, setActiveNavItem };