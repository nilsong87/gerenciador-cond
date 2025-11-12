import { showAlert } from './ui.js';
import { db } from './firebase.js';
import { collection, getDocs, query, where } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-firestore.js";

async function fetchFinancialData() {
    try {
        const incomesSnapshot = await getDocs(collection(db, 'incomes'));
        const expensesSnapshot = await getDocs(collection(db, 'expenses'));

        let totalIncomes = 0;
        incomesSnapshot.forEach(doc => {
            totalIncomes += doc.data().amount;
        });

        let totalExpenses = 0;
        expensesSnapshot.forEach(doc => {
            totalExpenses += doc.data().amount;
        });

        const incomesByMonth = groupDataByMonth(incomesSnapshot);
        const expensesByMonth = groupDataByMonth(expensesSnapshot);

        return {
            stats: {
                totalIncomes,
                totalExpenses,
                balance: totalIncomes - totalExpenses,
                delinquency: 0.08, // Placeholder
            },
            chartData: {
                incomes: incomesByMonth,
                expenses: expensesByMonth,
            },
            recentTransactions: [] // Placeholder
        };
    } catch (error) {
        console.error("Error fetching financial data: ", error);
        showAlert('Falha ao buscar dados financeiros.', 'danger');
        return null;
    }
}

function groupDataByMonth(snapshot) {
    const monthlyCounts = { 'Jan': 0, 'Fev': 0, 'Mar': 0, 'Abr': 0, 'Mai': 0, 'Jun': 0, 'Jul': 0, 'Ago': 0, 'Set': 0, 'Out': 0, 'Nov': 0, 'Dez': 0 };
    const monthMap = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
    
    snapshot.forEach(doc => {
        const data = doc.data();
        const dateField = data.date;
        if (dateField && dateField.toDate) {
            const date = dateField.toDate();
            const month = monthMap[date.getMonth()];
            if (monthlyCounts.hasOwnProperty(month)) {
                monthlyCounts[month] += data.amount;
            }
        }
    });
    return Object.values(monthlyCounts);
}

async function showFinancialPanel() {
    showAlert('Carregando painel financeiro...', 'info');
    const data = await fetchFinancialData();
    if (!data) return;

    const { stats, chartData, recentTransactions } = data;

    const modalId = 'financial-panel-modal';
    const modalHtml = `
        <div id="${modalId}" class="modal-premium confirm-modal show" style="display: block;">
            <div class="modal-backdrop-premium" onclick="closeModal('${modalId}')"></div>
            <div class="modal-dialog-premium modal-dialog-centered modal-xl">
                <div class="modal-content-premium glass-effect animate-bounce-in">
                    <div class="modal-header-premium">
                        <h5 class="modal-title"><i class="fas fa-chart-line me-2"></i>Painel Financeiro</h5>
                        <button type="button" class="btn-close-premium" onclick="closeModal('${modalId}')"><i class="fas fa-times"></i></button>
                    </div>
                    <div class="modal-body-premium" style="padding: 2rem;">
                        <div class="container-fluid">
                            <!-- Financial Summary -->
                            <div class="row mb-4">
                                <div class="col-lg-3 col-md-6 mb-4">
                                    <div class="stat-card-analytics">
                                        <div class="stat-icon-analytics text-success"><i class="fas fa-dollar-sign"></i></div>
                                        <div class="stat-info-analytics">
                                            <div class="stat-number-analytics">R$ ${stats.totalIncomes.toFixed(2)}</div>
                                            <div class="stat-label-analytics">Receita Mensal</div>
                                        </div>
                                    </div>
                                </div>
                                <div class="col-lg-3 col-md-6 mb-4">
                                    <div class="stat-card-analytics">
                                        <div class="stat-icon-analytics text-danger"><i class="fas fa-file-invoice-dollar"></i></div>
                                        <div class="stat-info-analytics">
                                            <div class="stat-number-analytics">R$ ${stats.totalExpenses.toFixed(2)}</div>
                                            <div class="stat-label-analytics">Despesa Mensal</div>
                                        </div>
                                    </div>
                                </div>
                                <div class="col-lg-3 col-md-6 mb-4">
                                    <div class="stat-card-analytics">
                                        <div class="stat-icon-analytics text-primary"><i class="fas fa-balance-scale"></i></div>
                                        <div class="stat-info-analytics">
                                            <div class="stat-number-analytics">R$ ${stats.balance.toFixed(2)}</div>
                                            <div class="stat-label-analytics">Balanço</div>
                                        </div>
                                    </div>
                                </div>
                                <div class="col-lg-3 col-md-6 mb-4">
                                    <div class="stat-card-analytics">
                                        <div class="stat-icon-analytics text-warning"><i class="fas fa-exclamation-circle"></i></div>
                                        <div class="stat-info-analytics">
                                            <div class="stat-number-analytics">${(stats.delinquency * 100).toFixed(0)}%</div>
                                            <div class="stat-label-analytics">Inadimplência</div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <!-- Charts and Recent Transactions -->
                            <div class="row">
                                <div class="col-lg-7 mb-4 mb-lg-0">
                                    <div class="chart-container-analytics" style="height: 300px;">
                                        <canvas id="financialChart"></canvas>
                                    </div>
                                </div>
                                <div class="col-lg-5">
                                    <h6 class="text-gradient">Últimas Transações</h6>
                                    <ul class="list-group">
                                        <li class="list-group-item d-flex justify-content-between align-items-center">
                                            <span><i class="fas fa-arrow-down text-success me-2"></i>Taxa Condominial - Apt 101</span>
                                            <strong class="text-success">+ R$ 850,00</strong>
                                        </li>
                                        <li class="list-group-item d-flex justify-content-between align-items-center">
                                            <span><i class="fas fa-arrow-up text-danger me-2"></i>Manutenção Elevador</span>
                                            <strong class="text-danger">- R$ 1.200,00</strong>
                                        </li>
                                        <li class="list-group-item d-flex justify-content-between align-items-center">
                                            <span><i class="fas fa-arrow-down text-success me-2"></i>Taxa Condominial - Apt 102</span>
                                            <strong class="text-success">+ R$ 850,00</strong>
                                        </li>
                                        <li class="list-group-item d-flex justify-content-between align-items-center">
                                            <span><i class="fas fa-arrow-up text-danger me-2"></i>Conta de Energia</span>
                                            <strong class="text-danger">- R$ 2.350,00</strong>
                                        </li>
                                         <li class="list-group-item d-flex justify-content-between align-items-center">
                                            <span><i class="fas fa-arrow-down text-success me-2"></i>Reserva Salão de Festas</span>
                                            <strong class="text-success">+ R$ 350,00</strong>
                                        </li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;
    document.body.insertAdjacentHTML('beforeend', modalHtml);

    renderFinancialChart(chartData);
}

function renderFinancialChart(chartData) {
    const ctx = document.getElementById('financialChart').getContext('2d');
    const monthLabels = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
    
    new Chart(ctx, {
        type: 'bar',
        data: {
            labels: monthLabels,
            datasets: [{
                label: 'Receitas',
                data: chartData.incomes,
                backgroundColor: 'rgba(75, 192, 192, 0.6)',
                borderColor: 'rgba(75, 192, 192, 1)',
                borderWidth: 1
            }, {
                label: 'Despesas',
                data: chartData.expenses,
                backgroundColor: 'rgba(255, 99, 132, 0.6)',
                borderColor: 'rgba(255, 99, 132, 1)',
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        callback: function(value) {
                            return 'R$ ' + value / 1000 + 'k';
                        }
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
}

export { showFinancialPanel };