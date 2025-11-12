import { showAlert } from './ui.js';
import { db } from './firebase.js';
import { collection, getDocs, query, where } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-firestore.js";

async function fetchAnalyticsData() {
    try {
        // Fetch incidents
        const incidentsQuery = query(collection(db, 'incidents'), where('status', '==', 'open'));
        const incidentsSnapshot = await getDocs(incidentsQuery);
        const openIncidentsCount = incidentsSnapshot.size;

        // Fetch reservations for the current month
        const now = new Date();
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const reservationsQuery = query(collection(db, 'reservations'), where('date', '>=', startOfMonth));
        const reservationsSnapshot = await getDocs(reservationsQuery);
        const monthlyReservationsCount = reservationsSnapshot.size;

        // Fetch new users in the last 30 days
        const thirtyDaysAgo = new Date(now.setDate(now.getDate() - 30));
        const usersQuery = query(collection(db, 'users'), where('createdAt', '>=', thirtyDaysAgo));
        const usersSnapshot = await getDocs(usersQuery);
        const newUsersCount = usersSnapshot.size;

        // Data for chart (example: group by month - this is a simplified example)
        const allIncidentsSnapshot = await getDocs(collection(db, 'incidents'));
        const allReservationsSnapshot = await getDocs(collection(db, 'reservations'));

        const incidentsByMonth = groupDataByMonth(allIncidentsSnapshot);
        const reservationsByMonth = groupDataByMonth(allReservationsSnapshot);

        return {
            stats: {
                openIncidents: openIncidentsCount,
                monthlyReservations: monthlyReservationsCount,
                newUsers: newUsersCount,
            },
            chartData: {
                incidents: incidentsByMonth,
                reservations: reservationsByMonth,
            }
        };
    } catch (error) {
        console.error("Error fetching analytics data: ", error);
        showAlert('Falha ao buscar dados de analytics.', 'danger');
        return null;
    }
}

function groupDataByMonth(snapshot) {
    const monthlyCounts = { 'Jan': 0, 'Fev': 0, 'Mar': 0, 'Abr': 0, 'Mai': 0, 'Jun': 0, 'Jul': 0, 'Ago': 0, 'Set': 0, 'Out': 0, 'Nov': 0, 'Dez': 0 };
    const monthMap = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
    
    snapshot.forEach(doc => {
        const data = doc.data();
        // Assuming docs have a 'date' or 'createdAt' field.
        const dateField = data.date || data.createdAt;
        if (dateField && dateField.toDate) {
            const date = dateField.toDate();
            const month = monthMap[date.getMonth()];
            if (monthlyCounts.hasOwnProperty(month)) {
                monthlyCounts[month]++;
            }
        }
    });
    return Object.values(monthlyCounts);
}


async function showAnalyticsPanel() {
    showAlert('Carregando painel de analytics...', 'info');
    const data = await fetchAnalyticsData();
    if (!data) return;

    const { stats, chartData } = data;

    const modalId = 'analytics-panel-modal';
    const modalHtml = `
        <div id="${modalId}" class="modal-premium confirm-modal show" style="display: block;">
            <div class="modal-backdrop-premium" onclick="closeModal('${modalId}')"></div>
            <div class="modal-dialog-premium modal-dialog-centered modal-xl">
                <div class="modal-content-premium glass-effect animate-bounce-in">
                    <div class="modal-header-premium">
                        <h5 class="modal-title"><i class="fas fa-chart-bar me-2"></i>Painel de Analytics</h5>
                        <button type="button" class="btn-close-premium" onclick="closeModal('${modalId}')"><i class="fas fa-times"></i></button>
                    </div>
                    <div class="modal-body-premium" style="padding: 2rem;">
                        <div class="container-fluid">
                            <div class="row">
                                <div class="col-lg-8 mb-4 mb-lg-0">
                                    <div class="chart-container-analytics">
                                        <canvas id="overviewChart"></canvas>
                                    </div>
                                </div>
                                <div class="col-lg-4 d-flex flex-column">
                                    <div class="stat-card-analytics">
                                        <div class="stat-icon-analytics text-success"><i class="fas fa-calendar-check"></i></div>
                                        <div class="stat-info-analytics">
                                            <div class="stat-number-analytics">${stats.monthlyReservations}</div>
                                            <div class="stat-label-analytics">Reservas no Mês</div>
                                        </div>
                                    </div>
                                    <div class="stat-card-analytics">
                                        <div class="stat-icon-analytics text-warning"><i class="fas fa-user-plus"></i></div>
                                        <div class="stat-info-analytics">
                                            <div class="stat-number-analytics">${stats.newUsers}</div>
                                            <div class="stat-label-analytics">Novos Usuários (30 dias)</div>
                                        </div>
                                    </div>
                                    <div class="stat-card-analytics">
                                        <div class="stat-icon-analytics text-danger"><i class="fas fa-exclamation-triangle"></i></div>
                                        <div class="stat-info-analytics">
                                            <div class="stat-number-analytics">${stats.openIncidents}</div>
                                            <div class="stat-label-analytics">Ocorrências Abertas</div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;
    document.body.insertAdjacentHTML('beforeend', modalHtml);

    const script = document.createElement('script');
    script.src = 'https://cdn.jsdelivr.net/npm/chart.js';
    script.onload = () => {
        renderOverviewChart(chartData);
    };
    document.head.appendChild(script);
}

function renderOverviewChart(chartData) {
    const ctx = document.getElementById('overviewChart').getContext('2d');
    const monthLabels = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
    
    new Chart(ctx, {
        type: 'line',
        data: {
            labels: monthLabels,
            datasets: [{
                label: 'Ocorrências',
                data: chartData.incidents,
                borderColor: 'rgba(255, 99, 132, 1)',
                backgroundColor: 'rgba(255, 99, 132, 0.2)',
                fill: true,
            }, {
                label: 'Reservas',
                data: chartData.reservations,
                borderColor: 'rgba(54, 162, 235, 1)',
                backgroundColor: 'rgba(54, 162, 235, 0.2)',
                fill: true,
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        stepSize: 1
                    }
                }
            }
        }
    });
}

window.closeModal = function(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.remove();
    }
    // Also remove the chart.js script to avoid conflicts
    const chartScript = document.querySelector('script[src="https://cdn.jsdelivr.net/npm/chart.js"]');
    if (chartScript) {
        chartScript.remove();
    }
}

export { showAnalyticsPanel };
