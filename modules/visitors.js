import { renderNavigation, setActiveNavItem, showAlert, initGlobalEventListeners, cleanup, firestoreListeners, sanitizeHTML } from './ui.js';
import { userRole, currentUser } from './auth.js';
import { db } from './firebase.js';
import { initAppEventListeners } from '../app.js';

function renderVisitors() {
    cleanup();
    setActiveNavItem('nav-visitors');
    const isAdmin = userRole === 'admin';
    const appContainer = document.getElementById('app');

    appContainer.innerHTML = `
        ${renderNavigation(userRole, currentUser)}
        <div class="container-fluid py-4 animate-fade-in">
            <div class="row mb-4">
                <div class="col-12">
                    <div class="d-flex justify-content-between align-items-center">
                        <h1 class="h3 mb-0 text-gradient">
                            <i class="fas fa-users me-2"></i>Gerenciar Visitantes
                        </h1>
                    </div>
                    <p class="text-muted mb-0">Controle a entrada e saída de visitantes</p>
                </div>
            </div>

            <div class="row mb-4 animate-slide-up">
                <div class="col-lg-12">
                    <div class="card-premium h-100">
                        <div class="card-header-premium">
                            <h5 class="card-title mb-0">
                                <i class="fas fa-plus-circle me-2"></i>Registrar Novo Visitante
                            </h5>
                        </div>
                        <div class="card-body-premium">
                            <form id="visitor-form">
                                <div class="row">
                                    <div class="col-md-4 mb-3">
                                        <label for="visitor-name" class="form-label">Nome do Visitante *</label>
                                        <input type="text" class="form-control-premium" id="visitor-name" required>
                                    </div>
                                    <div class="col-md-4 mb-3">
                                        <label for="visitor-apartment" class="form-label">Apartamento a Visitar *</label>
                                        <input type="text" class="form-control-premium" id="visitor-apartment" value="${isAdmin ? '' : currentUser.email.split('@')[0]}" ${isAdmin ? '' : 'readonly'}>
                                    </div>
                                    <div class="col-md-4 mb-3">
                                        <label for="visitor-date" class="form-label">Data da Visita *</label>
                                        <input type="date" class="form-control-premium" id="visitor-date" value="${new Date().toISOString().split('T')[0]}" required>
                                    </div>
                                </div>
                                <div class="d-grid gap-2 d-md-flex justify-content-md-end">
                                    <button type="submit" class="btn btn-premium btn-primary-premium">
                                        <i class="fas fa-plus me-2"></i>Adicionar Visitante
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>

            <div class="row animate-slide-up">
                <div class="col-12">
                    <div class="card-premium h-100">
                        <div class="card-header-premium">
                            <h5 class="card-title mb-0">
                                <i class="fas fa-list me-2"></i>Visitantes Registrados
                            </h5>
                        </div>
                        <div class="card-body-premium">
                            <div class="table-responsive">
                                <table class="table table-premium">
                                    <thead>
                                        <tr>
                                            <th>Nome</th>
                                            <th>Apartamento</th>
                                            <th>Data da Visita</th>
                                            ${isAdmin ? '<th>Ações</th>' : ''}
                                        </tr>
                                    </thead>
                                    <tbody id="visitors-list">
                                        <tr>
                                            <td colspan="${isAdmin ? 4 : 3}" class="text-center py-5">
                                                <div class="loading"></div>
                                                <p class="text-muted mt-2">Carregando visitantes...</p>
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

    const form = document.getElementById('visitor-form');
    if (form) {
        form.addEventListener('submit', function(e) {
            e.preventDefault();
            addVisitor();
        });
    }
    initGlobalEventListeners();
    initAppEventListeners();

    const visitorsList = document.getElementById('visitors-list');
    visitorsList.addEventListener('click', (e) => {
        const target = e.target.closest('button');
        if (!target) return;

        const visitorId = target.dataset.visitorId;
        if (!visitorId) return;

        if (target.classList.contains('delete-visitor-btn')) {
            deleteVisitor(visitorId);
        }
    });

    loadVisitors();
}

function addVisitor() {
    const name = document.getElementById('visitor-name').value;
    const apartment = document.getElementById('visitor-apartment').value;
    const date = document.getElementById('visitor-date').value;

    if (!name || !apartment || !date) {
        showAlert('Por favor, preencha todos os campos obrigatórios', 'warning');
        return;
    }

    db.collection("visitors").add({
        name: name,
        apartment: apartment,
        date: date,
        registeredBy: currentUser.email
    })
    .then(() => {
        showAlert('Visitante adicionado com sucesso!', 'success');
        document.getElementById('visitor-form').reset();
    })
    .catch((error) => {
        console.error("Erro ao adicionar visitante: ", error);
        showAlert('Erro ao adicionar visitante', 'danger');
    });
}

function loadVisitors() {
    const isAdmin = userRole === 'admin';
    let query = db.collection("visitors");

    if (!isAdmin) {
        query = query.where("apartment", "==", currentUser.email.split('@')[0]);
    }

    if (firestoreListeners.visitors) {
        firestoreListeners.visitors();
    }

    firestoreListeners.visitors = query.orderBy("date", "desc")
        .onSnapshot((querySnapshot) => {
            const visitorsList = document.getElementById("visitors-list");
            
            if (querySnapshot.empty) {
                visitorsList.innerHTML = `
                    <tr>
                        <td colspan="${isAdmin ? 4 : 3}" class="text-center text-muted py-5">
                            <h5>Nenhum visitante registrado</h5>
                        </td>
                    </tr>
                `;
                return;
            }
            
            let html = '';
            querySnapshot.forEach((doc) => {
                const visitor = doc.data();
                html += `
                    <tr class="animate-fade-in">
                        <td>${sanitizeHTML(visitor.name)}</td>
                        <td><span class="badge-premium badge-info-premium">${sanitizeHTML(visitor.apartment)}</span></td>
                        <td>${new Date(visitor.date).toLocaleDateString('pt-BR')}</td>
                        ${isAdmin ? `
                        <td>
                            <div class="btn-group btn-group-sm">
                                <button class="btn btn-premium btn-danger-premium delete-visitor-btn" 
                                        data-visitor-id="${doc.id}"
                                        title="Excluir visitante">
                                    <i class="fas fa-trash"></i>
                                </button>
                            </div>
                        </td>
                        ` : ''}
                    </tr>
                `;
            });
            visitorsList.innerHTML = html;
        });
}

function deleteVisitor(visitorId) {
    if (confirm('Tem certeza que deseja excluir este visitante?')) {
        db.collection("visitors").doc(visitorId).delete()
        .then(() => {
            showAlert('Visitante excluído com sucesso!', 'success');
        })
        .catch((error) => {
            console.error("Erro ao excluir visitante: ", error);
            showAlert('Erro ao excluir visitante', 'danger');
        });
    }
}

export { renderVisitors, addVisitor, deleteVisitor };