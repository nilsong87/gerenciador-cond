import { showAlert, cleanup, firestoreListeners, chartInstances } from './ui.js';
import { db } from './firebase.js';

async function showAnalyticsPanel() {
    if (document.getElementById('analytics-panel-modal')) return;

    const modalId = 'analytics-panel-modal';
    const modalHtml = `
        <div id="${modalId}" class="modal-premium confirm-modal show" style="display: block;">
            <div class="modal-backdrop-premium"></div>
            <div class="modal-dialog-premium modal-dialog-centered modal-xl">
                <div class="modal-content-premium glass-effect animate-bounce-in">
                    <div class="modal-header-premium">
                        <h5 class="modal-title"><i class="fas fa-chart-bar me-2"></i>Painel de Analytics</h5>
                        <div class="ms-auto d-flex align-items-center">
                            <select id="analytics-period" class="form-select-premium form-select-sm me-2">
                                <option value="7">Últimos 7 dias</option>
                                <option value="30" selected>Últimos 30 dias</option>
                                <option value="90">Últimos 90 dias</option>
                                <option value="365">Último Ano</option>
                            </select>
                            <button type="button" class="btn-close-premium"><i class="fas fa-times"></i></button>
                        </div>
                    </div>
                    <div class="modal-body-premium" style="padding: 2rem;">
                        <div id="analytics-content">
                            <div class="text-center py-5"><div class="loading"></div><p class="mt-2">Carregando dados...</p></div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;
    document.body.insertAdjacentHTML('beforeend', modalHtml);
    initAnalyticsEventListeners(modalId);
    loadAnalyticsData(30); // Load initial data for 30 days
}

function initAnalyticsEventListeners(modalId) {
    const modalElement = document.getElementById(modalId);
    const closeModal = () => {
        cleanup(); // This will destroy charts and listeners
        modalElement.remove();
    };

    modalElement.querySelector('.btn-close-premium').addEventListener('click', closeModal);
    modalElement.querySelector('.modal-backdrop-premium').addEventListener('click', closeModal);
    document.getElementById('analytics-period').addEventListener('change', (e) => {
        loadAnalyticsData(parseInt(e.target.value, 10));
    });
}

async function loadAnalyticsData(periodInDays) {
    const contentDiv = document.getElementById('analytics-content');
    contentDiv.innerHTML = `<div class="text-center py-5"><div class="loading"></div><p class="mt-2">Carregando dados para ${periodInDays} dias...</p></div>`;

    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(endDate.getDate() - periodInDays);

    try {
        const [usersData, packagesData, reservationsData, incidentsData] = await Promise.all([
            db.collection('users').get(),
            db.collection('packages').where('timestamp', '>=', startDate).get(),
            db.collection('reservations').where('date', '>=', startDate.toISOString().split('T')[0]).get(),
            db.collection('incidents').where('timestamp', '>=', startDate).get()
        ]);

        // Process Data
        const totalUsers = usersData.size;
        const newUsers = usersData.docs.filter(doc => doc.data().createdAt.toDate() >= startDate).length;
        const packagesDelivered = packagesData.docs.filter(doc => doc.data().delivered).length;
        
        const reservationsByArea = {};
        reservationsData.forEach(doc => {
            const area = doc.data().area;
            reservationsByArea[area] = (reservationsByArea[area] || 0) + 1;
        });
        const mostReservedArea = Object.keys(reservationsByArea).reduce((a, b) => reservationsByArea[a] > reservationsByArea[b] ? a : b, 'N/A');

        const openIncidents = incidentsData.docs.filter(doc => doc.data().status === 'open').length;

        const chartData = {
            reservations: groupDataByTime(reservationsData, startDate, endDate, 'date'),
            incidents: groupDataByTime(incidentsData, startDate, endDate, 'timestamp'),
            reservationsByArea: reservationsByArea
        };

        renderAnalyticsContent({
            totalUsers,
            newUsers,
            packagesDelivered,
            mostReservedArea,
            openIncidents,
            reservationsCount: reservationsData.size
        }, chartData, periodInDays);

    } catch (error) {
        console.error("Error fetching analytics data: ", error);
        showAlert('Falha ao buscar dados de analytics.', 'danger');
        contentDiv.innerHTML = '<div class="text-center py-5 text-danger">Erro ao carregar dados.</div>';
    }
}

function renderAnalyticsContent(stats, chartData, periodInDays) {
    const contentDiv = document.getElementById('analytics-content');
    contentDiv.innerHTML = `
        <div class="row">
            <!-- Main Chart -->
            <div class="col-lg-8 mb-4">
                <div class="card-premium h-100">
                    <div class="card-header-premium">
                        <h5 class="card-title mb-0">Ocorrências vs. Reservas</h5>
                    </div>
                    <div class="card-body-premium">
                        <canvas id="overviewChart"></canvas>
                    </div>
                </div>
            </div>
            <!-- Stats Column -->
            <div class="col-lg-4 mb-4">
                <div class="row">
                    <div class="col-6 col-lg-12"><div class="stat-card-analytics"><div class="stat-info-analytics"><div class="stat-number-analytics">${stats.reservationsCount}</div><div class="stat-label-analytics">Reservas</div></div></div></div>
                    <div class="col-6 col-lg-12"><div class="stat-card-analytics"><div class="stat-info-analytics"><div class="stat-number-analytics">${stats.openIncidents}</div><div class="stat-label-analytics">Ocorrências Abertas</div></div></div></div>
                    <div class="col-6 col-lg-12"><div class="stat-card-analytics"><div class="stat-info-analytics"><div class="stat-number-analytics">${stats.newUsers}</div><div class="stat-label-analytics">Novos Usuários</div></div></div></div>
                    <div class="col-6 col-lg-12"><div class="stat-card-analytics"><div class="stat-info-analytics"><div class="stat-number-analytics">${stats.packagesDelivered}</div><div class="stat-label-analytics">Pacotes Entregues</div></div></div></div>
                </div>
            </div>
        </div>
        <div class="row mt-4">
            <!-- Pie Chart -->
            <div class="col-lg-5 mb-4">
                <div class="card-premium h-100">
                     <div class="card-header-premium">
                        <h5 class="card-title mb-0">Reservas por Área</h5>
                    </div>
                    <div class="card-body-premium">
                        <canvas id="reservationsByAreaChart"></canvas>
                    </div>
                </div>
            </div>
            <!-- More Stats -->
            <div class="col-lg-7 mb-4">
                 <div class="card-premium h-100">
                     <div class="card-header-premium">
                        <h5 class="card-title mb-0">Estatísticas Gerais</h5>
                    </div>
                    <div class="card-body-premium">
                        <ul class="list-group list-group-flush">
                            <li class="list-group-item d-flex justify-content-between align-items-center">Total de Usuários no Sistema <span class="badge bg-primary rounded-pill">${stats.totalUsers}</span></li>
                            <li class="list-group-item d-flex justify-content-between align-items-center">Área Mais Reservada <span class="badge bg-success rounded-pill">${stats.mostReservedArea}</span></li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    `;
    renderOverviewChart(chartData, periodInDays);
    renderReservationsByAreaChart(chartData.reservationsByArea);
}

function renderOverviewChart({ reservations, incidents }, periodInDays) {
    const ctx = document.getElementById('overviewChart').getContext('2d');
    if (chartInstances.overview) chartInstances.overview.destroy();
    
    chartInstances.overview = new Chart(ctx, {
        type: 'line',
        data: {
            labels: reservations.labels,
            datasets: [{
                label: 'Ocorrências',
                data: incidents.data,
                borderColor: 'rgba(255, 99, 132, 1)',
                backgroundColor: 'rgba(255, 99, 132, 0.2)',
                fill: true,
                tension: 0.3
            }, {
                label: 'Reservas',
                data: reservations.data,
                borderColor: 'rgba(54, 162, 235, 1)',
                backgroundColor: 'rgba(54, 162, 235, 0.2)',
                fill: true,
                tension: 0.3
            }]
        },
        options: { responsive: true, maintainAspectRatio: false, scales: { y: { beginAtZero: true, ticks: { stepSize: 1 } } } }
    });
}

function renderReservationsByAreaChart(reservationsByArea) {
    const ctx = document.getElementById('reservationsByAreaChart').getContext('2d');
    if (chartInstances.reservationsByArea) chartInstances.reservationsByArea.destroy();

    chartInstances.reservationsByArea = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: Object.keys(reservationsByArea),
            datasets: [{
                data: Object.values(reservationsByArea),
                backgroundColor: ['#667eea', '#764ba2', '#f87979', '#f2c94c', '#27ae60', '#2d9cdb'],
                borderWidth: 0
            }]
        },
        options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'bottom' } } }
    });
}

function groupDataByTime(snapshot, startDate, endDate, dateField) {
    const period = (endDate - startDate) / (1000 * 3600 * 24);
    let labels;
    let counts;
    
    if (period <= 31) { // Group by day
        labels = Array.from({ length: period }, (_, i) => {
            const d = new Date(startDate);
            d.setDate(d.getDate() + i);
            return d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
        });
        counts = Array(period).fill(0);
        snapshot.forEach(doc => {
            const dateValue = doc.data()[dateField];
            if (!dateValue) return;

            const date = typeof dateValue.toDate === 'function' ? dateValue.toDate() : new Date(dateValue);
            const diffDays = Math.floor((date - startDate) / (1000 * 3600 * 24));
            if (diffDays >= 0 && diffDays < period) {
                counts[diffDays]++;
            }
        });
    } else { // Group by month
        const monthDiff = (endDate.getFullYear() - startDate.getFullYear()) * 12 + (endDate.getMonth() - startDate.getMonth());
        labels = Array.from({ length: monthDiff + 1 }, (_, i) => {
            const d = new Date(startDate);
            d.setMonth(d.getMonth() + i);
            return d.toLocaleDateString('pt-BR', { month: 'short', year: '2-digit' });
        });
        counts = Array(monthDiff + 1).fill(0);
        snapshot.forEach(doc => {
            const dateValue = doc.data()[dateField];
            if (!dateValue) return;

            const date = typeof dateValue.toDate === 'function' ? dateValue.toDate() : new Date(dateValue);
            const diffMonths = (date.getFullYear() - startDate.getFullYear()) * 12 + (date.getMonth() - startDate.getMonth());
            if (diffMonths >= 0 && diffMonths <= monthDiff) {
                counts[diffMonths]++;
            }
        });
    }
    return { labels, data: counts };
}

export { showAnalyticsPanel };
