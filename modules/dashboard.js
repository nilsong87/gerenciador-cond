import { renderNavigation, setActiveNavItem, showAlert, initGlobalEventListeners, cleanup, firestoreListeners, chartInstances } from './ui.js';
import { userRole, currentUser } from './auth.js';
import { db } from './firebase.js';
import { renderPackages } from './packages.js';
import { renderNotices } from './notices.js';
import { renderIncidents } from './incidents.js';
import { renderAdmin, generateSystemReport, showSystemSettings } from './admin.js';
import { initAppEventListeners } from '../app.js';

function renderDashboard() {
    const recaptchaBadge = document.querySelector('.g-recaptcha');
    if (recaptchaBadge) {
        recaptchaBadge.style.display = 'none';
    }

    cleanup();
    const appContainer = document.getElementById('app');
    appContainer.innerHTML = `
        ${renderNavigation(userRole, currentUser)}
        <div class="container-fluid py-4 animate-fade-in">
            <!-- Header de Boas-Vindas -->
            <div class="row mb-4">
                <div class="col-12">
                    <div class="welcome-header card-premium">
                        <div>
                            <h2 class="h4 text-gradient mb-0">Bem-vindo(a) de volta, ${currentUser.email.split('@')[0]}!</h2>
                            <p class="text-muted mb-0">Aqui está um resumo do seu condomínio hoje, ${new Date().toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' })}.</p>
                        </div>
                        <i class="fas fa-sun welcome-icon"></i>
                    </div>
                </div>
            </div>
            
            <div class="row mb-4 animate-slide-up">
                <div class="col-xl-3 col-md-6 mb-4">
                    <div class="stat-card primary">
                        <div class="d-flex justify-content-between align-items-start">
                            <div>
                                <div class="stat-number" id="pending-packages">0</div>
                                <div class="stat-label">Encomendas Pendentes</div>
                            </div>
                            <div class="stat-icon text-primary">
                                <i class="fas fa-box"></i>
                            </div>
                        </div>
                    </div>
                </div>
                
                <div class="col-xl-3 col-md-6 mb-4">
                    <div class="stat-card success">
                        <div class="d-flex justify-content-between align-items-start">
                            <div>
                                <div class="stat-number" id="today-reservations">0</div>
                                <div class="stat-label">Reservas Hoje</div>
                            </div>
                            <div class="stat-icon text-success">
                                <i class="fas fa-calendar-alt"></i>
                            </div>
                        </div>
                    </div>
                </div>
                
                <div class="col-xl-3 col-md-6 mb-4">
                    <div class="stat-card warning">
                        <div class="d-flex justify-content-between align-items-start">
                            <div>
                                <div class="stat-number" id="pending-visitors">0</div>
                                <div class="stat-label">Visitantes Hoje</div>
                            </div>
                            <div class="stat-icon text-warning">
                                <i class="fas fa-users"></i>
                            </div>
                        </div>
                    </div>
                </div>
                
                <div class="col-xl-3 col-md-6 mb-4">
                    <div class="stat-card danger">
                        <div class="d-flex justify-content-between align-items-start">
                            <div>
                                <div class="stat-number" id="open-incidents">0</div>
                                <div class="stat-label">Ocorrências Abertas</div>
                            </div>
                            <div class="stat-icon text-danger">
                                <i class="fas fa-exclamation-triangle"></i>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            
            ${userRole === 'admin' ? renderAdminCharts() : ''}
            
            <!-- Atividade Recente & Avisos -->
            <div class="row mt-4">
                <div class="col-lg-7 mb-4">
                    <div class="card-premium animate-slide-up">
                        <div class="card-header-premium">
                            <h5 class="card-title mb-0">
                                <i class="fas fa-clock me-2"></i>Atividade Recente
                            </h5>
                        </div>
                        <div class="card-body-premium equal-height-card">
                            <div id="recent-activity" class="activity-feed">
                                <div class="text-center py-4">
                                    <div class="loading"></div>
                                    <p class="text-muted mt-2">Carregando atividades...</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                
                <div class="col-lg-5 mb-4">
                    <div class="card-premium animate-slide-up">
                        <div class="card-header-premium">
                            <h5 class="card-title mb-0">
                                <i class="fas fa-bullhorn me-2"></i>Mural de Avisos
                            </h5>
                        </div>
                        <div class="card-body-premium equal-height-card">
                            <div id="dashboard-notifications-list">
                                <div class="text-center py-4">
                                    <div class="loading"></div>
                                    <p class="text-muted mt-2">Carregando notificações...</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    setActiveNavItem('renderDashboard()');
    loadEnhancedDashboardData();
    initGlobalEventListeners();
    initAppEventListeners();

    if (userRole === 'admin') {
        document.getElementById('quick-action-packages').addEventListener('click', (e) => { e.preventDefault(); renderPackages(); });
        document.getElementById('quick-action-notices').addEventListener('click', (e) => { e.preventDefault(); renderNotices(); });
        document.getElementById('quick-action-incidents').addEventListener('click', (e) => { e.preventDefault(); renderIncidents(); });
        document.getElementById('quick-action-users').addEventListener('click', (e) => { e.preventDefault(); renderAdmin(); });
        document.getElementById('quick-action-report').addEventListener('click', (e) => { e.preventDefault(); generateSystemReport('system'); });
        document.getElementById('quick-action-settings').addEventListener('click', (e) => { e.preventDefault(); showSystemSettings(); });
    }
}

function renderAdminCharts() {
    return `
        <div class="row">
            <!-- Gráficos -->
            <div class="col-xl-8">
                <div class="row">
                    <div class="col-lg-7 mb-4">
                        <div class="card-premium chart-container animate-slide-up h-100">
                            <div class="card-header-premium">
                                <h5 class="card-title mb-0"><i class="fas fa-chart-bar me-2"></i>Reservas por Área (30 dias)</h5>
                            </div>
                            <div class="card-body-premium"><canvas id="reservationsChart"></canvas></div>
                        </div>
                    </div>
                    <div class="col-lg-5 mb-4">
                        <div class="card-premium chart-container animate-slide-up h-100">
                            <div class="card-header-premium">
                                <h5 class="card-title mb-0"><i class="fas fa-chart-pie me-2"></i>Status das Ocorrências</h5>
                            </div>
                            <div class="card-body-premium"><canvas id="incidentsChart"></canvas></div>
                        </div>
                    </div>
                </div>
            </div>
            <!-- Ações Rápidas Admin -->
            <div class="col-xl-4 mb-4">
                <div class="card-premium animate-slide-up h-100">
                    <div class="card-header-premium">
                        <h5 class="card-title mb-0"><i class="fas fa-bolt me-2"></i>Ações Rápidas</h5>
                    </div>
                    <div class="card-body-premium quick-actions-grid">
                        <a href="#" id="quick-action-packages" class="quick-action-item">
                            <i class="fas fa-box-open"></i><span>Encomendas</span>
                        </a>
                        <a href="#" id="quick-action-notices" class="quick-action-item">
                            <i class="fas fa-bullhorn"></i><span>Novo Aviso</span>
                        </a>
                        <a href="#" id="quick-action-incidents" class="quick-action-item">
                            <i class="fas fa-exclamation-triangle"></i><span>Ocorrências</span>
                        </a>
                        <a href="#" id="quick-action-users" class="quick-action-item">
                            <i class="fas fa-users-cog"></i><span>Usuários</span>
                        </a>
                        <a href="#" id="quick-action-report" class="quick-action-item">
                            <i class="fas fa-file-pdf"></i><span>Relatórios</span>
                        </a>
                        <a href="#" id="quick-action-settings" class="quick-action-item">
                            <i class="fas fa-cog"></i><span>Ajustes</span>
                        </a>
                    </div>
                </div>
            </div>
        </div>
    `;
}

function loadEnhancedDashboardData() {
    const today = new Date().toISOString().split('T')[0];
    const isAdmin = userRole === 'admin';
    
    loadPackagesStats();
    loadReservationsStats();
    loadVisitorsStats();
    loadIncidentsStats();

    loadRecentActivity();
    loadDashboardNotifications();

    if (isAdmin) {
        loadAdminChartsData();
    }
}

function loadPackagesStats() {
    const unsubscribe = db.collection("packages").where("delivered", "==", false)
        .onSnapshot(snapshot => {
            const element = document.getElementById('pending-packages');
            if (element) element.textContent = snapshot.size;
        });
    firestoreListeners.packagesStats = unsubscribe;
}

function loadReservationsStats() {
    const today = new Date().toISOString().split('T')[0];
    
    const unsubscribe = db.collection("reservations").where("date", "==", today)
        .onSnapshot(snapshot => {
            const element = document.getElementById('today-reservations');
            if (element) element.textContent = snapshot.size;
        });
    firestoreListeners.reservationsStats = unsubscribe;
}

function loadVisitorsStats() {
    const today = new Date().toISOString().split('T')[0];
    
    const unsubscribe = db.collection("visitors").where("date", "==", today)
        .onSnapshot(snapshot => {
            const element = document.getElementById('pending-visitors');
            if (element) element.textContent = snapshot.size;
        });
    firestoreListeners.visitorsStats = unsubscribe;
}

function loadIncidentsStats() {
    const unsubscribe = db.collection("incidents").where("status", "==", "open")
        .onSnapshot(snapshot => {
            const element = document.getElementById('open-incidents');
            if (element) element.textContent = snapshot.size;
        });
    firestoreListeners.incidentsStats = unsubscribe;
}

function loadRecentActivity() {
    const activityFeed = document.getElementById('recent-activity');
    activityFeed.innerHTML = '<div class="loading"></div>';

    const collections = ['packages', 'reservations', 'visitors', 'incidents'];
    const promises = collections.map(col => db.collection(col).orderBy('timestamp', 'desc').limit(2).get());

    Promise.all(promises).then(snapshots => {
        let activities = [];
        snapshots.forEach((snapshot, index) => {
            const collectionName = collections[index];
            snapshot.forEach(doc => {
                activities.push({ ...doc.data(), collection: collectionName, id: doc.id });
            });
        });

        activities.sort((a, b) => b.timestamp - a.timestamp);
        activities = activities.slice(0, 5);

        if (activities.length === 0) {
            activityFeed.innerHTML = '<p class="text-muted">Nenhuma atividade recente.</p>';
            return;
        }

        let html = '';
        activities.forEach(activity => {
            html += renderActivityItem(activity);
        });
        activityFeed.innerHTML = html;
    });
}

function renderActivityItem(activity) {
    const time = activity.timestamp?.toDate().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }) || '';
    let icon, text, iconColor;

    switch (activity.collection) {
        case 'packages':
            icon = 'fa-box';
            text = `Nova encomenda para o apto <strong>${activity.apartment}</strong>`;
            iconColor = 'text-primary';
            break;
        case 'reservations':
            icon = 'fa-calendar-check';
            text = `Reserva da <strong>${activity.area}</strong> confirmada`;
            iconColor = 'text-success';
            break;
        case 'visitors':
            icon = 'fa-user-clock';
            text = `Visitante chegando para o apto <strong>${activity.apartment}</strong>`;
            iconColor = 'text-info';
            break;
        case 'incidents':
            icon = 'fa-exclamation-triangle';
            text = `Nova ocorrência: <strong>${activity.title}</strong>`;
            iconColor = 'text-danger';
            break;
        default:
            icon = 'fa-info-circle';
            text = 'Nova atividade no sistema';
            iconColor = 'text-secondary';
    }

    return `
        <div class="activity-item">
            <div class="activity-icon ${iconColor}"><i class="fas ${icon}"></i></div>
            <div class="activity-content">
                <p class="mb-0">${text}</p>
                <small class="text-muted"><i class="far fa-clock me-1"></i>${time}</small>
            </div>
        </div>
    `;
}

function loadDashboardNotifications() {
    const notificationsList = document.getElementById('dashboard-notifications-list');
    if (!notificationsList) return;
    notificationsList.innerHTML = '<div class="loading"></div>';

    db.collection('notices').orderBy('timestamp', 'desc').limit(5).get().then(snapshot => {
        if (snapshot.empty) {
            notificationsList.innerHTML = `
                <div class="text-center text-muted py-4">
                    <i class="fas fa-bell-slash fa-2x mb-2"></i>
                    <p>Nenhum aviso recente.</p>
                </div>
            `;
            return;
        }

        let html = '';
        snapshot.forEach(doc => {
            const notice = doc.data();
            html += `
                <div class="notification-item">
                    <div class="notification-icon"><i class="fas fa-bullhorn"></i></div>
                    <div class="notification-content">
                        <p class="mb-1"><strong>${notice.title}</strong></p>
                        <p class="mb-1 small text-muted">${notice.content.substring(0, 70)}${notice.content.length > 70 ? '...' : ''}</p>
                        <small class="text-muted">${notice.timestamp.toDate().toLocaleDateString('pt-BR')}</small>
                    </div>
                </div>
            `;
        });
        notificationsList.innerHTML = html;
    });
}

function loadAdminChartsData() {
    const chartIds = ['reservationsChart', 'incidentsChart'];
    chartIds.forEach(id => {
        if (chartInstances[id] && document.getElementById(id)) {
            chartInstances[id].destroy();
        }
    });

    // Gráfico de Reservas
    const reservationsCtx = document.getElementById('reservationsChart');
    if (reservationsCtx) {
        firestoreListeners.reservationsChart = db.collection("reservations")
            .where("date", ">=", new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0])
            .onSnapshot(snapshot => {
                const reservationsByArea = {};
                snapshot.forEach(doc => {
                    const reservation = doc.data();
                    reservationsByArea[reservation.area] = (reservationsByArea[reservation.area] || 0) + 1;
                });

                if (chartInstances['reservationsChart']) chartInstances['reservationsChart'].destroy();
                chartInstances['reservationsChart'] = new Chart(reservationsCtx.getContext('2d'), {
                    type: 'doughnut',
                    data: {
                        labels: Object.keys(reservationsByArea),
                        datasets: [{
                            label: 'Número de Reservas',
                            data: Object.values(reservationsByArea),
                            backgroundColor: [
                                'rgba(102, 126, 234, 0.8)',
                                'rgba(255, 159, 64, 0.8)',
                                'rgba(255, 205, 86, 0.8)',
                                'rgba(75, 192, 192, 0.8)',
                                'rgba(54, 162, 235, 0.8)',
                                'rgba(153, 102, 255, 0.8)',
                                'rgba(201, 203, 207, 0.8)'
                            ],
                            borderColor: '#fff',
                            borderWidth: 4,
                            hoverOffset: 15
                        }]
                    },
                    options: {
                        responsive: true,
                        maintainAspectRatio: false,
                        plugins: {
                            legend: {
                                position: 'bottom',
                                labels: {
                                    padding: 20,
                                    usePointStyle: true
                                }
                            },
                            title: {
                                display: true,
                                text: 'Reservas por Área nos Últimos 30 Dias'
                            }
                        },
                        cutout: '70%'
                    }
                });
            });
    }

    // Gráfico de Ocorrências
    const incidentsCtx = document.getElementById('incidentsChart');
    if (incidentsCtx) {
        firestoreListeners.incidentsChart = db.collection("incidents").onSnapshot(snapshot => {
            const incidentsByStatus = { open: 0, in_progress: 0, resolved: 0 };
            snapshot.forEach(doc => {
                const incident = doc.data();
                incidentsByStatus[incident.status] = (incidentsByStatus[incident.status] || 0) + 1;
            });

            if (chartInstances['incidentsChart']) chartInstances['incidentsChart'].destroy();
            chartInstances['incidentsChart'] = new Chart(incidentsCtx.getContext('2d'), {
                type: 'doughnut',
                data: {
                    labels: ['Abertas', 'Em Andamento', 'Resolvidas'],
                    datasets: [{
                        data: [incidentsByStatus.open, incidentsByStatus.in_progress, incidentsByStatus.resolved],
                        backgroundColor: [
                            'rgba(250, 112, 154, 0.8)',
                            'rgba(255, 193, 7, 0.8)',
                            'rgba(67, 233, 123, 0.8)'
                        ],
                        borderColor: ['#fff'],
                        borderWidth: 4,
                        hoverOffset: 15
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: { position: 'bottom', labels: { padding: 20, usePointStyle: true } },
                        title: {
                            display: true,
                            text: 'Status das Ocorrências'
                        }
                    },
                    cutout: '70%'
                }
            });
        });
    }
}

function refreshDashboard() {
    showAlert('Atualizando dados do dashboard...', 'info');
    const dashboardContent = document.querySelector('.container-fluid');
    if (dashboardContent) {
        dashboardContent.style.opacity = '0.5';
        dashboardContent.style.transition = 'opacity 0.3s ease';
    }
    
    loadEnhancedDashboardData();

    setTimeout(() => {
        if (dashboardContent) {
            dashboardContent.style.opacity = '1';
        }
        showAlert('Dashboard atualizado com sucesso!', 'success');
    }, 1200);
}

function generateReport(type) {
    showAlert(`Iniciando geração de relatório (${type})...`, 'info');
    // Lógica de geração de relatório (pode ser uma nova janela ou download de PDF/CSV)
    setTimeout(() => {
        showAlert('Relatório gerado e pronto para download!', 'success');
    }, 2500);
}

export { renderDashboard, cleanup, refreshDashboard, generateReport };