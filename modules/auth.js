import { renderDashboard } from './dashboard.js';
import { showAlert, showLoadingScreen, hideLoadingScreen } from './ui.js';
import { db } from './firebase.js';

const auth = firebase.auth();
let currentUser = null;
let userRole = null;

async function login() {
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const loginBtn = document.querySelector('.btn-login');

    if (!email || !password) {
        showAlert('Por favor, preencha todos os campos', 'warning');
        return;
    }

    loginBtn.innerHTML = '<i class="fas fa-spinner fa-spin me-2"></i>Entrando...';
    loginBtn.disabled = true;

    try {
        const userCredential = await auth.signInWithEmailAndPassword(email, password);
        currentUser = userCredential.user;

        const userDoc = await db.collection('users').doc(currentUser.uid).get();
        if (userDoc.exists) {
            userRole = userDoc.data().role;
            showLoadingScreen();
            setTimeout(() => {
                renderDashboard();
                hideLoadingScreen();
            }, 1000);
        } else {
            throw new Error('Usuário não encontrado no sistema');
        }
    } catch (error) {
        showAlert(`Erro: ${error.message}`, 'danger');
        loginBtn.innerHTML = '<i class="fas fa-sign-in-alt me-2"></i>Entrar';
        loginBtn.disabled = false;
    }
}

function logout() {
    if (confirm('Tem certeza que deseja sair do sistema?')) {
        showAlert('Saindo do sistema...', 'info');
        setTimeout(() => {
            auth.signOut().then(() => {
                currentUser = null;
                userRole = null;
                renderLogin();
            });
        }, 1000);
    }
}

function initPremiumApp() {
    showLoadingScreen();

    auth.onAuthStateChanged((user) => {
        if (user) {
            currentUser = user;
            db.collection('users').doc(user.uid).get()
                .then((doc) => {
                    if (doc.exists) {
                        userRole = doc.data().role;
                        renderDashboard();
                    } else {
                        db.collection('users').doc(user.uid).set({
                            email: user.email,
                            role: 'resident',
                            apartment: user.email.split('@')[0],
                            createdAt: firebase.firestore.FieldValue.serverTimestamp(),
                            lastLogin: firebase.firestore.FieldValue.serverTimestamp()
                        }).then(() => {
                            userRole = 'resident';
                            renderDashboard();
                        });
                    }
                });
        } else {
            renderLogin();
        }
        hideLoadingScreen();
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
                            <p>Sistema Premium</p>
                        </div>
                    </div>
                </div>
                <div class="login-body">
                    <div class="form-group">
                        <label for="email" class="form-label">Email</label>
                        <input type="email" id="email" class="form-control" placeholder="seuemail@exemplo.com" required>
                    </div>
                    <div class="form-group">
                        <label for="password" class="form-label">Senha</label>
                        <input type="password" id="password" class="form-control" placeholder="Sua senha" required>
                    </div>
                    <button class="btn btn-login" onclick="login()">
                        <i class="fas fa-sign-in-alt me-2"></i>Entrar
                    </button>
                </div>
            </div>
        </div>
    `;
}

export { auth, currentUser, userRole, login, logout, initPremiumApp, renderLogin };