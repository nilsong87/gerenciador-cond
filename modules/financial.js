import { renderNavigation, setActiveNavItem, showAlert, cleanup, firestoreListeners, sanitizeHTML } from './ui.js';
import { userRole, currentUser } from './auth.js';
import { db } from './firebase.js';
import { initAppEventListeners } from '../app.js';

function renderFinancialPage() {
    cleanup();
    setActiveNavItem('nav-financial'); // Assuming you add this ID to your nav
    const appContainer = document.getElementById('app');
    appContainer.innerHTML = `
        ${renderNavigation(userRole, currentUser)}
        <div class="container-fluid py-4 animate-fade-in">
            <div class="d-flex justify-content-between align-items-center mb-4">
                <h1 class="h3 mb-0 text-gradient"><i class="fas fa-chart-line me-2"></i>Painel Financeiro</h1>
                <button id="export-financial-report" class="btn btn-premium btn-success-premium"><i class="fas fa-file-csv me-2"></i>Exportar CSV</button>
            </div>

            <!-- Financial Summary -->
            <div class="row mb-4">
                <div class="col-xl-4 col-md-6 mb-4">
                    <div class="stat-card success">
                        <div class="d-flex justify-content-between">
                            <div>
                                <div class="stat-number" id="total-revenue">R$ 0,00</div>
                                <div class="stat-label">Receita Total</div>
                            </div>
                            <div class="stat-icon text-success"><i class="fas fa-arrow-up"></i></div>
                        </div>
                    </div>
                </div>
                <div class="col-xl-4 col-md-6 mb-4">
                    <div class="stat-card danger">
                        <div class="d-flex justify-content-between">
                            <div>
                                <div class="stat-number" id="total-expenses">R$ 0,00</div>
                                <div class="stat-label">Despesa Total</div>
                            </div>
                            <div class="stat-icon text-danger"><i class="fas fa-arrow-down"></i></div>
                        </div>
                    </div>
                </div>
                <div class="col-xl-4 col-md-12 mb-4">
                    <div class="stat-card primary">
                        <div class="d-flex justify-content-between">
                            <div>
                                <div class="stat-number" id="current-balance">R$ 0,00</div>
                                <div class="stat-label">Saldo Atual</div>
                            </div>
                            <div class="stat-icon text-primary"><i class="fas fa-balance-scale"></i></div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Add Transaction Form -->
            <div class="card-premium mb-4 animate-slide-up">
                <div class="card-header-premium">
                    <h5 class="card-title mb-0"><i class="fas fa-plus-circle me-2"></i>Adicionar Transação</h5>
                </div>
                <div class="card-body-premium">
                    <form id="financial-form">
                        <div class="row">
                            <div class="col-md-4 mb-3">
                                <label for="fin-description" class="form-label">Descrição *</label>
                                <input type="text" id="fin-description" class="form-control-premium" required>
                            </div>
                            <div class="col-md-3 mb-3">
                                <label for="fin-amount" class="form-label">Valor (R$) *</label>
                                <input type="number" id="fin-amount" class="form-control-premium" step="0.01" required>
                            </div>
                            <div class="col-md-3 mb-3">
                                <label for="fin-type" class="form-label">Tipo *</label>
                                <select id="fin-type" class="form-select-premium" required>
                                    <option value="revenue">Receita</option>
                                    <option value="expense">Despesa</option>
                                </select>
                            </div>
                            <div class="col-md-2 mb-3 d-flex align-items-end">
                                <button type="submit" class="btn btn-premium btn-primary-premium w-100">Adicionar</button>
                            </div>
                        </div>
                    </form>
                </div>
            </div>

            <!-- Transactions List -->
            <div class="card-premium animate-slide-up">
                <div class="card-header-premium">
                    <h5 class="card-title mb-0"><i class="fas fa-list-ul me-2"></i>Histórico de Transações</h5>
                </div>
                <div class="card-body-premium">
                    <div class="table-responsive">
                        <table class="table table-premium">
                            <thead>
                                <tr>
                                    <th>Descrição</th>
                                    <th>Valor</th>
                                    <th>Tipo</th>
                                    <th>Data</th>
                                    <th>Ações</th>
                                </tr>
                            </thead>
                            <tbody id="financial-list">
                                <tr><td colspan="5" class="text-center py-5"><div class="loading"></div></td></tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    `;
    initAppEventListeners();
    initFinancialEventListeners();
    loadFinancialData();
}

function initFinancialEventListeners() {
    const form = document.getElementById('financial-form');
    form.addEventListener('submit', (e) => {
        e.preventDefault();
        addTransaction();
    });

    const list = document.getElementById('financial-list');
    list.addEventListener('click', (e) => {
        if (e.target.closest('.delete-transaction-btn')) {
            const button = e.target.closest('.delete-transaction-btn');
            const transactionId = button.dataset.id;
            deleteTransaction(transactionId);
        }
    });
    
    const exportButton = document.getElementById('export-financial-report');
    exportButton.addEventListener('click', exportFinancialDataToCSV);
}

function addTransaction() {
    const description = document.getElementById('fin-description').value;
    const amount = parseFloat(document.getElementById('fin-amount').value);
    const type = document.getElementById('fin-type').value;

    if (!description || isNaN(amount) || amount <= 0) {
        showAlert('Descrição e valor são obrigatórios.', 'warning');
        return;
    }

    db.collection('financials').add({
        description,
        amount,
        type,
        timestamp: firebase.firestore.FieldValue.serverTimestamp()
    }).then(() => {
        showAlert('Transação adicionada com sucesso!', 'success');
        document.getElementById('financial-form').reset();
    }).catch(error => {
        showAlert('Erro ao adicionar transação.', 'danger');
        console.error("Error adding transaction: ", error);
    });
}

function loadFinancialData() {
    if (firestoreListeners.financial) {
        firestoreListeners.financial();
    }

    firestoreListeners.financial = db.collection('financials').orderBy('timestamp', 'desc')
        .onSnapshot(snapshot => {
            const list = document.getElementById('financial-list');
            if (snapshot.empty) {
                list.innerHTML = '<tr><td colspan="5" class="text-center text-muted py-5">Nenhuma transação registrada.</td></tr>';
                updateSummary([]);
                return;
            }

            const transactions = [];
            let html = '';
            snapshot.forEach(doc => {
                const data = doc.data();
                data.id = doc.id;
                transactions.push(data);

                const isRevenue = data.type === 'revenue';
                html += `
                    <tr class="animate-fade-in">
                        <td>${sanitizeHTML(data.description)}</td>
                        <td class="${isRevenue ? 'text-success' : 'text-danger'}">
                            ${isRevenue ? '+' : '-'} R$ ${data.amount.toFixed(2)}
                        </td>
                        <td>
                            <span class="badge-premium ${isRevenue ? 'badge-success-premium' : 'badge-danger-premium'}">
                                ${isRevenue ? 'Receita' : 'Despesa'}
                            </span>
                        </td>
                        <td>${data.timestamp.toDate().toLocaleDateString('pt-BR')}</td>
                        <td>
                            <button class="btn btn-sm btn-premium btn-danger-premium delete-transaction-btn" data-id="${data.id}">
                                <i class="fas fa-trash"></i>
                            </button>
                        </td>
                    </tr>
                `;
            });
            list.innerHTML = html;
            updateSummary(transactions);
        }, error => {
            showAlert('Erro ao carregar dados financeiros.', 'danger');
            console.error("Error loading financial data: ", error);
        });
}

function updateSummary(transactions) {
    let totalRevenue = 0;
    let totalExpenses = 0;

    transactions.forEach(t => {
        if (t.type === 'revenue') {
            totalRevenue += t.amount;
        } else {
            totalExpenses += t.amount;
        }
    });

    const balance = totalRevenue - totalExpenses;

    document.getElementById('total-revenue').textContent = `R$ ${totalRevenue.toFixed(2)}`;
    document.getElementById('total-expenses').textContent = `R$ ${totalExpenses.toFixed(2)}`;
    document.getElementById('current-balance').textContent = `R$ ${balance.toFixed(2)}`;

    const balanceElement = document.getElementById('current-balance');
    balanceElement.classList.remove('text-success', 'text-danger');
    if (balance > 0) {
        balanceElement.classList.add('text-success');
    } else if (balance < 0) {
        balanceElement.classList.add('text-danger');
    }
}

function deleteTransaction(id) {
    if (confirm('Tem certeza que deseja excluir esta transação?')) {
        db.collection('financials').doc(id).delete()
            .then(() => showAlert('Transação excluída com sucesso!', 'success'))
            .catch(error => {
                showAlert('Erro ao excluir transação.', 'danger');
                console.error("Error deleting transaction: ", error);
            });
    }
}

async function exportFinancialDataToCSV() {
    showAlert('Exportando dados...', 'info');
    try {
        const snapshot = await db.collection('financials').orderBy('timestamp', 'desc').get();
        if (snapshot.empty) {
            showAlert('Nenhum dado para exportar.', 'warning');
            return;
        }

        let csvContent = "data:text/csv;charset=utf-8,";
        csvContent += "Descrição,Valor,Tipo,Data\r\n"; // Cabeçalho

        snapshot.forEach(doc => {
            const data = doc.data();
            const row = [
                `"${sanitizeHTML(data.description)}"`,
                data.amount.toFixed(2),
                data.type,
                data.timestamp.toDate().toLocaleDateString('pt-BR')
            ].join(',');
            csvContent += row + "\r\n";
        });

        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", "relatorio_financeiro.csv");
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        showAlert('Dados exportados com sucesso!', 'success');

    } catch (error) {
        showAlert('Falha ao exportar dados.', 'danger');
        console.error("Could not export to CSV:", error);
    }
}


export { renderFinancialPage };
