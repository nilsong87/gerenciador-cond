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

export function initAppEventListeners() {
    // Navigation links
    const navLogo = document.getElementById('nav-logo');
    if (navLogo) {
        navLogo.addEventListener('click', (e) => { e.preventDefault(); renderDashboard(); setActiveNavItem('nav-dashboard'); });
    }

    const navDashboard = document.getElementById('nav-dashboard');
    if (navDashboard) {
        navDashboard.addEventListener('click', (e) => { e.preventDefault(); renderDashboard(); setActiveNavItem('nav-dashboard'); });
    }

    const navPackages = document.getElementById('nav-packages');
    if (navPackages) {
        navPackages.addEventListener('click', (e) => { e.preventDefault(); renderPackages(); setActiveNavItem('nav-packages'); });
    }

    const navReservations = document.getElementById('nav-reservations');
    if (navReservations) {
        navReservations.addEventListener('click', (e) => { e.preventDefault(); renderReservations(); setActiveNavItem('nav-reservations'); });
    }

    const navVisitors = document.getElementById('nav-visitors');
    if (navVisitors) {
        navVisitors.addEventListener('click', (e) => { e.preventDefault(); renderVisitors(); setActiveNavItem('nav-visitors'); });
    }

    const navIncidents = document.getElementById('nav-incidents');
    if (navIncidents) {
        navIncidents.addEventListener('click', (e) => { e.preventDefault(); renderIncidents(); setActiveNavItem('nav-incidents'); });
    }

    const navNotices = document.getElementById('nav-notices');
    if (navNotices) {
        navNotices.addEventListener('click', (e) => { e.preventDefault(); renderNotices(); setActiveNavItem('nav-notices'); });
    }

    const navLostFound = document.getElementById('nav-lost-found');
    if (navLostFound) {
        navLostFound.addEventListener('click', (e) => { e.preventDefault(); renderLostAndFound(); setActiveNavItem('nav-lost-found'); });
    }
    
    const navAdmin = document.getElementById('nav-admin');
    if (navAdmin) {
        navAdmin.addEventListener('click', (e) => { e.preventDefault(); renderAdmin(); setActiveNavItem('nav-admin'); });
    }

    // User dropdown
    const navNotifications = document.getElementById('nav-notifications');
    if (navNotifications) {
        navNotifications.addEventListener('click', (e) => { e.preventDefault(); markNoticesAsRead(); renderNotices(); });
    }

    const navUserProfile = document.getElementById('nav-user-profile');
    if (navUserProfile) {
        navUserProfile.addEventListener('click', (e) => { e.preventDefault(); showUserProfile(); });
    }

    const navSettings = document.getElementById('nav-settings');
    if (navSettings) {
        navSettings.addEventListener('click', (e) => { e.preventDefault(); showSettings(); });
    }

    const navLogout = document.getElementById('nav-logout');
    if (navLogout) {
        navLogout.addEventListener('click', (e) => { e.preventDefault(); logout(); });
    }
}

// No more global exposure of functions
// Removed window.function = function; lines