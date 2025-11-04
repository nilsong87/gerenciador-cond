// Firebase Configuration
const firebaseConfig = {
    apiKey: "AIzaSyBLA2bniJbAydLGjG4bxcf3QhwgwoEyNiE",
    authDomain: "gerenciamento-cond.firebaseapp.com",
    projectId: "gerenciamento-cond",
    storageBucket: "gerenciamento-cond.firebasestorage.app",
    messagingSenderId: "830534759941",
    appId: "1:830534759941:web:624a49abc9ab29f05dce6c",
    measurementId: "G-KWY107ZY9M"
};

// Initialize Firebase
const app = firebase.initializeApp(firebaseConfig);
const analytics = firebase.analytics();
const auth = firebase.auth();
const db = firebase.firestore();

const appContainer = document.getElementById('app');
let currentUser = null;
let userRole = null;

// Render Login Screen
function renderLogin() {
    appContainer.innerHTML = `
        <div class="login-container">
            <div class="row justify-content-center align-items-center min-vh-100">
                <div class="col-md-6 col-lg-4">
                    <div class="card shadow-lg">
                        <div class="card-body p-5">
                            <div class="text-center mb-4">
                                <div class="logo-container mb-3">
                                    <img src="images/logo2.png" alt="Condomínio Premium Logo" class="img-fluid">
                                </div>
                                <p class="text-muted">Faça login para continuar</p>
                            </div>
                            
                            <div class="mb-3">
                                <label for="email" class="form-label">Email</label>
                                <div class="input-group">
                                    <span class="input-group-text"><i class="fas fa-envelope"></i></span>
                                    <input type="email" class="form-control" id="email" placeholder="seu@email.com">
                                </div>
                            </div>
                            
                            <div class="mb-4">
                                <label for="password" class="form-label">Senha</label>
                                <div class="input-group">
                                    <span class="input-group-text"><i class="fas fa-lock"></i></span>
                                    <input type="password" class="form-control" id="password" placeholder="Sua senha">
                                </div>
                            </div>
                            
                            <button type="button" class="btn btn-primary w-100 mb-3" onclick="login()">
                                <i class="fas fa-sign-in-alt me-2"></i>Entrar
                            </button>
                            
                            <div class="text-center">
                                <small class="text-muted">Sistema de gerenciamento premium</small>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;
}

// Login Function
async function login() {
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    try {
        const userCredential = await auth.signInWithEmailAndPassword(email, password);
        currentUser = userCredential.user;
        
        // Get user role from Firestore
        const userDoc = await db.collection('users').doc(currentUser.uid).get();
        if (userDoc.exists) {
            userRole = userDoc.data().role;
            renderDashboard();
        } else {
            throw new Error('Usuário não encontrado no sistema');
        }
    } catch (error) {
        alert(`Erro: ${error.message}`);
    }
}

// Logout Function
function logout() {
    auth.signOut().then(() => {
        currentUser = null;
        userRole = null;
        renderLogin();
    });
}

// Navigation Component
function renderNavigation() {
    const isAdmin = userRole === 'admin';
    
    return `
        <nav class="navbar navbar-expand-lg navbar-dark bg-primary">
    <div class="container-fluid">
        <a class="navbar-brand d-flex align-items-center ms-3" href="#" onclick="renderDashboard()">
            <img src="images/logo2.png" alt="Condomínio Premium Logo" class="img-fluid">
            <span>Condomínio Premium</span>
        </a>
        
        <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav">
            <span class="navbar-toggler-icon"></span>
        </button>
        
        <div class="collapse navbar-collapse" id="navbarNav">
            <ul class="navbar-nav mx-auto gap-2">
    <li class="nav-item">
        <a class="nav-link py-0" href="#" onclick="renderDashboard()">
            <i class="fas fa-tachometer-alt me-1"></i>Dashboard
        </a>
    </li>
    <li class="nav-item">
        <a class="nav-link py-0" href="#" onclick="renderPackages()">
            <i class="fas fa-box me-1"></i>Encomendas
        </a>
    </li>
    <li class="nav-item">
        <a class="nav-link py-0" href="#" onclick="renderReservations()">
            <i class="fas fa-calendar-alt me-1"></i>Reservas
        </a>
    </li>
    <li class="nav-item">
        <a class="nav-link py-0" href="#" onclick="renderVisitors()">
            <i class="fas fa-users me-1"></i>Visitantes
        </a>
    </li>
    <li class="nav-item">
        <a class="nav-link py-0" href="#" onclick="renderIncidents()">
            <i class="fas fa-exclamation-triangle me-1"></i>Ocorrências
        </a>
    </li>
    <li class="nav-item">
        <a class="nav-link py-0" href="#" onclick="renderNotices()">
            <i class="fas fa-bullhorn me-1"></i>Avisos
        </a>
    </li>
    <li class="nav-item">
        <a class="nav-link py-0" href="#" onclick="renderLostAndFound()">
            <i class="fas fa-search-location me-1"></i>Achados e Perdidos
        </a>
    </li>
    ${isAdmin ? `
    <li class="nav-item">
        <a class="nav-link py-0" href="#" onclick="renderAdmin()">
            <i class="fas fa-cogs me-1"></i>Administração
        </a>
    </li>
    ` : ''}
</ul>
            
            <ul class="navbar-nav me-3">
                <li class="nav-item">
                    <a class="nav-link py-0" href="#" onclick="markNoticesAsRead(); renderNotices();">
                        <i id="notification-bell" class="fas fa-bell me-2"></i>
                    </a>
                </li>
                <li class="nav-item dropdown">
                    <a class="nav-link py-0 dropdown-toggle" href="#" role="button" data-bs-toggle="dropdown">
                        <i class="fas fa-user me-1"></i>${currentUser.email}
                    </a>
                    <ul class="dropdown-menu dropdown-menu-end">
                        <li><span class="dropdown-item-text">
                            <small>${isAdmin ? 'Administrador' : 'Morador'}</small>
                        </span></li>
                        <li><hr class="dropdown-divider"></li>
                        <li><a class="dropdown-item" href="#" onclick="logout()">
                            <i class="fas fa-sign-out-alt me-1"></i>Sair
                        </a></li>
                    </ul>
                </li>
            </ul>
        </div>
    </div>
</nav>
    `;
}

// Dashboard
function renderDashboard() {
    const isAdmin = userRole === 'admin';
    
    appContainer.innerHTML = `
        ${renderNavigation()}
        <div class="container-fluid py-4">
            <div class="row">
                <div class="col-12">
                    <h1 class="h3 mb-4">
                        <i class="fas fa-tachometer-alt me-2"></i>Dashboard
                    </h1>
                </div>
            </div>
            
            <!-- Statistics Cards -->
            <div class="row mb-4">
                <div class="col-md-3 mb-3">
                    <div class="card bg-primary text-white">
                        <div class="card-body">
                            <div class="d-flex justify-content-between">
                                <div>
                                    <h4 id="pending-packages">0</h4>
                                    <p class="mb-0">Encomendas Pendentes</p>
                                </div>
                                <div class="align-self-center">
                                    <i class="fas fa-box fa-2x"></i>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                
                <div class="col-md-3 mb-3">
                    <div class="card bg-success text-white">
                        <div class="card-body">
                            <div class="d-flex justify-content-between">
                                <div>
                                    <h4 id="today-reservations">0</h4>
                                    <p class="mb-0">Reservas Hoje</p>
                                </div>
                                <div class="align-self-center">
                                    <i class="fas fa-calendar-alt fa-2x"></i>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                
                <div class="col-md-3 mb-3">
                    <div class="card bg-warning text-dark">
                        <div class="card-body">
                            <div class="d-flex justify-content-between">
                                <div>
                                    <h4 id="pending-visitors">0</h4>
                                    <p class="mb-0">Visitantes Hoje</p>
                                </div>
                                <div class="align-self-center">
                                    <i class="fas fa-users fa-2x"></i>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                
                <div class="col-md-3 mb-3">
                    <div class="card bg-danger text-white">
                        <div class="card-body">
                            <div class="d-flex justify-content-between">
                                <div>
                                    <h4 id="open-incidents">0</h4>
                                    <p class="mb-0">Ocorrências Abertas</p>
                                </div>
                                <div class="align-self-center">
                                    <i class="fas fa-exclamation-triangle fa-2x"></i>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            
            ${isAdmin ? `
            <div class="row d-flex align-items-stretch">
                <div class="col-md-6">
                    <div class="card h-100">
                        <div class="card-header">
                            <h5 class="card-title mb-0">Reservas por Mês</h5>
                        </div>
                        <div class="card-body">
                            <canvas id="reservationsChart"></canvas>
                        </div>
                    </div>
                </div>
                <div class="col-md-6">
                    <div class="card h-100">
                        <div class="card-header">
                            <h5 class="card-title mb-0">Ocorrências por Tipo</h5>
                        </div>
                        <div class="card-body">
                            <canvas id="incidentsChart"></canvas>
                        </div>
                    </div>
                </div>
            </div>
            ` : ''}

            <!-- Recent Activity -->
            <div class="row mt-4">
                <div class="col-md-6">
                    <div class="card">
                        <div class="card-header">
                            <h5 class="card-title mb-0">
                                <i class="fas fa-clock me-2"></i>Atividade Recente
                            </h5>
                        </div>
                        <div class="card-body">
                            <div id="recent-activity" class="activity-feed">
                                <!-- Activity items will be loaded here -->
                            </div>
                        </div>
                    </div>
                </div>
                
                <div class="col-md-6">
                    <div class="card">
                        <div class="card-header">
                            <h5 class="card-title mb-0">
                                <i class="fas fa-bell me-2"></i>Notificações
                            </h5>
                        </div>
                        <div class="card-body">
<div id="dashboard-notifications-list">
                                <!-- Notifications will be loaded here -->
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    loadDashboardData();
}

async function loadRecentActivity() {
    const activityFeed = document.getElementById('recent-activity');
    if (!activityFeed) return;
    activityFeed.innerHTML = '<div class="loading"></div>';

    const isAdmin = userRole === 'admin';
    const activities = [];

    try {
        let reservationsPromise, incidentsPromise, packagesPromise;

        if (isAdmin) {
            reservationsPromise = db.collection('reservations').orderBy('timestamp', 'desc').limit(5).get();
            incidentsPromise = db.collection('incidents').orderBy('timestamp', 'desc').limit(5).get();
            packagesPromise = db.collection('packages').orderBy('timestamp', 'desc').limit(5).get();
        } else {
            const userEmail = currentUser.email;
            const userApartment = userEmail.split('@')[0];
            reservationsPromise = db.collection('reservations').where('user', '==', userEmail).orderBy('timestamp', 'desc').limit(5).get();
            incidentsPromise = db.collection('incidents').where('reportedBy', '==', userEmail).orderBy('timestamp', 'desc').limit(5).get();
            packagesPromise = db.collection('packages').where('apartment', '==', userApartment).orderBy('timestamp', 'desc').limit(5).get();
        }

        const [reservationsSnap, incidentsSnap, packagesSnap] = await Promise.all([reservationsPromise, incidentsPromise, packagesPromise]);

        reservationsSnap.forEach(doc => {
            const data = doc.data();
            if (data.timestamp) {
                activities.push({
                    type: 'Reserva',
                    icon: 'fa-calendar-alt',
                    color: 'text-success',
                    text: `Nova reserva para ${data.area} por ${data.user.split('@')[0]}.`,
                    timestamp: data.timestamp.toDate()
                });
            }
        });

        incidentsSnap.forEach(doc => {
            const data = doc.data();
            if (data.timestamp) {
                activities.push({
                    type: 'Ocorrência',
                    icon: 'fa-exclamation-triangle',
                    color: 'text-danger',
                    text: `Nova ocorrência: "${data.title}" por ${data.reportedBy.split('@')[0]}.`,
                    timestamp: data.timestamp.toDate()
                });
            }
        });

        packagesSnap.forEach(doc => {
            const data = doc.data();
            if (data.timestamp) {
                activities.push({
                    type: 'Encomenda',
                    icon: 'fa-box',
                    color: 'text-primary',
                    text: `Nova encomenda para ${data.apartment} - ${data.recipient || data.description}.`,
                    timestamp: data.timestamp.toDate()
                });
            }
        });

        // Sort activities by timestamp descending and take the top 5
        activities.sort((a, b) => b.timestamp - a.timestamp);
        const recentActivities = activities.slice(0, 5);

        if (recentActivities.length === 0) {
            activityFeed.innerHTML = '<p class="text-muted text-center py-3">Nenhuma atividade recente.</p>';
            return;
        }

        activityFeed.innerHTML = recentActivities.map(activity => `
            <div class="activity-item d-flex">
                <div class="flex-shrink-0 pt-1">
                    <i class="fas ${activity.icon} ${activity.color} fa-lg"></i>
                </div>
                <div class="flex-grow-1 ms-3">
                    <p class="mb-0">${activity.text}</p>
                    <small class="text-muted">${activity.timestamp.toLocaleDateString('pt-BR')} ${activity.timestamp.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</small>
                </div>
            </div>
        `).join('');

    } catch (error) {
        console.error("Error loading recent activity: ", error);
        activityFeed.innerHTML = '<p class="text-danger text-center py-3">Erro ao carregar atividades.</p>';
    }
}

function loadDashboardNotifications() {
    const notificationsList = document.getElementById('dashboard-notifications-list');
    if (!notificationsList) return;

    db.collection("notices").orderBy("timestamp", "desc").limit(5)
        .onSnapshot((querySnapshot) => {
            
            if (querySnapshot.empty) {
                notificationsList.innerHTML = '<p class="text-muted text-center py-3">Nenhuma notificação.</p>';
                return;
            }
            notificationsList.innerHTML = ""; // Clear previous list
            const listGroup = document.createElement('div');
            listGroup.className = 'list-group';

            querySnapshot.forEach((doc) => {
                const notice = doc.data();
                const date = notice.timestamp?.toDate().toLocaleDateString('pt-BR') || 'N/A';
                const item = document.createElement('a');
                item.href = '#';
                item.className = 'list-group-item list-group-item-action';
                item.onclick = () => renderNotices();
                item.innerHTML = `
                    <div class="d-flex w-100 justify-content-between">
                        <h6 class="mb-1">${notice.title}</h6>
                        <small>${date}</small>
                    </div>
                    <p class="mb-1 small">${notice.content.substring(0, 80)}...</p>
                `;
                listGroup.appendChild(item);
            });
            notificationsList.appendChild(listGroup);
        }, error => {
            console.error("Error loading dashboard notifications: ", error);
            notificationsList.innerHTML = '<p class="text-danger text-center py-3">Erro ao carregar notificações.</p>';
        });
}


// Load Dashboard Data
function loadDashboardData() {
    const today = new Date().toISOString().split('T')[0];
    const isAdmin = userRole === 'admin';
    
    // Load pending packages
    db.collection("packages").where("delivered", "==", false)
        .onSnapshot(snapshot => {
            const element = document.getElementById('pending-packages');
            if (element) element.textContent = snapshot.size;
        });
    
    // Load today's reservations
    db.collection("reservations").where("date", "==", today)
        .onSnapshot(snapshot => {
            const element = document.getElementById('today-reservations');
            if (element) element.textContent = snapshot.size;
        });
    
    // Load today's visitors
    db.collection("visitors").where("date", "==", today)
        .onSnapshot(snapshot => {
            const element = document.getElementById('pending-visitors');
            if (element) element.textContent = snapshot.size;
        });
    
    // Load open incidents
    db.collection("incidents").where("status", "==", "open")
        .onSnapshot(snapshot => {
            const element = document.getElementById('open-incidents');
            if (element) element.textContent = snapshot.size;
        });

    // Load dashboard widgets
    loadRecentActivity();
    loadDashboardNotifications();

    if (isAdmin) {
        // Load monthly reservations chart
        db.collection("reservations").get().then(snapshot => {
            const reservationsByMonth = {};
            snapshot.forEach(doc => {
                const reservation = doc.data();
                const month = new Date(reservation.date).getMonth();
                reservationsByMonth[month] = (reservationsByMonth[month] || 0) + 1;
            });

            const reservationsChartCtx = document.getElementById('reservationsChart').getContext('2d');
            const reservationsGradient = reservationsChartCtx.createLinearGradient(0, 0, 0, 400);
            reservationsGradient.addColorStop(0, 'rgba(54, 162, 235, 0.8)');
            reservationsGradient.addColorStop(1, 'rgba(54, 162, 235, 0.2)');

            new Chart(reservationsChartCtx, {
                type: 'bar',
                data: {
                    labels: ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'],
                    datasets: [{
                        label: 'Nº de Reservas',
                        data: Object.values(reservationsByMonth),
                        backgroundColor: reservationsGradient,
                        borderColor: 'rgba(54, 162, 235, 1)',
                        borderWidth: 1,
                        borderRadius: 5
                    }]
                },
                options: {
                    maintainAspectRatio: false,
                    plugins: {
                        title: {
                            display: true,
                            text: 'Reservas Mensais',
                            font: {
                                size: 18
                            }
                        }
                    },
                    scales: {
                        y: {
                            beginAtZero: true
                        }
                    }
                }
            });
        });

        // Load incidents by type chart
        db.collection("incidents").get().then(snapshot => {
            const incidentsByType = {};
            snapshot.forEach(doc => {
                const incident = doc.data();
                incidentsByType[incident.type] = (incidentsByType[incident.type] || 0) + 1;
            });

            const incidentsChartCtx = document.getElementById('incidentsChart').getContext('2d');
            new Chart(incidentsChartCtx, {
                type: 'doughnut',
                data: {
                    labels: Object.keys(incidentsByType),
                    datasets: [{
                        label: 'Nº de Ocorrências',
                        data: Object.values(incidentsByType),
                        backgroundColor: [
                            '#2c3e50',
                            '#e74c3c',
                            '#f39c12',
                            '#3498db',
                            '#9b59b6',
                            '#1abc9c'
                        ],
                        borderColor: '#ffffff',
                        borderWidth: 2
                    }]
                },
                options: {
                    maintainAspectRatio: false,
                    plugins: {
                        title: {
                            display: true,
                            text: 'Ocorrências por Tipo',
                            font: {
                                size: 18
                            }
                        }
                    }
                }
            });
        });
    }
}

// Packages Management
function renderPackages() {
    const isAdmin = userRole === 'admin';
    
    appContainer.innerHTML = `
        ${renderNavigation()}
        <div class="container-fluid py-4">
            <div class="row">
                <div class="col-12">
                    <h1 class="h3 mb-4">
                        <i class="fas fa-box me-2"></i>Gerenciar Encomendas
                    </h1>
                </div>
            </div>
            
            ${isAdmin ? `
            <div class="row mb-4">
                <div class="col-md-6">
                    <div class="card">
                        <div class="card-header">
                            <h5 class="card-title mb-0">Adicionar Encomenda</h5>
                        </div>
                        <div class="card-body">
                            <div class="mb-3">
                                <label for="package-description" class="form-label">Descrição</label>
                                <input type="text" class="form-control" id="package-description" placeholder="Ex: Pacote da Amazon">
                            </div>
                            <div class="mb-3">
                                <label for="package-apartment" class="form-label">Apartamento</label>
                                <input type="text" class="form-control" id="package-apartment" placeholder="Ex: 101">
                            </div>
                            <div class="mb-3">
                                <label for="package-recipient" class="form-label">Destinatário</label>
                                <input type="text" class="form-control" id="package-recipient" placeholder="Nome do morador">
                            </div>
                            <button type="button" class="btn btn-primary" onclick="addPackage()">
                                <i class="fas fa-plus me-1"></i>Adicionar Encomenda
                            </button>
                        </div>
                    </div>
                </div>
            </div>
            ` : ''}
            
            <div class="row">
                <div class="col-12">
                    <div class="card">
                        <div class="card-header">
                            <h5 class="card-title mb-0">Encomendas Pendentes</h5>
                        </div>
                        <div class="card-body">
                            <div class="table-responsive">
                                <table class="table table-striped">
                                    <thead>
                                        <tr>
                                            <th>Descrição</th>
                                            <th>Apartamento</th>
                                            <th>Destinatário</th>
                                            <th>Data de Recebimento</th>
                                            ${isAdmin ? '<th>Ações</th>' : ''}
                                        </tr>
                                    </thead>
                                    <tbody id="packages-list">
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;

    loadPackages();
}

function loadPackages() {
    const isAdmin = userRole === 'admin';
    let query = db.collection("packages").where("delivered", "==", false);
    
    if (!isAdmin) {
        // Residents can only see their own packages
        query = query.where("apartment", "==", currentUser.email.split('@')[0]);
    }
    
    query.orderBy("timestamp", "desc")
        .onSnapshot((querySnapshot) => {
            const packagesList = document.getElementById("packages-list");
            packagesList.innerHTML = "";
            
            if (querySnapshot.empty) {
                packagesList.innerHTML = `
                    <tr>
                        <td colspan="${isAdmin ? 5 : 4}" class="text-center text-muted py-4">
                            <i class="fas fa-box-open fa-2x mb-2"></i><br>
                            Nenhuma encomenda pendente
                        </td>
                    </tr>
                `;
                return;
            }
            
            querySnapshot.forEach((doc) => {
                const package = doc.data();
                const date = package.timestamp?.toDate().toLocaleDateString('pt-BR') || 'N/A';
                
                const row = document.createElement("tr");
                row.innerHTML = `
                    <td>${package.description}</td>
                    <td>${package.apartment}</td>
                    <td>${package.recipient || '-'}</td>
                    <td>${date}</td>
                    ${isAdmin ? `
                    <td>
                        <button class="btn btn-success btn-sm" onclick="deliverPackage('${doc.id}')">
                            <i class="fas fa-check me-1"></i>Entregue
                        </button>
                    </td>
                    ` : ''}
                `;
                packagesList.appendChild(row);
            });
        });
}

function addPackage() {
    const description = document.getElementById('package-description').value;
    const apartment = document.getElementById('package-apartment').value;
    const recipient = document.getElementById('package-recipient').value;

    if (!description || !apartment) {
        alert('Por favor, preencha todos os campos obrigatórios');
        return;
    }

    db.collection("packages").add({
        description: description,
        apartment: apartment,
        recipient: recipient,
        delivered: false,
        timestamp: firebase.firestore.FieldValue.serverTimestamp()
    })
    .then(() => {
        document.getElementById('package-description').value = '';
        document.getElementById('package-apartment').value = '';
        document.getElementById('package-recipient').value = '';
        showAlert('Encomenda adicionada com sucesso!', 'success');
    })
    .catch((error) => {
        console.error("Erro ao adicionar encomenda: ", error);
        showAlert('Erro ao adicionar encomenda', 'danger');
    });
}

function deliverPackage(packageId) {
    db.collection("packages").doc(packageId).update({
        delivered: true,
        deliveredAt: firebase.firestore.FieldValue.serverTimestamp()
    })
    .then(() => {
        showAlert('Encomenda marcada como entregue!', 'success');
    })
    .catch((error) => {
        console.error("Erro ao entregar encomenda: ", error);
        showAlert('Erro ao marcar encomenda como entregue', 'danger');
    });
}

// Reservations Management
function renderReservations() {
    appContainer.innerHTML = `
        ${renderNavigation()}
        <div class="container-fluid py-4">
            <div class="row">
                <div class="col-12">
                    <h1 class="h3 mb-4">
                        <i class="fas fa-calendar-alt me-2"></i>Gerenciar Reservas
                    </h1>
                </div>
            </div>
            
            <div class="row mb-4">
                <div class="col-md-6">
                    <div class="card">
                        <div class="card-header">
                            <h5 class="card-title mb-0">Nova Reserva</h5>
                        </div>
                        <div class="card-body">
                            <div class="mb-3">
                                <label for="reservation-area" class="form-label">Área Comum</label>
                                <select class="form-select" id="reservation-area">
                                    <option value="">Selecione uma área</option>
                                    <option value="Salão de Festas">Salão de Festas</option>
                                    <option value="Churrasqueira">Churrasqueira</option>
                                    <option value="Quadra de Esportes">Quadra de Esportes</option>
                                    <option value="Piscina">Piscina</option>
                                    <option value="Salão de Jogos">Salão de Jogos</option>
                                </select>
                            </div>
                            <div class="mb-3">
                                <label for="reservation-date" class="form-label">Data</label>
                                <input type="date" class="form-control" id="reservation-date" min="${new Date().toISOString().split('T')[0]}">
                            </div>
                            <div class="mb-3">
                                <label for="reservation-time" class="form-label">Horário</label>
                                <select class="form-select" id="reservation-time">
                                    <option value="08:00-10:00">08:00 - 10:00</option>
                                    <option value="10:00-12:00">10:00 - 12:00</option>
                                    <option value="14:00-16:00">14:00 - 16:00</option>
                                    <option value="16:00-18:00">16:00 - 18:00</option>
                                    <option value="18:00-20:00">18:00 - 20:00</option>
                                    <option value="20:00-22:00">20:00 - 22:00</option>
                                </select>
                            </div>
                            <button type="button" class="btn btn-primary" onclick="addReservation()">
                                <i class="fas fa-plus me-1"></i>Fazer Reserva
                            </button>
                        </div>
                    </div>
                </div>
            </div>
            
            <div class="row">
                <div class="col-12">
                    <div class="card">
                        <div class="card-header">
                            <h5 class="card-title mb-0">Minhas Reservas</h5>
                        </div>
                        <div class="card-body">
                            <div class="table-responsive">
                                <table class="table table-striped">
                                    <thead>
                                        <tr>
                                            <th>Área</th>
                                            <th>Data</th>
                                            <th>Horário</th>
                                            <th>Status</th>
                                            <th>Ações</th>
                                        </tr>
                                    </thead>
                                    <tbody id="reservations-list">
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;

    loadReservations();
}

function loadReservations() {
    db.collection("reservations")
        .where("user", "==", currentUser.email)
        .orderBy("date", "desc")
        .onSnapshot((querySnapshot) => {
            const reservationsList = document.getElementById("reservations-list");
            reservationsList.innerHTML = "";
            
            if (querySnapshot.empty) {
                reservationsList.innerHTML = `
                    <tr>
                        <td colspan="5" class="text-center text-muted py-4">
                            <i class="fas fa-calendar-times fa-2x mb-2"></i><br>
                            Nenhuma reserva encontrada
                        </td>
                    </tr>
                `;
                return;
            }
            
            querySnapshot.forEach((doc) => {
                const reservation = doc.data();
                const today = new Date().toISOString().split('T')[0];
                const isPast = reservation.date < today;
                
                const row = document.createElement("tr");
                row.innerHTML = `
                    <td>${reservation.area}</td>
                    <td>${new Date(reservation.date).toLocaleDateString('pt-BR')}</td>
                    <td>${reservation.time}</td>
                    <td>
                        <span class="badge ${isPast ? 'bg-secondary' : 'bg-success'}">
                            ${isPast ? 'Concluída' : 'Agendada'}
                        </span>
                    </td>
                    <td>
                        ${!isPast ? `
                        <button class="btn btn-danger btn-sm" onclick="cancelReservation('${doc.id}')">
                            <i class="fas fa-times me-1"></i>Cancelar
                        </button>
                        ` : '-'}
                    </td>
                `;
                reservationsList.appendChild(row);
            });
        });
}

function addReservation() {
    const area = document.getElementById('reservation-area').value;
    const date = document.getElementById('reservation-date').value;
    const time = document.getElementById('reservation-time').value;

    if (!area || !date || !time) {
        alert('Por favor, preencha todos os campos');
        return;
    }

    // Check if reservation already exists
    db.collection("reservations")
        .where("area", "==", area)
        .where("date", "==", date)
        .where("time", "==", time)
        .get()
        .then((querySnapshot) => {
            if (!querySnapshot.empty) {
                alert('Esta área já está reservada para o horário selecionado');
                return;
            }

            // Add reservation
            db.collection("reservations").add({
                area: area,
                date: date,
                time: time,
                user: currentUser.email,
                apartment: currentUser.email.split('@')[0],
                status: 'confirmed',
                timestamp: firebase.firestore.FieldValue.serverTimestamp()
            })
            .then(() => {
                document.getElementById('reservation-area').value = '';
                document.getElementById('reservation-date').value = '';
                document.getElementById('reservation-time').value = '';
                showAlert('Reserva feita com sucesso!', 'success');
            })
            .catch((error) => {
                console.error("Erro ao fazer reserva: ", error);
                showAlert('Erro ao fazer reserva', 'danger');
            });
        });
}

function cancelReservation(reservationId) {
    if (confirm('Tem certeza que deseja cancelar esta reserva?')) {
        db.collection("reservations").doc(reservationId).delete()
        .then(() => {
            showAlert('Reserva cancelada com sucesso!', 'success');
        })
        .catch((error) => {
            console.error("Erro ao cancelar reserva: ", error);
            showAlert('Erro ao cancelar reserva', 'danger');
        });
    }
}

// Visitors Management
function renderVisitors() {
    appContainer.innerHTML = `
        ${renderNavigation()}
        <div class="container-fluid py-4">
            <div class="row">
                <div class="col-12">
                    <h1 class="h3 mb-4">
                        <i class="fas fa-users me-2"></i>Gerenciar Visitantes
                    </h1>
                </div>
            </div>
            
            <div class="row mb-4">
                <div class="col-md-6">
                    <div class="card">
                        <div class="card-header">
                            <h5 class="card-title mb-0">Anunciar Visitante</h5>
                        </div>
                        <div class="card-body">
                            <div class="mb-3">
                                <label for="visitor-name" class="form-label">Nome do Visitante</label>
                                <input type="text" class="form-control" id="visitor-name" placeholder="Nome completo">
                            </div>
                            <div class="mb-3">
                                <label for="visitor-document" class="form-label">Documento (RG/CPF)</label>
                                <input type="text" class="form-control" id="visitor-document" placeholder="Número do documento">
                            </div>
                            <div class="mb-3">
                                <label for="visitor-date" class="form-label">Data da Visita</label>
                                <input type="date" class="form-control" id="visitor-date" value="${new Date().toISOString().split('T')[0]}">
                            </div>
                            <div class="mb-3">
                                <label for="visitor-time" class="form-label">Horário Previsto</label>
                                <input type="time" class="form-control" id="visitor-time">
                            </div>
                            <div class="mb-3">
                                <label for="visitor-vehicle" class="form-label">Veículo (opcional)</label>
                                <input type="text" class="form-control" id="visitor-vehicle" placeholder="Placa do veículo">
                            </div>
                            <button type="button" class="btn btn-primary" onclick="addVisitor()">
                                <i class="fas fa-plus me-1"></i>Anunciar Visitante
                            </button>
                        </div>
                    </div>
                </div>
            </div>
            
            <div class="row">
                <div class="col-12">
                    <div class="card">
                        <div class="card-header">
                            <h5 class="card-title mb-0">Meus Visitantes</h5>
                        </div>
                        <div class="card-body">
                            <div class="table-responsive">
                                <table class="table table-striped">
                                    <thead>
                                        <tr>
                                            <th>Nome</th>
                                            <th>Documento</th>
                                            <th>Data</th>
                                            <th>Horário</th>
                                            <th>Veículo</th>
                                            <th>Status</th>
                                        </tr>
                                    </thead>
                                    <tbody id="visitors-list">
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;

    loadVisitors();
}

function loadVisitors() {
    const userApartment = currentUser.email.split('@')[0];
    
    db.collection("visitors")
        .where("apartment", "==", userApartment)
        .orderBy("date", "desc")
        .orderBy("timestamp", "desc")
        .onSnapshot((querySnapshot) => {
            const visitorsList = document.getElementById("visitors-list");
            visitorsList.innerHTML = "";
            
            if (querySnapshot.empty) {
                visitorsList.innerHTML = `
                    <tr>
                        <td colspan="6" class="text-center text-muted py-4">
                            <i class="fas fa-user-friends fa-2x mb-2"></i><br>
                            Nenhum visitante anunciado
                        </td>
                    </tr>
                `;
                return;
            }
            
            querySnapshot.forEach((doc) => {
                const visitor = doc.data();
                const today = new Date().toISOString().split('T')[0];
                const isToday = visitor.date === today;
                const isFuture = visitor.date > today;
                
                let status = 'Concluída';
                let badgeClass = 'bg-secondary';
                
                if (isFuture) {
                    status = 'Agendada';
                    badgeClass = 'bg-warning text-dark';
                } else if (isToday) {
                    status = 'Hoje';
                    badgeClass = 'bg-success';
                }
                
                const row = document.createElement("tr");
                row.innerHTML = `
                    <td>${visitor.name}</td>
                    <td>${visitor.document || '-'}</td>
                    <td>${new Date(visitor.date).toLocaleDateString('pt-BR')}</td>
                    <td>${visitor.time || '-'}</td>
                    <td>${visitor.vehicle || '-'}</td>
                    <td>
                        <span class="badge ${badgeClass}">${status}</span>
                    </td>
                `;
                visitorsList.appendChild(row);
            });
        });
}

function addVisitor() {
    const name = document.getElementById('visitor-name').value;
    const visitorDocument = document.getElementById('visitor-document').value;
    const date = document.getElementById('visitor-date').value;
    const time = document.getElementById('visitor-time').value;
    const vehicle = document.getElementById('visitor-vehicle').value;

    if (!name || !date) {
        alert('Por favor, preencha pelo menos o nome e a data');
        return;
    }

    db.collection("visitors").add({
        name: name,
        document: visitorDocument,
        date: date,
        time: time,
        vehicle: vehicle,
        apartment: currentUser.email.split('@')[0],
        announcedBy: currentUser.email,
        timestamp: firebase.firestore.FieldValue.serverTimestamp()
    })
    .then(() => {
        document.getElementById('visitor-name').value = '';
        document.getElementById('visitor-document').value = '';
        document.getElementById('visitor-vehicle').value = '';
        document.getElementById('visitor-time').value = '';
        showAlert('Visitante anunciado com sucesso!', 'success');
    })
    .catch((error) => {
        console.error("Erro ao anunciar visitante: ", error);
        showAlert('Erro ao anunciar visitante', 'danger');
    });
}

// Incidents Management
function renderIncidents() {
    const isAdmin = userRole === 'admin';
    
    appContainer.innerHTML = `
        ${renderNavigation()}
        <div class="container-fluid py-4">
            <div class="row">
                <div class="col-12">
                    <h1 class="h3 mb-4">
                        <i class="fas fa-exclamation-triangle me-2"></i>Gerenciar Ocorrências
                    </h1>
                </div>
            </div>
            
            <div class="row mb-4">
                <div class="col-md-6">
                    <div class="card">
                        <div class="card-header">
                            <h5 class="card-title mb-0">Reportar Ocorrência</h5>
                        </div>
                        <div class="card-body">
                            <div class="mb-3">
                                <label for="incident-title" class="form-label">Título</label>
                                <input type="text" class="form-control" id="incident-title" placeholder="Resumo da ocorrência">
                            </div>
                            <div class="mb-3">
                                <label for="incident-type" class="form-label">Tipo</label>
                                <select class="form-select" id="incident-type">
                                    <option value="Manutenção">Manutenção</option>
                                    <option value="Segurança">Segurança</option>
                                    <option value="Convívio">Convívio</option>
                                    <option value="Limpeza">Limpeza</option>
                                    <option value="Outro">Outro</option>
                                </select>
                            </div>
                            <div class="mb-3">
                                <label for="incident-description" class="form-label">Descrição</label>
                                <textarea class="form-control" id="incident-description" rows="4" placeholder="Descreva detalhadamente a ocorrência..."></textarea>
                            </div>
                            <div class="mb-3">
                                <label for="incident-location" class="form-label">Local (opcional)</label>
                                <input type="text" class="form-control" id="incident-location" placeholder="Onde ocorreu?">
                            </div>
                            <button type="button" class="btn btn-primary" onclick="addIncident()">
                                <i class="fas fa-plus me-1"></i>Reportar Ocorrência
                            </button>
                        </div>
                    </div>
                </div>
            </div>
            
            <div class="row">
                <div class="col-12">
                    <div class="card">
                        <div class="card-header">
                            <h5 class="card-title mb-0">${isAdmin ? 'Todas as Ocorrências' : 'Minhas Ocorrências'}</h5>
                        </div>
                        <div class="card-body">
                            <div class="table-responsive">
                                <table class="table table-striped">
                                    <thead>
                                        <tr>
                                            <th>Título</th>
                                            <th>Tipo</th>
                                            <th>Local</th>
                                            <th>Data</th>
                                            <th>Status</th>
                                            ${isAdmin ? '<th>Reportado por</th><th>Ações</th>' : ''}
                                        </tr>
                                    </thead>
                                    <tbody id="incidents-list">
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;

    loadIncidents();
}

function loadIncidents() {
    const isAdmin = userRole === 'admin';
    let query = db.collection("incidents");
    
    if (!isAdmin) {
        query = query.where("reportedBy", "==", currentUser.email);
    }
    
    query.orderBy("timestamp", "desc")
        .onSnapshot((querySnapshot) => {
            const incidentsList = document.getElementById("incidents-list");
            incidentsList.innerHTML = "";
            
            if (querySnapshot.empty) {
                incidentsList.innerHTML = `
                    <tr>
                        <td colspan="${isAdmin ? 7 : 5}" class="text-center text-muted py-4">
                            <i class="fas fa-check-circle fa-2x mb-2"></i><br>
                            Nenhuma ocorrência encontrada
                        </td>
                    </tr>
                `;
                return;
            }
            
            querySnapshot.forEach((doc) => {
                const incident = doc.data();
                const date = incident.timestamp?.toDate().toLocaleDateString('pt-BR') || 'N/A';
                
                let statusBadge = '';
                switch (incident.status) {
                    case 'open':
                        statusBadge = '<span class="badge bg-danger">Aberta</span>';
                        break;
                    case 'in_progress':
                        statusBadge = '<span class="badge bg-warning text-dark">Em Andamento</span>';
                        break;
                    case 'resolved':
                        statusBadge = '<span class="badge bg-success">Resolvida</span>';
                        break;
                    default:
                        statusBadge = '<span class="badge bg-secondary">Aberta</span>';
                }
                
                const row = document.createElement("tr");
                row.innerHTML = `
                    <td>
                        <strong>${incident.title}</strong>
                        ${!isAdmin ? `<br><small class="text-muted">${incident.description.substring(0, 50)}...</small>` : ''}
                    </td>
                    <td>${incident.type}</td>
                    <td>${incident.location || '-'}</td>
                    <td>${date}</td>
                    <td>${statusBadge}</td>
                    ${isAdmin ? `
                    <td>${incident.reportedBy}</td>
                    <td>
                        <div class="btn-group btn-group-sm">
                            <button class="btn btn-outline-primary" onclick="viewIncident('${doc.id}')">
                                <i class="fas fa-eye"></i>
                            </button>
                            <button class="btn btn-outline-success" onclick="updateIncidentStatus('${doc.id}', 'in_progress')">
                                <i class="fas fa-play"></i>
                            </button>
                            <button class="btn btn-outline-danger" onclick="updateIncidentStatus('${doc.id}', 'resolved')">
                                <i class="fas fa-check"></i>
                            </button>
                        </div>
                    </td>
                    ` : ''}
                `;
                incidentsList.appendChild(row);
            });
        });
}

function addIncident() {
    const title = document.getElementById('incident-title').value;
    const type = document.getElementById('incident-type').value;
    const description = document.getElementById('incident-description').value;
    const location = document.getElementById('incident-location').value;

    if (!title || !description) {
        alert('Por favor, preencha pelo menos o título e a descrição');
        return;
    }

    db.collection("incidents").add({
        title: title,
        type: type,
        description: description,
        location: location,
        status: 'open',
        reportedBy: currentUser.email,
        apartment: currentUser.email.split('@')[0],
        timestamp: firebase.firestore.FieldValue.serverTimestamp()
    })
    .then(() => {
        document.getElementById('incident-title').value = '';
        document.getElementById('incident-description').value = '';
        document.getElementById('incident-location').value = '';
        showAlert('Ocorrência reportada com sucesso!', 'success');
    })
    .catch((error) => {
        console.error("Erro ao reportar ocorrência: ", error);
        showAlert('Erro ao reportar ocorrência', 'danger');
    });
}

function updateIncidentStatus(incidentId, status) {
    const statusMap = {
        'in_progress': 'Em Andamento',
        'resolved': 'Resolvida'
    };
    
    if (confirm(`Deseja marcar esta ocorrência como "${statusMap[status]}"?`)) {
        db.collection("incidents").doc(incidentId).update({
            status: status,
            updatedAt: firebase.firestore.FieldValue.serverTimestamp()
        })
        .then(() => {
            showAlert('Status da ocorrência atualizado!', 'success');
        })
        .catch((error) => {
            console.error("Erro ao atualizar ocorrência: ", error);
            showAlert('Erro ao atualizar ocorrência', 'danger');
        });
    }
}

function viewIncident(incidentId) {
    db.collection("incidents").doc(incidentId).get()
        .then((doc) => {
            if (doc.exists) {
                const incident = doc.data();
                alert(`Título: ${incident.title}\n\nDescrição: ${incident.description}\n\nLocal: ${incident.location || 'Não informado'}\n\nStatus: ${incident.status}`);
            }
        });
}

// Notices Management
function renderNotices() {
    const isAdmin = userRole === 'admin';

    appContainer.innerHTML = `
        ${renderNavigation()}
        <div class="container-fluid py-4">
            <div class="row">
                <div class="col-12">
                    <h1 class="h3 mb-4">
                        <i class="fas fa-bullhorn me-2"></i>Quadro de Avisos
                    </h1>
                </div>
            </div>

            ${isAdmin ? `
            <div class="row mb-4">
                <div class="col-md-6">
                    <div class="card">
                        <div class="card-header">
                            <h5 class="card-title mb-0">Novo Aviso</h5>
                        </div>
                        <div class="card-body">
                            <div class="mb-3">
                                <label for="notice-title" class="form-label">Título</label>
                                <input type="text" class="form-control" id="notice-title" placeholder="Título do aviso">
                            </div>
                            <div class="mb-3">
                                <label for="notice-content" class="form-label">Conteúdo</label>
                                <textarea class="form-control" id="notice-content" rows="4" placeholder="Conteúdo do aviso..."></textarea>
                            </div>
                            <button type="button" class="btn btn-primary" onclick="addNotice()">
                                <i class="fas fa-plus me-1"></i>Publicar Aviso
                            </button>
                        </div>
                    </div>
                </div>
            </div>
            ` : ''}

            <div class="row">
                <div class="col-12">
                    <div id="notices-list"></div>
                </div>
            </div>
        </div>
    `;

    loadNotices();
}

function loadNotices() {
    const isAdmin = userRole === 'admin';
    db.collection("notices").orderBy("timestamp", "desc")
        .onSnapshot((querySnapshot) => {
            const noticesList = document.getElementById("notices-list");
            noticesList.innerHTML = "";

            if (querySnapshot.empty) {
                noticesList.innerHTML = `
                    <div class="card">
                        <div class="card-body text-center text-muted">
                            <i class="fas fa-info-circle fa-2x mb-2"></i><br>
                            Nenhum aviso publicado no momento.
                        </div>
                    </div>
                `;
                return;
            }

            querySnapshot.forEach((doc) => {
                const notice = doc.data();
                const date = notice.timestamp?.toDate().toLocaleDateString('pt-BR') || 'N/A';

                const card = document.createElement("div");
                card.className = "card mb-3";
                card.innerHTML = `
                    <div class="card-header d-flex justify-content-between align-items-center">
                        <strong>${notice.title}</strong>
                        <small class="text-muted">${date}</small>
                    </div>
                    <div class="card-body">
                        <p class="card-text">${notice.content.replace(/\n/g, '<br>')}</p>
                    </div>
                    ${isAdmin ? `
                    <div class="card-footer text-end">
                        <button class="btn btn-outline-primary btn-sm me-2" onclick="editNotice('${doc.id}')">
                            <i class="fas fa-edit me-1"></i>Editar
                        </button>
                        <button class="btn btn-outline-danger btn-sm" onclick="deleteNotice('${doc.id}')">
                            <i class="fas fa-trash me-1"></i>Excluir
                        </button>
                    </div>
                    ` : ''}
                `;
                noticesList.appendChild(card);
            });
        });
}

function addNotice() {
    const title = document.getElementById('notice-title').value;
    const content = document.getElementById('notice-content').value;

    if (!title || !content) {
        alert('Por favor, preencha todos os campos');
        return;
    }

    db.collection("notices").add({
        title: title,
        content: content,
        timestamp: firebase.firestore.FieldValue.serverTimestamp(),
        readBy: []
    })
    .then(() => {
        document.getElementById('notice-title').value = '';
        document.getElementById('notice-content').value = '';
        showAlert('Aviso publicado com sucesso!', 'success');
    })
    .catch((error) => {
        console.error("Erro ao publicar aviso: ", error);
        showAlert('Erro ao publicar aviso. Verifique as regras de segurança do Firestore.', 'danger');
    });
}

function deleteNotice(noticeId) {
    if (confirm('Tem certeza que deseja excluir este aviso?')) {
        db.collection('notices').doc(noticeId).delete()
            .then(() => {
                showAlert('Aviso excluído com sucesso!', 'success');
            })
            .catch((error) => {
                console.error("Erro ao excluir aviso: ", error);
                showAlert('Erro ao excluir aviso.', 'danger');
            });
    }
}

function editNotice(noticeId) {
    db.collection('notices').doc(noticeId).get().then(doc => {
        if (!doc.exists) {
            showAlert('Aviso não encontrado.', 'danger');
            return;
        }
        const notice = doc.data();

        const newTitle = prompt('Editar Título:', notice.title);
        if (newTitle === null) return; // User cancelled

        const newContent = prompt('Editar Conteúdo:', notice.content);
        if (newContent === null) return; // User cancelled

        if (!newTitle || !newContent) {
            alert('Título e conteúdo não podem ser vazios.');
            return;
        }

        db.collection('notices').doc(noticeId).update({
            title: newTitle,
            content: newContent,
            updatedAt: firebase.firestore.FieldValue.serverTimestamp()
        })
        .then(() => {
            showAlert('Aviso atualizado com sucesso!', 'success');
        })
        .catch((error) => {
            console.error("Erro ao atualizar aviso: ", error);
            showAlert('Erro ao atualizar aviso.', 'danger');
        });
    });
}

// Lost and Found Management
function renderLostAndFound() {
    appContainer.innerHTML = `
        ${renderNavigation()}
        <div class="container-fluid py-4">
            <div class="row">
                <div class="col-12">
                    <h1 class="h3 mb-4">
                        <i class="fas fa-search-location me-2"></i>Achados e Perdidos
                    </h1>
                </div>
            </div>

            <div class="row mb-4">
                <div class="col-md-8 mx-auto">
                    <div class="card">
                        <div class="card-header">
                            <h5 class="card-title mb-0">Registrar Item</h5>
                        </div>
                        <div class="card-body">
                            <form id="lost-found-form">
                                <div class="mb-3">
                                    <label for="item-title" class="form-label">Título</label>
                                    <input type="text" class="form-control" id="item-title" placeholder="Ex: Chave de carro encontrada" required>
                                </div>
                                <div class="mb-3">
                                    <label for="item-description" class="form-label">Descrição</label>
                                    <textarea class="form-control" id="item-description" rows="3" placeholder="Descreva o item, onde e quando foi encontrado/perdido..." required></textarea>
                                </div>
                                <div class="mb-3">
                                    <label class="form-label">Status</label>
                                    <div class="form-check">
                                        <input class="form-check-input" type="radio" name="item-status" id="item-found" value="found" checked>
                                        <label class="form-check-label" for="item-found">
                                            <i class="fas fa-eye me-1 text-success"></i> Eu achei um item
                                        </label>
                                    </div>
                                    <div class="form-check">
                                        <input class="form-check-input" type="radio" name="item-status" id="item-lost" value="lost">
                                        <label class="form-check-label" for="item-lost">
                                            <i class="fas fa-question-circle me-1 text-danger"></i> Eu perdi um item
                                        </label>
                                    </div>
                                </div>
                                <div class="mb-3">
                                    <label for="item-image" class="form-label">Foto do Item (Opcional)</label>
                                    <input class="form-control" type="file" id="item-image" accept="image/*">
                                </div>
                                <div class="d-grid">
                                    <button type="submit" class="btn btn-primary">
                                        <i class="fas fa-plus me-1"></i>Registrar Item
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>

            <div class="row">
                <div class="col-12">
                    <h2 class="h4 mb-3">Itens Registrados</h2>
                    <div id="lost-found-list" class="row">
                        <!-- Lost and found items will be loaded here -->
                    </div>
                </div>
            </div>
        </div>
    `;

    // Add form submission listener
    document.getElementById('lost-found-form').addEventListener('submit', addLostAndFoundItem);

    loadLostAndFoundItems();
}

function loadLostAndFoundItems() {
    const listContainer = document.getElementById('lost-found-list');
    if (!listContainer) return;

    db.collection('lostAndFound').orderBy('timestamp', 'desc').onSnapshot(snapshot => {
        if (snapshot.empty) {
            listContainer.innerHTML = '<p class="text-muted text-center col-12">Nenhum item achado ou perdido registrado ainda.</p>';
            return;
        }

        listContainer.innerHTML = '';
        snapshot.forEach(doc => {
            const item = doc.data();
            const isAdmin = userRole === 'admin';
            const isOwner = item.reportedBy === currentUser.email;

            const card = document.createElement('div');
            card.className = 'col-md-6 col-lg-4 mb-4';

            let statusBadge;
            switch (item.status) {
                case 'found':
                    statusBadge = `<span class="badge bg-success">Achado</span>`;
                    break;
                case 'lost':
                    statusBadge = `<span class="badge bg-danger">Perdido</span>`;
                    break;
                case 'claimed':
                    statusBadge = `<span class="badge bg-secondary">Devolvido</span>`;
                    break;
                default:
                    statusBadge = `<span class="badge bg-info">${item.status}</span>`;
            }

            card.innerHTML = `
                <div class="card h-100">
                    ${item.imageUrl ? `<img src="${item.imageUrl}" class="card-img-top" alt="${item.title}" style="height: 200px; object-fit: cover;">` : '<div class="card-img-top bg-light d-flex align-items-center justify-content-center" style="height: 200px;"><i class="fas fa-image fa-3x text-muted"></i></div>'}
                    <div class="card-body">
                        <h5 class="card-title">${item.title}</h5>
                        <p class="card-text">${item.description}</p>
                    </div>
                    <div class="card-footer">
                        <div class="d-flex justify-content-between align-items-center">
                            ${statusBadge}
                            <small class="text-muted">Reportado por: ${item.apartment}</small>
                        </div>
                        ${(isAdmin || isOwner) && item.status !== 'claimed' ? `
                        <div class="mt-3 text-end">
                            <button class="btn btn-outline-success btn-sm me-2" onclick="updateLostAndFoundStatus('${doc.id}', 'claimed')">
                                <i class="fas fa-check me-1"></i>Devolvido
                            </button>
                            <button class="btn btn-outline-danger btn-sm" onclick="deleteLostAndFoundItem('${doc.id}')">
                                <i class="fas fa-trash me-1"></i>Excluir
                            </button>
                        </div>
                        ` : ''}
                    </div>
                </div>
            `;
            listContainer.appendChild(card);
        });
    });
}

async function addLostAndFoundItem(event) {
    event.preventDefault();
    const title = document.getElementById('item-title').value;
    const description = document.getElementById('item-description').value;
    const status = document.querySelector('input[name="item-status"]:checked').value;
    const imageFile = document.getElementById('item-image').files[0];

    if (!title || !description) {
        showAlert('Por favor, preencha o título e a descrição.', 'warning');
        return;
    }

    let imageUrl = '';
    if (imageFile) {
        try {
            const storageRef = firebase.storage().ref();
            const imageId = `lostAndFound/${Date.now()}_${imageFile.name}`;
            const fileRef = storageRef.child(imageId);
            const snapshot = await fileRef.put(imageFile);
            imageUrl = await snapshot.ref.getDownloadURL();
        } catch (error) {
            console.error("Error uploading image: ", error);
            showAlert('Erro ao fazer upload da imagem.', 'danger');
            return;
        }
    }

    db.collection('lostAndFound').add({
        title,
        description,
        status,
        imageUrl,
        reportedBy: currentUser.email,
        apartment: currentUser.email.split('@')[0],
        timestamp: firebase.firestore.FieldValue.serverTimestamp()
    })
    .then(() => {
        showAlert('Item registrado com sucesso!', 'success');
        document.getElementById('lost-found-form').reset();
    })
    .catch(error => {
        console.error("Error adding document: ", error);
        showAlert('Erro ao registrar item. Verifique as regras de segurança.', 'danger');
    });
}

function updateLostAndFoundStatus(itemId, newStatus) {
    if (confirm(`Tem certeza que deseja marcar este item como "${newStatus === 'claimed' ? 'Devolvido' : newStatus}"?`)) {
        db.collection('lostAndFound').doc(itemId).update({ status: newStatus })
            .then(() => showAlert('Status do item atualizado!', 'success'))
            .catch(error => showAlert('Erro ao atualizar status.', 'danger'));
    }
}

function deleteLostAndFoundItem(itemId) {
    if (confirm('Tem certeza que deseja excluir este registro?')) {
        // Note: This does not delete the image from Storage. For a full implementation, that would be needed.
        db.collection('lostAndFound').doc(itemId).delete()
            .then(() => showAlert('Registro excluído com sucesso!', 'success'))
            .catch(error => showAlert('Erro ao excluir registro.', 'danger'));
    }
}

// Notification Bell
db.collection("notices").onSnapshot((snapshot) => {
    const bell = document.getElementById("notification-bell");
    if (!bell || !currentUser) return;

    let hasUnread = false;
    snapshot.forEach((doc) => {
        const notice = doc.data();
        if (notice.readBy && !notice.readBy.includes(currentUser.uid)) {
            hasUnread = true;
        }
    });

    if (hasUnread) {
        bell.classList.add("text-warning");
    } else {
        bell.classList.remove("text-warning");
    }
});

function markNoticesAsRead() {
    if (!currentUser) return;
    db.collection("notices").get().then((querySnapshot) => {
        const batch = db.batch();
        querySnapshot.forEach((doc) => {
            const notice = doc.data();
            if (notice.readBy && !notice.readBy.includes(currentUser.uid)) {
                const noticeRef = db.collection("notices").doc(doc.id);
                batch.update(noticeRef, {
                    readBy: firebase.firestore.FieldValue.arrayUnion(currentUser.uid)
                });
            }
        });
        batch.commit().catch(error => console.error("Failed to mark notices as read:", error));
    });
}

// Admin Panel
function renderAdmin() {
    if (userRole !== 'admin') {
        alert('Acesso restrito aos administradores');
        renderDashboard();
        return;
    }

    appContainer.innerHTML = `
        ${renderNavigation()}
        <div class="container-fluid py-4">
            <div class="row">
                <div class="col-12">
                    <h1 class="h3 mb-4">
                        <i class="fas fa-cogs me-2"></i>Painel de Administração
                    </h1>
                </div>
            </div>
            
            <div class="row">
                <div class="col-md-3 mb-4">
                    <div class="card bg-primary text-white">
                        <div class="card-body text-center">
                            <i class="fas fa-users fa-3x mb-3"></i>
                            <h4 id="total-residents">0</h4>
                            <p class="mb-0">Moradores</p>
                        </div>
                    </div>
                </div>
                
                <div class="col-md-3 mb-4">
                    <div class="card bg-success text-white">
                        <div class="card-body text-center">
                            <i class="fas fa-building fa-3x mb-3"></i>
                            <h4 id="total-apartments">0</h4>
                            <p class="mb-0">Apartamentos</p>
                        </div>
                    </div>
                </div>
                
                <div class="col-md-3 mb-4">
                    <div class="card bg-warning text-dark">
                        <div class="card-body text-center">
                            <i class="fas fa-tools fa-3x mb-3"></i>
                            <h4 id="maintenance-requests">0</h4>
                            <p class="mb-0">Manutenções</p>
                        </div>
                    </div>
                </div>
                
                <div class="col-md-3 mb-4">
                    <div class="card bg-info text-white">
                        <div class="card-body text-center">
                            <i class="fas fa-chart-line fa-3x mb-3"></i>
                            <h4 id="monthly-reservations">0</h4>
                            <p class="mb-0">Reservas/Mês</p>
                        </div>
                    </div>
                </div>
            </div>
            
            <div class="row mt-4">
                <div class="col-md-12">
                    <div class="card">
                        <div class="card-header">
                            <h5 class="card-title mb-0">Gerenciar Usuários</h5>
                        </div>
                        <div class="card-body">
                            <div class="table-responsive">
                                <table class="table table-striped">
                                    <thead>
                                        <tr>
                                            <th>Email</th>
                                            <th>Apartamento</th>
                                            <th>Tipo</th>
                                            <th>Ações</th>
                                        </tr>
                                    </thead>
                                    <tbody id="users-list">
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;

    loadAdminData();
}

function loadAdminData() {
    // Load users
    db.collection("users").get().then(snapshot => {
        const usersList = document.getElementById("users-list");
        usersList.innerHTML = "";
        let totalApartments = new Set();
        
        snapshot.forEach(doc => {
            const user = doc.data();
            totalApartments.add(user.apartment);
            const row = document.createElement("tr");
            row.innerHTML = `
                <td>${user.email}</td>
                <td>${user.apartment || '-'}</td>
                <td>
                    <span class="badge ${user.role === 'admin' ? 'bg-danger' : 'bg-primary'}">
                        ${user.role === 'admin' ? 'Administrador' : 'Morador'}
                    </span>
                </td>
                <td>
                    <button class="btn btn-sm btn-outline-danger" onclick="deleteUser('${doc.id}')">
                        <i class="fas fa-trash"></i>
                    </button>
                </td>
            `;
            usersList.appendChild(row);
        });
        
        document.getElementById('total-residents').textContent = snapshot.size;
        document.getElementById('total-apartments').textContent = totalApartments.size;
    });

    // Load maintenance requests
    db.collection("incidents").where("type", "==", "Manutenção").get().then(snapshot => {
        document.getElementById('maintenance-requests').textContent = snapshot.size;
    });

    // Load monthly reservations
    db.collection("reservations").get().then(snapshot => {
        document.getElementById('monthly-reservations').textContent = snapshot.size;
    });
}

function generateReport(type) {
    alert(`Relatório de ${type} gerado com sucesso!`);
    // Implement PDF generation or data export here
}

function deleteUser(userId) {
    if (confirm('Tem certeza que deseja excluir este usuário?')) {
        db.collection("users").doc(userId).delete()
        .then(() => {
            showAlert('Usuário excluído com sucesso!', 'success');
            loadAdminData();
        })
        .catch((error) => {
            console.error("Erro ao excluir usuário: ", error);
            showAlert('Erro ao excluir usuário', 'danger');
        });
    }
}

// Utility Functions
function showAlert(message, type) {
    const alertDiv = document.createElement('div');
    alertDiv.className = `alert alert-${type} alert-dismissible fade show`;
    alertDiv.innerHTML = `
        ${message}
        <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
    `;
    
    document.querySelector('.container-fluid').insertBefore(alertDiv, document.querySelector('.container-fluid').firstChild);
    
    setTimeout(() => {
        if (alertDiv.parentNode) {
            alertDiv.parentNode.removeChild(alertDiv);
        }
    }, 5000);
}

// Auth State Listener
auth.onAuthStateChanged((user) => {
    if (user) {
        currentUser = user;
        
        // Get user role
        db.collection('users').doc(user.uid).get()
            .then((doc) => {
                if (doc.exists) {
                    userRole = doc.data().role;
                    renderDashboard();
                } else {
                    // Create user document if it doesn't exist
                    db.collection('users').doc(user.uid).set({
                        email: user.email,
                        role: 'resident',
                        apartment: user.email.split('@')[0],
                        createdAt: firebase.firestore.FieldValue.serverTimestamp()
                    })
                    .then(() => {
                        userRole = 'resident';
                        renderDashboard();
                    });
                }
            });
    } else {
        currentUser = null;
        userRole = null;
        renderLogin();
    }
});

// Initialize app
renderLogin();