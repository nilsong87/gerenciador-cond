import { db } from './firebase.js';
import { showAlert } from './ui.js';

const COLLECTIONS_TO_BACKUP = ['users', 'packages', 'reservations', 'incidents', 'notices', 'visitors', 'lostAndFound', 'financials'];

function showBackupPanel() {
    const modalId = 'backup-panel-modal';
    if (document.getElementById(modalId)) return;

    const modalHtml = `
        <div id="${modalId}" class="modal-premium confirm-modal show" style="display: block;">
            <div class="modal-backdrop-premium"></div>
            <div class="modal-dialog-premium modal-dialog-centered modal-lg">
                <div class="modal-content-premium animate-bounce-in">
                    <div class="modal-header-premium">
                        <h5 class="modal-title"><i class="fas fa-database me-2"></i>Backup e Restauração</h5>
                        <button type="button" class="btn-close-premium"><i class="fas fa-times"></i></button>
                    </div>
                    <div class="modal-body-premium">
                        <div class="container-fluid">
                            <div class="row">
                                <div class="col-md-6 border-end">
                                    <h5 class="text-gradient"><i class="fas fa-download me-2"></i>Criar Backup</h5>
                                    <p class="text-muted">Crie um backup completo de todas as coleções de dados do sistema em um único arquivo JSON.</p>
                                    <button id="start-backup-btn" class="btn btn-premium btn-primary-premium w-100">
                                        <i class="fas fa-play me-2"></i>Iniciar Novo Backup
                                    </button>
                                    <div id="backup-progress" class="progress mt-3" style="display: none;">
                                        <div class="progress-bar progress-bar-striped progress-bar-animated" role="progressbar" style="width: 0%;"></div>
                                    </div>
                                </div>
                                <div class="col-md-6">
                                    <h5 class="text-gradient"><i class="fas fa-upload me-2"></i>Restaurar a partir de Backup</h5>
                                    <div class="alert alert-danger">
                                        <strong>Atenção:</strong> A restauração substituirá TODOS os dados existentes. Esta ação é irreversível.
                                    </div>
                                    <div class="mb-3">
                                        <label for="backupFile" class="form-label">Arquivo de Backup (.json)</label>
                                        <input type="file" class="form-control-premium" id="backupFile" accept=".json">
                                    </div>
                                    <button id="start-restore-btn" class="btn btn-premium btn-danger-premium w-100" disabled>
                                        <i class="fas fa-exclamation-triangle me-2"></i>Restauração Desabilitada
                                    </button>
                                     <small class="text-muted d-block mt-2">A restauração pelo cliente está desabilitada por segurança. Use o painel do Firebase ou um script de backend.</small>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="modal-footer-premium">
                        <button type="button" class="btn-premium btn-outline-secondary btn-cancel">Fechar</button>
                    </div>
                </div>
            </div>
        </div>
    `;
    document.body.insertAdjacentHTML('beforeend', modalHtml);
    initBackupEventListeners(modalId);
}

function initBackupEventListeners(modalId) {
    const modalElement = document.getElementById(modalId);
    const closeModal = () => modalElement.remove();

    modalElement.querySelector('.btn-close-premium').addEventListener('click', closeModal);
    modalElement.querySelector('.btn-cancel').addEventListener('click', closeModal);
    modalElement.querySelector('.modal-backdrop-premium').addEventListener('click', closeModal);

    document.getElementById('start-backup-btn').addEventListener('click', startBackup);
    // The restore button is disabled, so no listener is needed for it.
}

async function startBackup() {
    const backupButton = document.getElementById('start-backup-btn');
    const progressDiv = document.getElementById('backup-progress');
    const progressBar = progressDiv.querySelector('.progress-bar');

    backupButton.disabled = true;
    backupButton.innerHTML = '<i class="fas fa-spinner fa-spin me-2"></i>Fazendo backup...';
    progressDiv.style.display = 'block';
    progressBar.style.width = '0%';

    showAlert('Iniciando processo de backup...', 'info');

    const backupData = {};
    let progress = 0;
    const progressIncrement = 100 / COLLECTIONS_TO_BACKUP.length;

    try {
        for (const collectionName of COLLECTIONS_TO_BACKUP) {
            const snapshot = await db.collection(collectionName).get();
            backupData[collectionName] = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            progress += progressIncrement;
            progressBar.style.width = `${progress}%`;
        }

        const jsonString = JSON.stringify(backupData, (key, value) => {
            // Convert Firestore Timestamps to ISO strings
            if (value && typeof value.toDate === 'function') {
                return value.toDate().toISOString();
            }
            return value;
        }, 2);

        const blob = new Blob([jsonString], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `backup-condominio-elite-${new Date().toISOString().slice(0, 10)}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

        showAlert('Backup concluído e download iniciado!', 'success');

    } catch (error) {
        console.error("Erro durante o backup: ", error);
        showAlert('Ocorreu um erro durante o backup.', 'danger');
    } finally {
        backupButton.disabled = false;
        backupButton.innerHTML = '<i class="fas fa-play me-2"></i>Iniciar Novo Backup';
        progressDiv.style.display = 'none';
    }
}

// The restore function is intentionally left without implementation on the client-side for security.
// A proper implementation would require a secure backend service.
function startRestore() {
    showAlert('A funcionalidade de restauração a partir do cliente está desativada por motivos de segurança.', 'danger', 10000);
}

export { showBackupPanel };
