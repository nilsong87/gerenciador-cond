import { renderNavigation, setActiveNavItem, showAlert, initGlobalEventListeners, cleanup, firestoreListeners, sanitizeHTML } from './ui.js';
import { userRole, currentUser } from './auth.js';
import { db, storage } from './firebase.js';
import { initAppEventListeners } from '../app.js';

function renderIncidents() {
    cleanup();
    setActiveNavItem('nav-incidents');
    const isAdmin = userRole === 'admin';
    const appContainer = document.getElementById('app');

    appContainer.innerHTML = `
        ${renderNavigation(userRole, currentUser)}
        <div class="container-fluid py-4 animate-fade-in">
            <div class="row mb-4">
                <div class="col-12">
                    <div class="d-flex justify-content-between align-items-center">
                        <h1 class="h3 mb-0 text-gradient">
                            <i class="fas fa-exclamation-triangle me-2"></i>Registrar Ocorrências
                        </h1>
                    </div>
                    <p class="text-muted mb-0">Reporte problemas e acompanhe o status</p>
                </div>
            </div>

            <div class="row mb-4 animate-slide-up">
                <div class="col-lg-12">
                    <div class="card-premium h-100">
                        <div class="card-header-premium">
                            <h5 class="card-title mb-0">
                                <i class="fas fa-plus-circle me-2"></i>Nova Ocorrência
                            </h5>
                        </div>
                        <div class="card-body-premium">
                            <form id="incident-form">
                                <div class="row">
                                    <div class="col-md-6 mb-3">
                                        <label for="incident-title" class="form-label">Título da Ocorrência *</label>
                                        <input type="text" class="form-control-premium" id="incident-title" required>
                                    </div>
                                    <div class="col-md-6 mb-3">
                                        <label for="incident-type" class="form-label">Tipo *</label>
                                        <select class="form-select-premium" id="incident-type" required>
                                            <option value="Barulho">Barulho</option>
                                            <option value="Vazamento">Vazamento</option>
                                            <option value="Manutenção">Manutenção</option>
                                            <option value="Outro">Outro</option>
                                        </select>
                                    </div>
                                </div>
                                <div class="mb-3">
                                    <label for="incident-description" class="form-label">Descrição *</label>
                                    <textarea class="form-control-premium" id="incident-description" rows="3" required></textarea>
                                </div>
                                <div class="mb-3">
                                    <label for="incident-image" class="form-label">Anexar Imagem</label>
                                    <input type="file" class="form-control-premium" id="incident-image" accept="image/*">
                                </div>
                                <div class="d-grid gap-2 d-md-flex justify-content-md-end">
                                    <button type="submit" class="btn btn-premium btn-primary-premium">
                                        <i class="fas fa-plus me-2"></i>Registrar Ocorrência
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
                                <i class="fas fa-list me-2"></i>Minhas Ocorrências
                            </h5>
                        </div>
                        <div class="card-body-premium">
                            <div class="table-responsive">
                                <table class="table table-premium">
                                    <thead>
                                        <tr>
                                            <th>Título</th>
                                            <th>Tipo</th>
                                            <th>Status</th>
                                            <th>Data</th>
                                            ${isAdmin ? '<th>Ações</th>' : ''}
                                        </tr>
                                    </thead>
                                    <tbody id="incidents-list">
                                        <tr>
                                            <td colspan="${isAdmin ? 5 : 4}" class="text-center py-5">
                                                <div class="loading"></div>
                                                <p class="text-muted mt-2">Carregando ocorrências...</p>
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

    const form = document.getElementById('incident-form');
    if (form) {
        form.addEventListener('submit', function(e) {
            e.preventDefault();
            addIncident();
        });
    }
    initGlobalEventListeners();
    initAppEventListeners();

    const incidentsList = document.getElementById('incidents-list');
    incidentsList.addEventListener('click', (e) => {
        const target = e.target.closest('button');
        if (!target) return;

        const incidentId = target.dataset.incidentId;
        if (!incidentId) return;

        if (target.classList.contains('update-status-in-progress-btn')) {
            updateIncidentStatus(incidentId, 'in_progress');
        } else if (target.classList.contains('update-status-resolved-btn')) {
            updateIncidentStatus(incidentId, 'resolved');
        } else if (target.classList.contains('delete-incident-btn')) {
            deleteIncident(incidentId);
        }
    });

    loadIncidents();
}

function addIncident() {
    const title = document.getElementById('incident-title').value;
    const type = document.getElementById('incident-type').value;
    const description = document.getElementById('incident-description').value;
    const imageFile = document.getElementById('incident-image').files[0];

    if (!title || !type || !description) {
        showAlert('Por favor, preencha todos os campos obrigatórios', 'warning');
        return;
    }

    const incident = {
        title: title,
        type: type,
        description: description,
        status: 'open',
        reportedBy: currentUser.email,
        timestamp: firebase.firestore.FieldValue.serverTimestamp()
    };

    if (imageFile) {
        const storageRef = storage.ref(`ocorrencias/${Date.now()}_${imageFile.name}`);
        storageRef.put(imageFile).then(snapshot => {
            snapshot.ref.getDownloadURL().then(downloadURL => {
                incident.imageUrl = downloadURL;
                saveIncident(incident);
            });
        }).catch(error => {
            console.error("Erro ao fazer upload da imagem: ", error);
            showAlert('Erro ao fazer upload da imagem', 'danger');
        });
    } else {
        saveIncident(incident);
    }
}

function saveIncident(incident) {
    db.collection("incidents").add(incident)
    .then(() => {
        showAlert('Ocorrência registrada com sucesso!', 'success');
        document.getElementById('incident-form').reset();
    })
    .catch((error) => {
        console.error("Erro ao registrar ocorrência: ", error);
        showAlert('Erro ao registrar ocorrência', 'danger');
    });
}

function loadIncidents() {
    const isAdmin = userRole === 'admin';
    let query = db.collection("incidents");

    if (!isAdmin) {
        query = query.where("reportedBy", "==", currentUser.email);
    }

    if (firestoreListeners.incidents) {
        firestoreListeners.incidents();
    }

    firestoreListeners.incidents = query.orderBy("timestamp", "desc")
        .onSnapshot((querySnapshot) => {
            const incidentsList = document.getElementById("incidents-list");
            
            if (querySnapshot.empty) {
                incidentsList.innerHTML = `
                    <tr>
                        <td colspan="${isAdmin ? 5 : 4}" class="text-center text-muted py-5">
                            <h5>Nenhuma ocorrência registrada</h5>
                        </td>
                    </tr>
                `;
                return;
            }
            
            let html = '';
            querySnapshot.forEach((doc) => {
                const incident = doc.data();
                html += `
                    <tr class="animate-fade-in">
                        <td>${sanitizeHTML(incident.title)}</td>
                        <td>${sanitizeHTML(incident.type)}</td>
                        <td><span class="badge-premium ${getIncidentStatusClass(incident.status)}">${incident.status}</span></td>
                        <td>${incident.timestamp.toDate().toLocaleDateString('pt-BR')}</td>
                        ${isAdmin ? `
                        <td>
                            <div class="btn-group btn-group-sm">
                                <button class="btn btn-premium btn-success-premium update-status-in-progress-btn" 
                                        data-incident-id="${doc.id}"
                                        title="Marcar como em andamento">
                                    <i class="fas fa-play"></i>
                                </button>
                                <button class="btn btn-premium btn-primary-premium update-status-resolved-btn" 
                                        data-incident-id="${doc.id}"
                                        title="Marcar como resolvido">
                                    <i class="fas fa-check"></i>
                                </button>
                                <button class="btn btn-premium btn-danger-premium delete-incident-btn" 
                                        data-incident-id="${doc.id}"
                                        title="Excluir ocorrência">
                                    <i class="fas fa-trash"></i>
                                </button>
                            </div>
                        </td>
                        ` : ''}
                    </tr>
                `;
            });
            incidentsList.innerHTML = html;
        });
}

function getIncidentStatusClass(status) {
    switch (status) {
        case 'open':
            return 'badge-danger-premium';
        case 'in_progress':
            return 'badge-warning-premium';
        case 'resolved':
            return 'badge-success-premium';
        default:
            return 'badge-secondary-premium';
    }
}

function updateIncidentStatus(incidentId, status) {
    db.collection("incidents").doc(incidentId).update({
        status: status
    })
    .then(() => {
        showAlert('Status da ocorrência atualizado com sucesso!', 'success');
    })
    .catch((error) => {
        console.error("Erro ao atualizar status da ocorrência: ", error);
        showAlert('Erro ao atualizar status da ocorrência', 'danger');
    });
}

function deleteIncident(incidentId) {
    if (confirm('Tem certeza que deseja excluir esta ocorrência?')) {
        db.collection("incidents").doc(incidentId).delete()
        .then(() => {
            showAlert('Ocorrência excluída com sucesso!', 'success');
        })
        .catch((error) => {
            console.error("Erro ao excluir ocorrência: ", error);
            showAlert('Erro ao excluir ocorrência', 'danger');
        });
    }
}

export { renderIncidents, addIncident, updateIncidentStatus, deleteIncident };