import { renderNavigation, setActiveNavItem, showAlert } from './ui.js';
import { userRole, currentUser } from './auth.js';
import { db, storage } from './firebase.js';
import { cleanup } from './dashboard.js';

let firestoreListeners = {};

function renderLostAndFound() {
    cleanup();
    setActiveNavItem('renderLostAndFound()');
    const appContainer = document.getElementById('app');

    appContainer.innerHTML = `
        ${renderNavigation()}
        <div class="container-fluid py-4 animate-fade-in">
            <div class="row mb-4">
                <div class="col-12">
                    <div class="d-flex justify-content-between align-items-center">
                        <h1 class="h3 mb-0 text-gradient">
                            <i class="fas fa-search-location me-2"></i>Achados e Perdidos
                        </h1>
                        <button class="btn btn-premium btn-primary-premium" data-bs-toggle="modal" data-bs-target="#add-item-modal">
                            <i class="fas fa-plus me-2"></i>Adicionar Item
                        </button>
                    </div>
                    <p class="text-muted mb-0">Encontrou algo? Perdeu algo? Registre aqui.</p>
                </div>
            </div>

            <div id="lost-and-found-list" class="row">
                <div class="col-12 text-center py-5">
                    <div class="loading"></div>
                    <p class="text-muted mt-2">Carregando itens...</p>
                </div>
            </div>
        </div>

        <div class="modal fade" id="add-item-modal" tabindex="-1">
            <div class="modal-dialog modal-dialog-centered">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title">Adicionar Item</h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                    </div>
                    <div class="modal-body">
                        <form id="lost-and-found-form">
                            <div class="mb-3">
                                <label for="item-description" class="form-label">Descrição do Item *</label>
                                <input type="text" class="form-control-premium" id="item-description" required>
                            </div>
                            <div class="mb-3">
                                <label for="item-location" class="form-label">Local Encontrado/Perdido *</label>
                                <input type="text" class="form-control-premium" id="item-location" required>
                            </div>
                            <div class="mb-3">
                                <label for="item-image" class="form-label">Anexar Imagem</label>
                                <input type="file" class="form-control-premium" id="item-image" accept="image/*">
                            </div>
                            <div class="d-grid">
                                <button type="submit" class="btn btn-premium btn-primary-premium">Adicionar Item</button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    `;

    const form = document.getElementById('lost-and-found-form');
    if (form) {
        form.addEventListener('submit', function(e) {
            e.preventDefault();
            addItem();
        });
    }

    loadLostAndFound();
}

function addItem() {
    const description = document.getElementById('item-description').value;
    const location = document.getElementById('item-location').value;
    const imageFile = document.getElementById('item-image').files[0];

    if (!description || !location) {
        showAlert('Por favor, preencha todos os campos obrigatórios', 'warning');
        return;
    }

    const item = {
        description: description,
        location: location,
        reportedBy: currentUser.email,
        timestamp: firebase.firestore.FieldValue.serverTimestamp()
    };

    if (imageFile) {
        const storageRef = storage.ref(`lostAndFound/${Date.now()}_${imageFile.name}`);
        storageRef.put(imageFile).then(snapshot => {
            snapshot.ref.getDownloadURL().then(downloadURL => {
                item.imageUrl = downloadURL;
                saveItem(item);
            });
        }).catch(error => {
            console.error("Erro ao fazer upload da imagem: ", error);
            showAlert('Erro ao fazer upload da imagem', 'danger');
        });
    } else {
        saveItem(item);
    }
}

function saveItem(item) {
    db.collection("lostAndFound").add(item)
    .then(() => {
        showAlert('Item adicionado com sucesso!', 'success');
        const modal = bootstrap.Modal.getInstance(document.getElementById('add-item-modal'));
        modal.hide();
        document.getElementById('lost-and-found-form').reset();
    })
    .catch((error) => {
        console.error("Erro ao adicionar item: ", error);
        showAlert('Erro ao adicionar item', 'danger');
    });
}

function loadLostAndFound() {
    if (firestoreListeners.lostAndFound) {
        firestoreListeners.lostAndFound();
    }

    firestoreListeners.lostAndFound = db.collection("lostAndFound").orderBy("timestamp", "desc")
        .onSnapshot((querySnapshot) => {
            const list = document.getElementById("lost-and-found-list");
            
            if (querySnapshot.empty) {
                list.innerHTML = `
                    <div class="col-12 text-center text-muted py-5">
                        <h5>Nenhum item registrado</h5>
                    </div>
                `;
                return;
            }
            
            let html = '';
            querySnapshot.forEach((doc) => {
                const item = doc.data();
                html += `
                    <div class="col-md-6 col-lg-4 mb-4">
                        <div class="card-premium h-100">
                            ${item.imageUrl ? `<img src="${item.imageUrl}" class="card-img-top" alt="${item.description}">` : ''}
                            <div class="card-body-premium">
                                <h5 class="card-title">${item.description}</h5>
                                <p class="card-text">Local: ${item.location}</p>
                            </div>
                            <div class="card-footer-premium">
                                <small class="text-muted">Registrado por: ${item.reportedBy}</small>
                            </div>
                        </div>
                    </div>
                `;
            });
            list.innerHTML = html;
        });
}

export { renderLostAndFound, addItem };