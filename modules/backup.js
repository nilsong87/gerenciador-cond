import { db } from './firebase.js';
import { showAlert } from './ui.js';

function showBackupPanel() {
    const modalId = 'backup-panel-modal';
    const modalHtml = `
        <div id="${modalId}" class="modal-premium confirm-modal show" style="display: block;">
            <div class="modal-backdrop-premium" onclick="closeModal('${modalId}')"></div>
            <div class="modal-dialog-premium modal-dialog-centered modal-lg">
                <div class="modal-content-premium animate-bounce-in">
                    <div class="modal-header-premium">
                        <h5 class="modal-title"><i class="fas fa-database me-2"></i>Backup e Restauração</h5>
                        <button type="button" class="btn-close-premium" onclick="closeModal('${modalId}')"><i class="fas fa-times"></i></button>
                    </div>
                    <div class="modal-body-premium">
                        <div class="container-fluid">
                            <div class="row">
                                <div class="col-md-6">
                                    <h5>Backup</h5>
                                    <p>Crie um backup de todos os dados do sistema.</p>
                                    <button class="btn btn-premium btn-primary-premium" onclick="startBackup()"><i class="fas fa-play me-2"></i>Iniciar Novo Backup</button>
                                    <hr>
                                    <h6>Backups Anteriores</h6>
                                    <ul class="list-group">
                                        <li class="list-group-item d-flex justify-content-between align-items-center">
                                            backup-2025-11-07.json
                                            <a href="#" class="btn btn-sm btn-outline-primary"><i class="fas fa-download"></i></a>
                                        </li>
                                        <li class="list-group-item d-flex justify-content-between align-items-center">
                                            backup-2025-10-20.json
                                            <a href="#" class="btn btn-sm btn-outline-primary"><i class="fas fa-download"></i></a>
                                        </li>
                                    </ul>
                                </div>
                                <div class="col-md-6">
                                    <h5>Restauração</h5>
                                    <p>Restaure os dados a partir de um arquivo de backup.</p>
                                    <div class="mb-3">
                                        <label for="backupFile" class="form-label">Arquivo de Backup (.json)</label>
                                        <input type="file" class="form-control" id="backupFile" accept=".json">
                                    </div>
                                    <button class="btn btn-premium btn-danger-premium" onclick="startRestore()"><i class="fas fa-upload me-2"></i>Restaurar a partir de Arquivo</button>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="modal-footer-premium">
                        <button type="button" class="btn-premium btn-outline-primary" onclick="closeModal('${modalId}')">Fechar</button>
                    </div>
                </div>
            </div>
        </div>
    `;
    document.body.insertAdjacentHTML('beforeend', modalHtml);
}

window.closeModal = function(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.remove();
    }
}

window.startBackup = function() {
    showAlert('Iniciando backup...', 'info');
    // In a real application, this would trigger a server-side function to export Firestore data.
    // For this example, we'll simulate a download.
    const data = { message: "This is a simulated backup file." };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `backup-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    showAlert('Backup gerado com sucesso!', 'success');
}

window.startRestore = function() {
    const fileInput = document.getElementById('backupFile');
    if (fileInput.files.length === 0) {
        showAlert('Por favor, selecione um arquivo de backup.', 'warning');
        return;
    }
    showAlert('Iniciando restauração...', 'info');
    // In a real application, this would require a secure server-side implementation.
    // It's a destructive and dangerous operation to be exposed on the client-side.
    showAlert('Funcionalidade de restauração não implementada por razões de segurança.', 'danger');
}

export { showBackupPanel };
