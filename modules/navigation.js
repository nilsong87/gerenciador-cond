// navigation.js
import { showAlert } from './ui.js';
import { userRole, currentUser } from './auth.js';
import { renderDashboard } from './dashboard.js';
import { renderPackages } from './packages.js';
import { renderReservations } from './reservations.js';
import { renderVisitors } from './visitors.js';
import { renderIncidents } from './incidents.js';
import { renderNotices } from './notices.js';
import { renderLostAndFound } from './lostAndFound.js';
import { renderAdmin } from './admin.js';

// Navigation event handlers
function handleNavigationClick(itemId) {
    console.log('Navigation clicked:', itemId);
    
    // Close mobile menu when a link is clicked
    closeMobileMenu();
    
    // Handle specific navigation actions
    switch (itemId) {
        case 'nav-dashboard':
            renderDashboard();
            break;
        case 'nav-packages':
            renderPackages();
            break;
        case 'nav-reservations':
            renderReservations();
            break;
        case 'nav-visitors':
            renderVisitors();
            break;
        case 'nav-incidents':
            renderIncidents();
            break;
        case 'nav-notices':
            renderNotices();
            break;
        case 'nav-lost-found':
            renderLostAndFound();
            break;
        case 'nav-admin':
            if (userRole === 'admin') {
                renderAdmin();
            } else {
                showAlert('Acesso restrito aos administradores', 'warning');
                renderDashboard();
            }
            break;
        case 'nav-notifications':
            showNotifications();
            break;
        case 'nav-logo':
            renderDashboard();
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

// Placeholder functions for user navigation
function showUserProfile() {
    showAlert('Funcionalidade de perfil do usuário em desenvolvimento.', 'info');
}

function showSettings() {
    showAlert('Funcionalidade de configurações em desenvolvimento.', 'info');
}

function showNotifications() {
    showAlert('Funcionalidade de notificações em desenvolvimento.', 'info');
}

function handleLogout() {
    if (confirm('Tem certeza que deseja sair?')) {
        showAlert('Saindo do sistema...', 'info');
        // This will be handled by the auth.js logout function
        // The actual logout logic is in auth.js
        window.logout();
    }
}

// Setup navigation event listeners
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

// Initialize navigation
function initNavigation() {
    setupNavigationHandlers();
    console.log('Navigation initialized');
}

export {
    handleNavigationClick,
    handleUserNavigationClick,
    closeMobileMenu,
    showUserProfile,
    showSettings,
    showNotifications,
    handleLogout,
    setupNavigationHandlers,
    initNavigation
};