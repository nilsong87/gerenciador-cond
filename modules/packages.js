import { renderNavigation, setActiveNavItem, showAlert, initGlobalEventListeners, cleanup, firestoreListeners, sanitizeHTML } from './ui.js';
import { userRole, currentUser } from './auth.js';
import { db } from './firebase.js';

function renderPackages() {
    cleanup();
    const isAdmin = userRole === 'admin';
    
    const appContainer = document.getElementById('app');
    appContainer.innerHTML = `
        ${renderNavigation()}
        <div class="container-fluid py-4 animate-fade-in">
            <div class="row mb-4">
                <div class="col-12">
                    <div class="d-flex justify-content-between align-items-center">
                        <h1 class="h3 mb-0 text-gradient">
                            <i class="fas fa-box me-2"></i>Gerenciar Encomendas
                        </h1>
                        <button id="export-packages-btn" class="btn btn-premium btn-primary-premium">
                            <i class="fas fa-download me-2"></i>Exportar
                        </button>
                    </div>
                    <p class="text-muted mb-0">Controle total de encomendas e entregas</p>
                </div>
            </div>
            
            ${isAdmin ? `
            <div class="row mb-4 animate-slide-up">
                <div class="col-lg-6">
                    <div class="card-premium h-100">
                        <div class="card-header-premium">
                            <h5 class="card-title mb-0">
                                <i class="fas fa-plus-circle me-2"></i>Nova Encomenda
                            </h5>
                        </div>
                        <div class="card-body-premium">
                            <form id="package-form">
                                <div class="row">
                                    <div class="col-md-6 mb-3">
                                        <label for="package-description" class="form-label">Descrição *</label>
                                        <input type="text" class="form-control-premium" id="package-description" 
                                               placeholder="Ex: Pacote Amazon" required>
                                    </div>
                                    <div class="col-md-6 mb-3">
                                        <label for="package-apartment" class="form-label">Apartamento *</label>
                                        <input type="text" class="form-control-premium" id="package-apartment" 
                                               placeholder="Ex: 101" required>
                                    </div>
                                </div>
                                <div class="mb-3">
                                    <label for="package-recipient" class="form-label">Destinatário</label>
                                    <input type="text" class="form-control-premium" id="package-recipient" 
                                           placeholder="Nome do morador">
                                </div>
                                <div class="mb-3">
                                    <label for="package-notes" class="form-label">Observações</label>
                                    <textarea class="form-control-premium" id="package-notes" rows="2" 
                                              placeholder="Informações adicionais..."></textarea>
                                </div>
                                <div class="d-grid gap-2 d-md-flex justify-content-md-end">
                                    <button id="clear-package-form-btn" type="button" class="btn btn-premium btn-secondary-premium">
                                        <i class="fas fa-times me-2"></i>Limpar
                                    </button>
                                    <button type="submit" class="btn btn-premium btn-primary-premium">
                                        <i class="fas fa-plus me-2"></i>Adicionar Encomenda
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
                <div class="col-lg-6">
                    <div class="card-premium h-100">
                        <div class="card-header-premium">
                            <h5 class="card-title mb-0">
                                <i class="fas fa-chart-pie me-2"></i>Estatísticas
                            </h5>
                        </div>
                        <div class="card-body-premium">
                            <div class="row text-center">
                                <div class="col-6 mb-3">
                                    <div class="stat-number text-primary" id="total-pending">0</div>
                                    <div class="stat-label">Pendentes</div>
                                </div>
                                <div class="col-6 mb-3">
                                    <div class="stat-number text-success" id="total-delivered">0</div>
                                    <div class="stat-label">Entregues</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            ` : ''}
            
            <div class="row animate-slide-up">
                <div class="col-12">
                    <div class="card-premium">
                        <div class="card-header-premium d-flex justify-content-between align-items-center">
                            <h5 class="card-title mb-0">
                                <i class="fas fa-list me-2"></i>Encomendas Pendentes
                            </h5>
                            <div class="btn-group">
                                <button id="filter-packages-all-btn" class="btn btn-sm btn-premium btn-outline-primary">
                                    Todas
                                </button>
                                <button id="filter-packages-today-btn" class="btn btn-sm btn-premium btn-outline-success">
                                    Hoje
                                </button>
                            </div>
                        </div>
                        <div class="card-body-premium">
                            <div class="table-responsive">
                                <table class="table table-premium">
                                    <thead>
                                        <tr>
                                            <th>Descrição</th>
                                            <th>Apartamento</th>
                                            <th>Destinatário</th>
                                            <th>Data</th>
                                            <th>Status</th>
                                            ${isAdmin ? '<th>Ações</th>' : ''}
                                        </tr>
                                    </thead>
                                    <tbody id="packages-list">
                                        <tr>
                                            <td colspan="${isAdmin ? 6 : 5}" class="text-center py-5">
                                                <div class="loading"></div>
                                                <p class="text-muted mt-2">Carregando encomendas...</p>
                                            </td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;

    setActiveNavItem('nav-packages');
    initGlobalEventListeners();

    document.getElementById('export-packages-btn').addEventListener('click', exportPackagesData);
    document.getElementById('filter-packages-all-btn').addEventListener('click', () => filterPackages('all'));
    document.getElementById('filter-packages-today-btn').addEventListener('click', () => filterPackages('today'));

    const form = document.getElementById('package-form');
    if (form) {
        form.addEventListener('submit', function(e) {
            e.preventDefault();
            addPackage();
        });
        document.getElementById('clear-package-form-btn').addEventListener('click', clearPackageForm);
    }

    const packagesList = document.getElementById('packages-list');
    packagesList.addEventListener('click', (e) => {
        const target = e.target.closest('button');
        if (!target) return;

        const packageId = target.dataset.packageId;
        if (!packageId) return;

        if (target.classList.contains('deliver-package-btn')) {
            deliverPackage(packageId);
        } else if (target.classList.contains('delete-package-btn')) {
            deletePackage(packageId);
        }
    });

    loadEnhancedPackages();
    if (isAdmin) {
        loadPackagesStats();
    }
}

function loadEnhancedPackages() {
    const isAdmin = userRole === 'admin';
    let query = db.collection("packages").where("delivered", "==", false);

    if (!isAdmin) {
        query = query.where("apartment", "==", currentUser.email.split('@')[0]);
    }

    if (firestoreListeners.packages) {
        firestoreListeners.packages();
    }

    firestoreListeners.packages = query.orderBy("timestamp", "desc")
        .onSnapshot((querySnapshot) => {
            const packagesList = document.getElementById("packages-list");
            
            if (querySnapshot.empty) {
                packagesList.innerHTML = `
                    <tr>
                        <td colspan="${isAdmin ? 6 : 5}" class="text-center text-muted py-5">
                            <i class="fas fa-box-open fa-3x mb-3 text-muted"></i>
                            <h5>Nenhuma encomenda pendente</h5>
                            <p class="mb-0">Todas as encomendas foram entregues!</p>
                        </td>
                    </tr>
                `;
                return;
            }
            
            let html = '';
            querySnapshot.forEach((doc) => {
                const packageData = doc.data();
                const date = packageData.timestamp?.toDate();
                const isToday = date?.toDateString() === new Date().toDateString();
                
                html += `
                    <tr class="animate-fade-in">
                        <td>
                            <div class="d-flex align-items-center">
                                <i class="fas fa-box text-primary me-3"></i>
                                <div>
                                    <strong>${sanitizeHTML(packageData.description)}</strong>
                                    ${packageData.notes ? `<br><small class="text-muted">${sanitizeHTML(packageData.notes)}</small>` : ''}
                                </div>
                            </div>
                        </td>
                        <td>
                            <span class="badge-premium badge-info-premium">${sanitizeHTML(packageData.apartment)}</span>
                        </td>
                        <td>${sanitizeHTML(packageData.recipient) || '<span class="text-muted">-</span>'}</td>
                        <td>
                            <div>${date?.toLocaleDateString('pt-BR') || 'N/A'}</div>
                            <small class="text-muted">${date?.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }) || ''}</small>
                        </td>
                        <td>
                            <span class="badge-premium ${isToday ? 'badge-warning-premium' : 'badge-danger-premium'}">
                                ${isToday ? 'Hoje' : 'Pendente'}
                            </span>
                        </td>
                        ${isAdmin ? `
                        <td>
                            <div class="btn-group btn-group-sm">
                                <button class="btn btn-premium btn-success-premium deliver-package-btn" 
                                        data-package-id="${doc.id}"
                                        title="Marcar como entregue">
                                    <i class="fas fa-check"></i>
                                </button>
                                <button class="btn btn-premium btn-danger-premium delete-package-btn" 
                                        data-package-id="${doc.id}"
                                        title="Excluir encomenda">
                                    <i class="fas fa-trash"></i>
                                </button>
                            </div>
                        </td>
                        ` : ''}
                    </tr>
                `;
            });
            packagesList.innerHTML = html;
        });
}

function addPackage() {
    const description = document.getElementById('package-description').value;
    const apartment = document.getElementById('package-apartment').value;
    const recipient = document.getElementById('package-recipient').value;
    const notes = document.getElementById('package-notes').value;

    if (!description || !apartment) {
        showAlert('Por favor, preencha todos os campos obrigatórios', 'warning');
        return;
    }

    const submitBtn = document.querySelector('#package-form button[type="submit"]');
    const originalText = submitBtn.innerHTML;
    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin me-2"></i>Adicionando...';
    submitBtn.disabled = true;

    db.collection("packages").add({
        description: description,
        apartment: apartment,
        recipient: recipient,
        notes: notes,
        delivered: false,
        timestamp: firebase.firestore.FieldValue.serverTimestamp(),
        registeredBy: currentUser.email
    })
    .then(() => {
        showAlert('Encomenda adicionada com sucesso!', 'success');
        clearPackageForm();
    })
    .catch((error) => {
        console.error("Erro ao adicionar encomenda: ", error);
        showAlert('Erro ao adicionar encomenda', 'danger');
    })
    .finally(() => {
        submitBtn.innerHTML = originalText;
        submitBtn.disabled = false;
    });
}

function clearPackageForm() {
    document.getElementById('package-form').reset();
}

function deliverPackage(packageId) {
    if (confirm('Deseja marcar esta encomenda como entregue?')) {
        db.collection("packages").doc(packageId).update({
            delivered: true,
            deliveredAt: firebase.firestore.FieldValue.serverTimestamp(),
            deliveredBy: currentUser.email
        })
        .then(() => {
            showAlert('Encomenda marcada como entregue!', 'success');
        })
        .catch((error) => {
            console.error("Erro ao entregar encomenda: ", error);
            showAlert('Erro ao marcar encomenda como entregue', 'danger');
        });
    }
}

function deletePackage(packageId) {
    if (confirm('Tem certeza que deseja excluir esta encomenda?')) {
        db.collection("packages").doc(packageId).delete()
        .then(() => {
            showAlert('Encomenda excluída com sucesso!', 'success');
        })
        .catch((error) => {
            console.error("Erro ao excluir encomenda: ", error);
            showAlert('Erro ao excluir encomenda', 'danger');
        });
    }
}

function filterPackages(filter) {
    showAlert(`Filtro aplicado: ${filter === 'today' ? 'Encomendas de hoje' : 'Todas as encomendas'}`, 'info');
}

function exportPackagesData() {
    showAlert('Exportando dados das encomendas...', 'info');
}

function loadPackagesStats() {
    db.collection("packages").where("delivered", "==", false)
        .onSnapshot(snapshot => {
            const element = document.getElementById('total-pending');
            if (element) element.textContent = snapshot.size;
        });
    db.collection("packages").where("delivered", "==", true)
        .onSnapshot(snapshot => {
            const element = document.getElementById('total-delivered');
            if (element) element.textContent = snapshot.size;
        });
}

export { renderPackages, exportPackagesData, clearPackageForm, addPackage, filterPackages, deliverPackage, deletePackage };