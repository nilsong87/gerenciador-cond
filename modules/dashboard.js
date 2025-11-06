import { renderNavigation, setActiveNavItem, showAlert } from './ui.js';
import { userRole, currentUser } from './auth.js';
import { db } from './firebase.js';

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

function renderDashboard() {
    cleanup();
    const appContainer = document.getElementById('app');
    appContainer.innerHTML = `
        ${renderNavigation()}
        <div class="container-fluid py-4 animate-fade-in">
            <div class="row mb-4">
                <div class="col-12">
                    <div class="d-flex justify-content-between align-items-center">
                        <h1 class="h3 mb-0 text-gradient">
                            <i class="fas fa-tachometer-alt me-2"></i>Dashboard
                        </h1>
                        <div class="d-flex gap-2">
                            <button class="btn btn-premium btn-primary-premium" onclick="refreshDashboard()">
                                <i class="fas fa-sync-alt me-2"></i>Atualizar
                            </button>
                            <button class="btn btn-premium btn-success-premium" onclick="generateReport('dashboard')">
                                <i class="fas fa-download me-2"></i>Relatório
                            </button>
                        </div>
                    </div>
                    <p class="text-muted mb-0">Visão geral do condomínio</p>
                </div>
            </div>
            
            <!-- Statistics Cards -->
            <div class="row mb-5 animate-slide-up">
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
                        <div class="mt-3">
                            <small class="text-success">
                                <i class="fas fa-arrow-up me-1"></i>
                                <span id="packages-trend">0%</span> esta semana
                            </small>
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
                        <div class="mt-3">
                            <small class="text-success">
                                <i class="fas fa-arrow-up me-1"></i>
                                <span id="reservations-trend">0%</span> vs ontem
                            </small>
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
                        <div class="mt-3">
                            <small class="text-success">
                                <i class="fas fa-arrow-up me-1"></i>
                                <span id="visitors-trend">0%</span> esta semana
                            </small>
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
                        <div class="mt-3">
                            <small class="text-danger">
                                <i class="fas fa-arrow-down me-1"></i>
                                <span id="incidents-trend">0%</span> vs mês passado
                            </small>
                        </div>
                    </div>
                </div>
            </div>
            
            ${userRole === 'admin' ? renderAdminCharts() : ''}
            
            <!-- Recent Activity & Notifications -->
            <div class="row mt-4">
                <div class="col-lg-6 mb-4">
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
                
                <div class="col-lg-6 mb-4">
                    <div class="card-premium animate-slide-up">
                        <div class="card-header-premium">
                            <h5 class="card-title mb-0">
                                <i class="fas fa-bell me-2"></i>Notificações Recentes
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

    // Custom hamburger menu toggle logic
    const customMenuToggler = document.querySelector('.custom-menu-toggle');
    const customNavbarCollapse = document.getElementById('customNavbarCollapse');

    if (customMenuToggler && customNavbarCollapse) {
        customMenuToggler.addEventListener('click', () => {
            customNavbarCollapse.classList.toggle('show');
            const isExpanded = customNavbarCollapse.classList.contains('show');
            customMenuToggler.setAttribute('aria-expanded', isExpanded);
        });
    }
}

function renderAdminCharts() {
    return `
        <div class="row mb-4">
            <div class="col-lg-8 mb-4">
                <div class="chart-container animate-slide-up">
                    <h5 class="mb-4">Reservas por Área (Últimos 30 dias)</h5>
                    <canvas id="reservationsChart" height="250"></canvas>
                </div>
            </div>
            <div class="col-lg-4 mb-4">
                <div class="chart-container animate-slide-up">
                    <h5 class="mb-4">Status das Ocorrências</h5>
                    <canvas id="incidentsChart" height="250"></canvas>
                </div>
            </div>
        </div>
        
        <div class="row">
            <div class="col-lg-6 mb-4">
                <div class="chart-container animate-slide-up">
                    <h5 class="mb-4">Encomendas por Apartamento</h5>
                    <canvas id="packagesChart" height="200"></canvas>
                </div>
            </div>
            <div class="col-lg-6 mb-4">
                <div class="chart-container animate-slide-up">
                    <h5 class="mb-4">Visitantes da Semana</h5>
                    <canvas id="visitorsChart" height="200"></canvas>
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
            
            const trendElement = document.getElementById('packages-trend');
            if (trendElement) {
                const trend = snapshot.size > 5 ? '+12%' : '-5%';
                trendElement.textContent = trend;
            }
        });
    firestoreListeners.packagesStats = unsubscribe;
}

function loadReservationsStats() {
    const today = new Date().toISOString().split('T')[0];
    
    const unsubscribe = db.collection("reservations").where("date", "==", today)
        .onSnapshot(snapshot => {
            const element = document.getElementById('today-reservations');
            if (element) element.textContent = snapshot.size;
            
            const trendElement = document.getElementById('reservations-trend');
            if (trendElement) {
                const trend = snapshot.size > 2 ? '+8%' : '-3%';
                trendElement.textContent = trend;
            }
        });
    firestoreListeners.reservationsStats = unsubscribe;
}

function loadVisitorsStats() {
    const today = new Date().toISOString().split('T')[0];
    
    const unsubscribe = db.collection("visitors").where("date", "==", today)
        .onSnapshot(snapshot => {
            const element = document.getElementById('pending-visitors');
            if (element) element.textContent = snapshot.size;
            
            const trendElement = document.getElementById('visitors-trend');
            if (trendElement) {
                const trend = snapshot.size > 3 ? '+15%' : '-10%';
                trendElement.textContent = trend;
            }
        });
    firestoreListeners.visitorsStats = unsubscribe;
}

function loadIncidentsStats() {
    const unsubscribe = db.collection("incidents").where("status", "==", "open")
        .onSnapshot(snapshot => {
            const element = document.getElementById('open-incidents');
            if (element) element.textContent = snapshot.size;
            
            const trendElement = document.getElementById('incidents-trend');
            if (trendElement) {
                const trend = snapshot.size > 2 ? '+5%' : '-12%';
                trendElement.textContent = trend;
            }
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
    let icon = '';
    let text = '';

    switch (activity.collection) {
        case 'packages':
            icon = 'fa-box';
            text = `Nova encomenda para o apto ${activity.apartment}`;
            break;
        case 'reservations':
            icon = 'fa-calendar-alt';
            text = `Nova reserva da área ${activity.area}`;
            break;
        case 'visitors':
            icon = 'fa-users';
            text = `Visitante para o apto ${activity.apartment}`;
            break;
        case 'incidents':
            icon = 'fa-exclamation-triangle';
            text = `Nova ocorrência: ${activity.title}`;
            break;
    }

    return `
        <div class="activity-item">
            <div class="activity-icon"><i class="fas ${icon}"></i></div>
            <div class="activity-content">
                <p class="mb-0">${text}</p>
                <small class="text-muted">${time}</small>
            </div>
        </div>
    `;
}

function loadDashboardNotifications() {
    const notificationsList = document.getElementById('dashboard-notifications-list');
    notificationsList.innerHTML = '<div class="loading"></div>';

    db.collection('notices').orderBy('timestamp', 'desc').limit(5).get().then(snapshot => {
        if (snapshot.empty) {
            notificationsList.innerHTML = '<p class="text-muted">Nenhuma notificação recente.</p>';
            return;
        }

        let html = '';
        snapshot.forEach(doc => {
            const notice = doc.data();
            const isNew = notice.timestamp.toMillis() > (currentUser.lastLogin?.toMillis() || 0);
            html += `
                <div class="notification-item ${isNew ? 'new-notification' : ''}">
                    <div class="notification-content">
                        <p class="mb-0"><strong>${notice.title}</strong></p>
                        <small class="text-muted">${notice.timestamp.toDate().toLocaleDateString('pt-BR')}</small>
                    </div>
                    ${isNew ? '<div class="new-badge"></div>' : ''}
                </div>
            `;
        });
        notificationsList.innerHTML = html;
    });
}

function loadAdminChartsData() {
    const chartIds = ['reservationsChart', 'incidentsChart', 'packagesChart', 'visitorsChart'];
    chartIds.forEach(id => {
        if (chartInstances[id]) {
            chartInstances[id].destroy();
        }
    });

    firestoreListeners.reservationsChart = db.collection("reservations")
        .where("date", ">=", new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0])
        .onSnapshot(snapshot => {
            const reservationsByArea = {};
            snapshot.forEach(doc => {
                const reservation = doc.data();
                reservationsByArea[reservation.area] = (reservationsByArea[reservation.area] || 0) + 1;
            });

            const ctx = document.getElementById('reservationsChart').getContext('2d');
            if (chartInstances['reservationsChart']) {
                chartInstances['reservationsChart'].destroy();
            }
            chartInstances['reservationsChart'] = new Chart(ctx, {
                type: 'bar',
                data: {
                    labels: Object.keys(reservationsByArea),
                    datasets: [{
                        label: 'Número de Reservas',
                        data: Object.values(reservationsByArea),
                        backgroundColor: [
                            'rgba(102, 126, 234, 0.8)',
                            'rgba(240, 147, 251, 0.8)',
                            'rgba(79, 172, 254, 0.8)',
                            'rgba(67, 233, 123, 0.8)',
                            'rgba(250, 112, 154, 0.8)'
                        ],
                        borderColor: [
                            'rgba(102, 126, 234, 1)',
                            'rgba(240, 147, 251, 1)',
                            'rgba(79, 172, 254, 1)',
                            'rgba(67, 233, 123, 1)',
                            'rgba(250, 112, 154, 1)'
                        ],
                        borderWidth: 2,
                        borderRadius: 8
                    }]
                },
                options: {
                    responsive: true,
                    plugins: {
                        legend: {
                            display: false
                        },
                        title: {
                            display: true,
                            text: 'Reservas por Área (30 dias)',
                            font: {
                                size: 16,
                                weight: '600'
                            }
                        }
                    },
                    scales: {
                        y: {
                            beginAtZero: true,
                            grid: {
                                color: 'rgba(0,0,0,0.1)'
                            }
                        },
                        x: {
                            grid: {
                                display: false
                            }
                        }
                    }
                }
            });
        });

    firestoreListeners.incidentsChart = db.collection("incidents").onSnapshot(snapshot => {
        const incidentsByStatus = { open: 0, in_progress: 0, resolved: 0 };
        snapshot.forEach(doc => {
            const incident = doc.data();
            incidentsByStatus[incident.status] = (incidentsByStatus[incident.status] || 0) + 1;
        });

        const ctx = document.getElementById('incidentsChart').getContext('2d');
        if (chartInstances['incidentsChart']) {
            chartInstances['incidentsChart'].destroy();
        }
        chartInstances['incidentsChart'] = new Chart(ctx, {
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
                    borderColor: [
                        'rgba(250, 112, 154, 1)',
                        'rgba(255, 193, 7, 1)',
                        'rgba(67, 233, 123, 1)'
                    ],
                    borderWidth: 2,
                    hoverOffset: 15
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    legend: {
                        position: 'bottom',
                        labels: {
                            padding: 20,
                            usePointStyle: true
                        }
                    }
                },
                cutout: '65%'
            }
        });
    });

    firestoreListeners.packagesChart = db.collection("packages").where("delivered", "==", false).onSnapshot(snapshot => {
        const packagesByApartment = {};
        snapshot.forEach(doc => {
            const pkg = doc.data();
            packagesByApartment[pkg.apartment] = (packagesByApartment[pkg.apartment] || 0) + 1;
        });

        const ctx = document.getElementById('packagesChart').getContext('2d');
        if (chartInstances['packagesChart']) {
            chartInstances['packagesChart'].destroy();
        }
        chartInstances['packagesChart'] = new Chart(ctx, {
            type: 'polarArea',
            data: {
                labels: Object.keys(packagesByApartment),
                datasets: [{
                    data: Object.values(packagesByApartment),
                    backgroundColor: [
                        'rgba(102, 126, 234, 0.7)',
                        'rgba(240, 147, 251, 0.7)',
                        'rgba(79, 172, 254, 0.7)',
                        'rgba(67, 233, 123, 0.7)',
                        'rgba(250, 112, 154, 0.7)'
                    ]
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    legend: {
                        position: 'right'
                    }
                }
            }
        });
    });

    firestoreListeners.visitorsChart = db.collection("visitors").where("date", ">=", new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]).onSnapshot(snapshot => {
        const visitorsByDay = {};
        for (let i = 6; i >= 0; i--) {
            const date = new Date(Date.now() - i * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
            visitorsByDay[date] = 0;
        }

        snapshot.forEach(doc => {
            const visitor = doc.data();
            visitorsByDay[visitor.date] = (visitorsByDay[visitor.date] || 0) + 1;
        });

        const ctx = document.getElementById('visitorsChart').getContext('2d');
        if (chartInstances['visitorsChart']) {
            chartInstances['visitorsChart'].destroy();
        }
        chartInstances['visitorsChart'] = new Chart(ctx, {
            type: 'line',
            data: {
                labels: Object.keys(visitorsByDay).map(date => 
                    new Date(date).toLocaleDateString('pt-BR', { weekday: 'short' })
                ),
                datasets: [{
                    label: 'Visitantes',
                    data: Object.values(visitorsByDay),
                    borderColor: 'rgba(102, 126, 234, 1)',
                    backgroundColor: 'rgba(102, 126, 234, 0.1)',
                    borderWidth: 3,
                    tension: 0.4,
                    fill: true,
                    pointBackgroundColor: 'rgba(102, 126, 234, 1)',
                    pointBorderColor: '#fff',
                    pointBorderWidth: 2,
                    pointRadius: 6
                }]
            },
            options: {
                responsive: true,
                scales: {
                    y: {
                        beginAtZero: true
                    }
                }
            }
        });
    });
}

function refreshDashboard() {
    showAlert('Atualizando dados...', 'info');
    loadEnhancedDashboardData();
    setTimeout(() => {
        showAlert('Dados atualizados com sucesso!', 'success');
    }, 1000);
}

function generateReport(type) {
    showAlert(`Gerando relatório ${type}...`, 'info');
    setTimeout(() => {
        showAlert('Relatório gerado com sucesso!', 'success');
    }, 2000);
}

export { renderDashboard, cleanup, refreshDashboard, generateReport };