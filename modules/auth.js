import { renderDashboard } from './dashboard.js';
import { showAlert, showLoadingScreen, hideLoadingScreen } from './ui.js';
import { db } from './firebase.js';
import { initAppEventListeners } from '../app.js';

const auth = firebase.auth();
let currentUser = null;
let userRole = null;

async function login() {
    grecaptcha.ready(function() {
        grecaptcha.execute('6LfmCgUsAAAAAKXcF_eZAefnQRPWwy2iBYqyudk6', {action: 'login'}).then(async function(token) {
            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;
            const loginBtn = document.querySelector('.btn-login');

            if (!email || !password) {
                showAlert('Por favor, preencha todos os campos', 'warning');
                return;
            }

            // Animação de loading no botão
            loginBtn.innerHTML = '<i class="fas fa-spinner fa-spin me-2"></i>Entrando...';
            loginBtn.disabled = true;
            loginBtn.style.opacity = '0.8';
            loginBtn.style.transform = 'scale(0.98)';

            try {
                const userCredential = await auth.signInWithEmailAndPassword(email, password);
                currentUser = userCredential.user;

                // Verificar se usuário existe no Firestore
                const userDoc = await db.collection('users').doc(currentUser.uid).get();
                if (userDoc.exists) {
                    userRole = userDoc.data().role;
                    
                    // Atualizar último login
                    await db.collection('users').doc(currentUser.uid).update({
                        lastLogin: firebase.firestore.FieldValue.serverTimestamp()
                    });

                    showLoadingScreen();
                    
                    // Simular carregamento premium
                    setTimeout(() => {
                        renderDashboard();
                        hideLoadingScreen();
                        showAlert(`Bem-vindo de volta, ${currentUser.email.split('@')[0]}!`, 'success');
                    }, 1500);
                } else {
                    throw new Error('Usuário não encontrado no sistema');
                }
            } catch (error) {
                console.error('Erro de login:', error);
                
                // Reset do botão com animação
                loginBtn.innerHTML = '<i class="fas fa-sign-in-alt me-2"></i>Entrar';
                loginBtn.disabled = false;
                loginBtn.style.opacity = '1';
                loginBtn.style.transform = 'scale(1)';
                
                // Mensagens de erro específicas
                let errorMessage = 'Erro ao fazer login';
                switch (error.code) {
                    case 'auth/invalid-email':
                        errorMessage = 'Email inválido. Verifique o formato.';
                        break;
                    case 'auth/user-disabled':
                        errorMessage = 'Esta conta foi desativada.';
                        break;
                    case 'auth/user-not-found':
                        errorMessage = 'Usuário não encontrado.';
                        break;
                    case 'auth/wrong-password':
                        errorMessage = 'Senha incorreta. Tente novamente.';
                        break;
                    case 'auth/too-many-requests':
                        errorMessage = 'Muitas tentativas. Tente novamente mais tarde.';
                        break;
                    case 'auth/network-request-failed':
                        errorMessage = 'Erro de conexão. Verifique sua internet.';
                        break;
                    default:
                        errorMessage = error.message || 'Erro desconhecido';
                }
                
                showAlert(errorMessage, 'danger');
                
                // Adicionar efeito de shake no formulário em caso de erro
                const loginCard = document.querySelector('.login-card');
                if (loginCard) {
                    loginCard.style.animation = 'shake 0.5s ease-in-out';
                    setTimeout(() => {
                        loginCard.style.animation = '';
                    }, 500);
                }
            }
        });
    });
}

async function logout() {
    // Criar modal de confirmação personalizado
    const confirmLogout = await showConfirmModal(
        'Confirmar Saída',
        'Tem certeza que deseja sair do sistema?',
        'Sair',
        'Cancelar'
    );
    
    if (confirmLogout) {
        showAlert('Saindo do sistema...', 'info');
        
        // Animação de saída
        const mainContent = document.querySelector('.main-content');
        if (mainContent) {
            mainContent.style.opacity = '0.7';
            mainContent.style.transform = 'scale(0.95)';
            mainContent.style.transition = 'all 0.5s ease';
        }
        
        setTimeout(async () => {
            try {
                await auth.signOut();
                currentUser = null;
                userRole = null;
                renderLogin();
                const recaptchaBadge = document.querySelector('.g-recaptcha');
                if (recaptchaBadge) {
                    recaptchaBadge.style.display = 'block';
                }
                showAlert('Logout realizado com sucesso!', 'success');
            } catch (error) {
                console.error('Erro no logout:', error);
                showAlert('Erro ao fazer logout', 'danger');
            }
        }, 1000);
    }
}

// Modal de confirmação personalizado
function showConfirmModal(title, message, confirmText, cancelText) {
    return new Promise((resolve) => {
        // Armazena a função de resolução para ser acessada globalmente
        window.confirmModalResolve = resolve;


        const modalId = 'confirm-modal-' + Date.now();
        const modalHtml = `
            <div id="${modalId}" class="modal-premium confirm-modal show" style="display: block;">
                <div class="modal-backdrop-premium"></div>
                <div class="modal-dialog-premium modal-dialog-centered">
                    <div class="modal-content-premium animate-bounce-in">
                        <div class="modal-header-premium">
                            <h5 class="modal-title">
                                <i class="fas fa-exclamation-triangle me-2"></i>${title}
                            </h5>
                            <button type="button" class="btn-close-premium" onclick="closeConfirmModal('${modalId}', false)">
                                <i class="fas fa-times"></i>
                            </button>
                        </div>
                        <div class="modal-body-premium">
                            <div class="text-center py-3">
                                <i class="fas fa-sign-out-alt fa-3x text-warning mb-3"></i>
                                <p class="mb-0">${message}</p>
                            </div>
                        </div>
                        <div class="modal-footer-premium">
                            <button type="button" class="btn-premium btn-outline-primary" onclick="closeConfirmModal('${modalId}', false)">
                                <i class="fas fa-times me-2"></i>${cancelText}
                            </button>
                            <button type="button" class="btn-premium btn-danger-premium" onclick="closeConfirmModal('${modalId}', true)">
                                <i class="fas fa-sign-out-alt me-2"></i>${confirmText}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;

        // Remover modais existentes
        document.querySelectorAll('.modal-premium').forEach(modal => modal.remove());
        
        document.body.insertAdjacentHTML('beforeend', modalHtml);
        
        // Fechar modal ao clicar no backdrop
        const backdrop = document.querySelector(`#${modalId} .modal-backdrop-premium`);
        backdrop.addEventListener('click', () => closeConfirmModal(modalId, false));
        
        // Fechar com ESC
        const escHandler = (e) => {
            if (e.key === 'Escape') {
                closeConfirmModal(modalId, false);
                document.removeEventListener('keydown', escHandler);
            }
        };
        document.addEventListener('keydown', escHandler);
    });
}

// Função global para fechar modal
window.closeConfirmModal = function(modalId, result) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.querySelector('.modal-content-premium').style.animation = 'fadeOut 0.3s ease';
        setTimeout(() => {
            modal.remove();
        }, 300);
    }
    
    // Resolver a promise com o resultado
    if (typeof window.confirmModalResolve === 'function') {
        window.confirmModalResolve(result);
        window.confirmModalResolve = null;
    }
};

function initPremiumApp() {
    showLoadingScreen();

    auth.onAuthStateChanged(async (user) => {
        if (user) {
            currentUser = user;
            try {
                const userDoc = await db.collection('users').doc(user.uid).get();
                
                if (userDoc.exists) {
                    userRole = userDoc.data().role;
                    
                    // Atualizar último login
                    await db.collection('users').doc(user.uid).update({
                        lastLogin: firebase.firestore.FieldValue.serverTimestamp()
                    });
                    
                    renderDashboard();
                } else {
                    // Criar novo usuário no Firestore
                    await db.collection('users').doc(user.uid).set({
                        email: user.email,
                        role: 'resident',
                        apartment: user.email.split('@')[0],
                        name: user.email.split('@')[0],
                        createdAt: firebase.firestore.FieldValue.serverTimestamp(),
                        lastLogin: firebase.firestore.FieldValue.serverTimestamp(),
                        status: 'active'
                    });
                    
                    userRole = 'resident';
                    renderDashboard();
                    showAlert('Conta criada com sucesso! Bem-vindo ao sistema.', 'success');
                }
            } catch (error) {
                console.error('Erro ao verificar usuário:', error);
                showAlert('Erro ao carregar dados do usuário', 'danger');
                renderLogin();
            }
        } else {
            renderLogin();
        }
        
        setTimeout(() => {
            hideLoadingScreen();
        }, 1000);
    });
}

function renderLogin() {
    const appContainer = document.getElementById('app');
    appContainer.innerHTML = `
        <div class="login-container">            
            <div class="login-card animate-bounce-in">
                <div class="login-header">
                    <div class="logo-container">
                        <i class="fas fa-building"></i>
                        <div class="logo-text">
                            <h1>Condomínio Elite</h1>
                            <p class="mb-0">Sistema Premium</p>
                            <small>Gestão Inteligente</small>
                        </div>
                    </div>
                </div>
                <div class="login-body">                    
                    <form id="login-form">
                        <div class="form-group">
                            <label for="email" class="form-label">
                                <i class="fas fa-envelope me-2"></i>Email
                            </label>
                            <div class="input-group-premium">
                                <input type="email" id="email" class="form-control-premium" 
                                       placeholder="seuemail@exemplo.com" required
                                       autocomplete="email">
                                <span class="input-icon">
                                    <i class="fas fa-user"></i>
                                </span>
                            </div>
                        </div>
                        
                        <div class="form-group">
                            <label for="password" class="form-label">
                                <i class="fas fa-lock me-2"></i>Senha
                            </label>
                            <div class="input-group-premium">
                                <input type="password" id="password" class="form-control-premium" 
                                       placeholder="Sua senha" required
                                       autocomplete="current-password">
                                <span class="input-icon">
                                    <i class="fas fa-key"></i>
                                </span>
                            </div>
                        </div>
                        
                        <div class="form-group form-check-premium">
                            <input type="checkbox" class="form-check-input-premium" id="rememberMe">
                            <label class="form-check-label" for="rememberMe">
                                Lembrar-me
                            </label>
                        </div>
                        
                        <button type="submit" class="btn btn-login btn-premium btn-primary-premium">
                            <i class="fas fa-sign-in-alt me-2"></i>Entrar no Sistema
                        </button>
                        
                        <div class="login-footer text-center mt-4">
                            <small class="text-muted">
                                <i class="fas fa-shield-alt me-1"></i>
                                Sistema seguro • v2.0.0
                            </small>
                            <div class="g-recaptcha" data-sitekey="6LfmCgUsAAAAAKXcF_eZAefnQRPWwy2iBYqyudk6" data-size="invisible" data-badge="bottomleft"></div>
                        </div>
                    </form>
                </div>
            </div>
            
            <!-- Efeitos de background animados -->
            <div class="login-background-effects">
                <div class="floating-shape shape-1"></div>
                <div class="floating-shape shape-2"></div>
                <div class="floating-shape shape-3"></div>
            </div>
        </div>
    `;

    // Adicionar listener para o formulário de login
    const loginForm = document.getElementById('login-form');
    if (loginForm) {
        loginForm.addEventListener('submit', (e) => {
            e.preventDefault(); // Previne o recarregamento da página
            login();
        });
    }

    // Focar no campo email automaticamente
    setTimeout(() => {
        const emailInput = document.getElementById('email');
        if (emailInput) {
            emailInput.focus();
        }
    }, 500);
}

// Função para recuperar senha (placeholder)
function resetPassword() {
    const email = document.getElementById('email').value;
    if (!email) {
        showAlert('Digite seu email para recuperar a senha', 'warning');
        return;
    }
    
    showAlert('Funcionalidade de recuperação de senha em desenvolvimento', 'info');
}

// Configuração do Firebase para a app secundária
const firebaseConfig = {
  apiKey: "AIzaSyBLA2bniJbAydLGjG4bxcf3QhwgwoEyNiE",
  authDomain: "gerenciamento-cond.firebaseapp.com",
  projectId: "gerenciamento-cond",
  storageBucket: "gerenciamento-cond.firebasestorage.app",
  messagingSenderId: "830534759941",
  appId: "1:830534759941:web:624a49abc9ab29f05dce6c",
  measurementId: "G-KWY107ZY9M"
};

async function createUserByAdmin(name, email, password, apartment, role) {
    const secondaryAppName = 'user-creation-app';
    let secondaryApp;

    // Garante que o app secundário não seja inicializado mais de uma vez
    if (!firebase.apps.some(app => app.name === secondaryAppName)) {
        secondaryApp = firebase.initializeApp(firebaseConfig, secondaryAppName);
    } else {
        secondaryApp = firebase.app(secondaryAppName);
    }

    const secondaryAuth = secondaryApp.auth();

    try {
        const userCredential = await secondaryAuth.createUserWithEmailAndPassword(email, password);
        const newUser = userCredential.user;

        // Salvar informações adicionais no Firestore
        await db.collection('users').doc(newUser.uid).set({
            name: name,
            email: email,
            apartment: apartment,
            role: role,
            createdAt: firebase.firestore.FieldValue.serverTimestamp(),
            status: 'active'
        });

        // Deslogar o novo usuário da instância secundária
        await secondaryAuth.signOut();
        // Opcional: deletar o app secundário se não for mais usado
        // await secondaryApp.delete();

        return { success: true, message: 'Usuário criado com sucesso!' };
    } catch (error) {
        console.error("Erro ao criar usuário pelo admin: ", error);
        // Opcional: deletar o app secundário em caso de erro
        // await secondaryApp.delete();
        return { success: false, message: error.message };
    }
}

// Exportar funções globais
export { 
    auth, 
    currentUser, 
    userRole, 
    login, 
    logout, 
    initPremiumApp, 
    renderLogin,
    resetPassword,
    createUserByAdmin
};

// Tornar funções globais para uso no HTML
window.login = login;
window.logout = logout;
window.resetPassword = resetPassword;
window.closeConfirmModal = closeConfirmModal;