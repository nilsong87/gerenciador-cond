import { initPremiumApp, login, logout } from './modules/auth.js';
import { renderDashboard, refreshDashboard, generateReport } from './modules/dashboard.js';
import { renderPackages, exportPackagesData, clearPackageForm, addPackage, filterPackages, deliverPackage, deletePackage } from './modules/packages.js';
import { renderReservations, showReservationCalendar, clearReservationForm, addReservation, filterReservations, deleteReservation } from './modules/reservations.js';
import { renderVisitors, addVisitor, deleteVisitor } from './modules/visitors.js';
import { renderIncidents, addIncident, updateIncidentStatus, deleteIncident } from './modules/incidents.js';
import { renderAdmin, generateSystemReport, showSystemSettings, showUserRegistration, showFinancialPanel, showBackupPanel, showAnalyticsPanel } from './modules/admin.js';
import { renderNotices, addNotice } from './modules/notices.js';
import { renderLostAndFound, addItem } from './modules/lostAndFound.js';
import { markNoticesAsRead, showUserProfile, showSettings, renderNavigation, setActiveNavItem, showAlert, toggleTheme } from './modules/ui.js';

document.addEventListener('DOMContentLoaded', function() {
    // Carregar tema salvo
    if (localStorage.getItem('theme') === 'dark') {
        document.body.classList.add('dark-mode');
    }
    initPremiumApp();
});

function initAppEventListeners() {
    // Navigation links
    document.getElementById('nav-logo').addEventListener('click', (e) => { e.preventDefault(); renderDashboard(); setActiveNavItem('nav-dashboard'); });
    document.getElementById('nav-dashboard').addEventListener('click', (e) => { e.preventDefault(); renderDashboard(); setActiveNavItem('nav-dashboard'); });
    document.getElementById('nav-packages').addEventListener('click', (e) => { e.preventDefault(); renderPackages(); setActiveNavItem('nav-packages'); });
    document.getElementById('nav-reservations').addEventListener('click', (e) => { e.preventDefault(); renderReservations(); setActiveNavItem('nav-reservations'); });
    document.getElementById('nav-visitors').addEventListener('click', (e) => { e.preventDefault(); renderVisitors(); setActiveNavItem('nav-visitors'); });
    document.getElementById('nav-incidents').addEventListener('click', (e) => { e.preventDefault(); renderIncidents(); setActiveNavItem('nav-incidents'); });
    document.getElementById('nav-notices').addEventListener('click', (e) => { e.preventDefault(); renderNotices(); setActiveNavItem('nav-notices'); });
    document.getElementById('nav-lost-found').addEventListener('click', (e) => { e.preventDefault(); renderLostAndFound(); setActiveNavItem('nav-lost-found'); });
    
    const navAdmin = document.getElementById('nav-admin');
    if (navAdmin) {
        navAdmin.addEventListener('click', (e) => { e.preventDefault(); renderAdmin(); setActiveNavItem('nav-admin'); });
    }

    // User dropdown
    document.getElementById('nav-notifications').addEventListener('click', (e) => { e.preventDefault(); markNoticesAsRead(); renderNotices(); });
    document.getElementById('nav-user-profile').addEventListener('click', (e) => { e.preventDefault(); showUserProfile(); });
    document.getElementById('nav-settings').addEventListener('click', (e) => { e.preventDefault(); showSettings(); });
    document.getElementById('nav-logout').addEventListener('click', (e) => { e.preventDefault(); logout(); });
}

// No more global exposure of functions
// Removed window.function = function; lines