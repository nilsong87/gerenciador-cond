import { renderNavigation, setActiveNavItem, showAlert, initGlobalEventListeners, cleanup, firestoreListeners, sanitizeHTML } from './ui.js';
import { userRole } from './auth.js';
import { db } from './firebase.js';

function renderNotices() {
    cleanup();
    setActiveNavItem('nav-notices');
    const isAdmin = userRole === 'admin';
    const appContainer = document.getElementById('app');

    appContainer.innerHTML = `
        ${renderNavigation()}
        <div class="container-fluid py-4 animate-fade-in">
            <div class="row mb-4">
                <div class="col-12">
                    <div class="d-flex justify-content-between align-items-center">
                        <h1 class="h3 mb-0 text-gradient">
                            <i class="fas fa-bullhorn me-2"></i>Mural de Avisos
                        </h1>
                        ${isAdmin ? `
                        <button class="btn btn-premium btn-primary-premium" data-bs-toggle="modal" data-bs-target="#add-notice-modal">
                            <i class="fas fa-plus me-2"></i>Novo Aviso
                        </button>
                        ` : ''}
                    </div>
                    <p class="text-muted mb-0">Fique por dentro das últimas novidades do condomínio</p>
                </div>
            </div>

            <div class="card-premium animate-slide-up">
                <div class="card-header-premium">
                    <h5 class="card-title mb-0"><i class="fas fa-list-alt me-2"></i>Avisos Publicados</h5>
                </div>
                <div class="card-body-premium">
                    <div id="notices-list" class="row">
                        <div class="col-12 text-center py-5">
                            <div class="loading"></div>
                            <p class="text-muted mt-2">Carregando avisos...</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        ${isAdmin ? `
        <div class="modal fade" id="add-notice-modal" tabindex="-1">
            <div class="modal-dialog modal-dialog-centered">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title">Novo Aviso</h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                    </div>
                    <div class="modal-body">
                        <form id="notice-form">
                            <div class="mb-3">
                                <label for="notice-title" class="form-label">Título *</label>
                                <input type="text" class="form-control-premium" id="notice-title" required>
                            </div>
                            <div class="mb-3">
                                <label for="notice-content" class="form-label">Conteúdo *</label>
                                <textarea class="form-control-premium" id="notice-content" rows="5" required></textarea>
                            </div>
                            <div class="d-grid">
                                <button type="submit" class="btn btn-premium btn-primary-premium">Publicar Aviso</button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
        ` : ''}
    `;

    if (isAdmin) {
        const form = document.getElementById('notice-form');
        if (form) {
            form.addEventListener('submit', function(e) {
                e.preventDefault();
                addNotice();
            });
        }
    }

    initGlobalEventListeners();
    loadNotices();
}

function addNotice() {
    const title = document.getElementById('notice-title').value;
    const content = document.getElementById('notice-content').value;

    if (!title || !content) {
        showAlert('Por favor, preencha todos os campos', 'warning');
        return;
    }

    db.collection("notices").add({
        title: title,
        content: content,
        timestamp: firebase.firestore.FieldValue.serverTimestamp()
    })
    .then(() => {
        showAlert('Aviso publicado com sucesso!', 'success');
        const modal = bootstrap.Modal.getInstance(document.getElementById('add-notice-modal'));
        modal.hide();
        document.getElementById('notice-form').reset();
    })
    .catch((error) => {
        console.error("Erro ao publicar aviso: ", error);
        showAlert('Erro ao publicar aviso', 'danger');
    });
}

function loadNotices() {
    if (firestoreListeners.notices) {
        firestoreListeners.notices();
    }

    firestoreListeners.notices = db.collection("notices").orderBy("timestamp", "desc")
        .onSnapshot((querySnapshot) => {
            const noticesList = document.getElementById("notices-list");
            
            if (querySnapshot.empty) {
                noticesList.innerHTML = `
                    <div class="col-12 text-center text-muted py-5">
                        <h5>Nenhum aviso publicado</h5>
                    </div>
                `;
                return;
            }
            
            let html = '';
            querySnapshot.forEach((doc) => {
                const notice = doc.data();
                html += `
                    <div class="col-md-6 col-lg-4 mb-4">
                        <div class="card-premium h-100">
                            <div class="card-body-premium">
                                <h5 class="card-title">${sanitizeHTML(notice.title)}</h5>
                                <p class="card-text">${sanitizeHTML(notice.content)}</p>
                            </div>
                            <div class="card-footer-premium">
                                <small class="text-muted">Publicado em ${notice.timestamp.toDate().toLocaleDateString('pt-BR')}</small>
                            </div>
                        </div>
                    </div>
                `;
            });
            noticesList.innerHTML = html;
        });
}

export { renderNotices, addNotice };