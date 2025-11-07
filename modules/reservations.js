import { renderNavigation, setActiveNavItem, showAlert, initGlobalEventListeners, cleanup, firestoreListeners, sanitizeHTML } from './ui.js';
import { userRole, currentUser } from './auth.js';
import { db } from './firebase.js';
import { initAppEventListeners } from '../app.js';

let calendar;

function renderReservations() {
    cleanup();
    const appContainer = document.getElementById('app');
    appContainer.innerHTML = `
        ${renderNavigation(userRole, currentUser)}
        <div class="container-fluid py-4 animate-fade-in">
            <div class="row mb-4">
                <div class="col-12">
                    <div class="d-flex justify-content-between align-items-center">
                        <h1 class="h3 mb-0 text-gradient">
                            <i class="fas fa-calendar-alt me-2"></i>Reservas de Áreas Comuns
                        </h1>

                    </div>
                    <p class="text-muted mb-0">Agende e gerencie suas reservas</p>
                </div>
            </div>
            
            <div class="row mb-4">
                <div class="col-lg-8">
                    <div class="card-premium animate-slide-up h-100">
                        <div class="card-header-premium">
                            <h5 class="card-title mb-0">
                                <i class="fas fa-plus-circle me-2"></i>Nova Reserva
                            </h5>
                        </div>
                        <div class="card-body-premium">
                            <form id="reservation-form">
                                <div class="row">
                                    <div class="col-md-6 mb-3">
                                        <label for="reservation-area" class="form-label">Área Comum *</label>
                                        <select class="form-select-premium" id="reservation-area" required>
                                            <option value="">Selecione uma área</option>
                                            <option value="Salão de Festas">🎉 Salão de Festas</option>
                                            <option value="Churrasqueira">🔥 Churrasqueira</option>
                                            <option value="Quadra de Esportes">⚽ Quadra de Esportes</option>
                                            <option value="Piscina">🏊 Piscina</option>
                                            <option value="Salão de Jogos">🎮 Salão de Jogos</option>
                                            <option value="Espaço Gourmet">👨‍🍳 Espaço Gourmet</option>
                                        </select>
                                    </div>
                                    <div class="col-md-6 mb-3">
                                        <label for="reservation-date" class="form-label">Data *</label>
                                        <input type="date" class="form-control-premium" id="reservation-date" 
                                               min="${new Date().toISOString().split('T')[0]}" required>
                                    </div>
                                </div>
                                <div class="mb-3">
                                    <label for="reservation-time" class="form-label">Horário *</label>
                                    <select class="form-select-premium" id="reservation-time" required>
                                        <option value="">Selecione um horário</option>
                                        <option value="08:00-10:00">🌅 08:00 - 10:00</option>
                                        <option value="10:00-12:00">☀️ 10:00 - 12:00</option>
                                        <option value="14:00-16:00">🌞 14:00 - 16:00</option>
                                        <option value="16:00-18:00">🌇 16:00 - 18:00</option>
                                        <option value="18:00-20:00">🌃 18:00 - 20:00</option>
                                        <option value="20:00-22:00">🌙 20:00 - 22:00</option>
                                    </select>
                                </div>
                                <div class="mb-3">
                                    <label for="reservation-guests" class="form-label">Número de Convidados</label>
                                    <input type="number" class="form-control-premium" id="reservation-guests" 
                                           min="1" max="50" placeholder="Quantidade estimada">
                                </div>
                                <div class="mb-3">
                                    <label for="reservation-notes" class="form-label">Observações</label>
                                    <textarea class="form-control-premium" id="reservation-notes" rows="3" 
                                              placeholder="Informações adicionais..."></textarea>
                                </div>
                                <div class="d-grid gap-2 d-md-flex justify-content-md-end">
                                    <button type="button" class="btn btn-premium btn-secondary-premium" id="clear-reservation-form-btn">
                                        <i class="fas fa-times me-2"></i>Limpar
                                    </button>
                                    <button type="submit" class="btn btn-premium btn-primary-premium">
                                        <i class="fas fa-calendar-plus me-2"></i>Fazer Reserva
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
                <div class="col-lg-4">
                    <div class="card-premium animate-slide-up h-100">
                        <div class="card-header-premium">
                            <h5 class="card-title mb-0">
                                <i class="fas fa-info-circle me-2"></i>Informações
                            </h5>
                        </div>
                        <div class="card-body-premium">
                            <div class="alert alert-info border-0">
                                <h6><i class="fas fa-clock me-2"></i>Horários Disponíveis</h6>
                                <p class="mb-2 small">Cada reserva tem duração de 2 horas</p>
                                
                                <h6><i class="fas fa-users me-2"></i>Capacidade</h6>
                                <ul class="small mb-0">
                                    <li>Salão de Festas: 50 pessoas</li>
                                    <li>Churrasqueira: 20 pessoas</li>
                                    <li>Quadra: 30 pessoas</li>
                                    <li>Piscina: 25 pessoas</li>
                                    <li>Salão de Jogos: 15 pessoas</li>
                                    <li>Espaço Gourmet: 10 pessoas</li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            
            <div class="row">
                <div class="col-12">
                    <div class="card-premium animate-slide-up">
                        <div class="card-header-premium d-flex justify-content-between align-items-center">
                            <h5 class="card-title mb-0">
                                <i class="fas fa-list me-2"></i>Minhas Reservas
                            </h5>
                            <div class="btn-group">
                                <button class="btn btn-sm btn-premium btn-outline-primary active" id="filter-reservations-all-btn">
                                    Todas
                                </button>
                                <button class="btn btn-sm btn-premium btn-outline-success" id="filter-reservations-upcoming-btn">
                                    Futuras
                                </button>
                                <button class="btn btn-sm btn-premium btn-outline-secondary" id="filter-reservations-past-btn">
                                    Passadas
                                </button>
                            </div>
                        </div>
                        <div class="card-body-premium">
                            <div class="table-responsive">
                                <table class="table table-premium">
                                    <thead>
                                        <tr>
                                            <th>Área</th>
                                            <th>Data</th>
                                            <th>Horário</th>
                                            <th>Convidados</th>
                                            <th>Status</th>
                                            <th>Ações</th>
                                        </tr>
                                    </thead>
                                    <tbody id="reservations-list">
                                        <tr>
                                            <td colspan="6" class="text-center py-5">
                                                <div class="loading"></div>
                                                <p class="text-muted mt-2">Carregando reservas...</p>
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

        <div class="modal fade calendar-modal-premium" id="calendar-modal" tabindex="-1">
            <div class="modal-dialog modal-xl modal-dialog-centered">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title">Calendário de Reservas</h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                    </div>
                    <div class="modal-body">
                        <div id="calendar"></div>
                    </div>
                </div>
            </div>
        </div>
    `;

    setActiveNavItem('nav-reservations');
    initGlobalEventListeners();
    initAppEventListeners();

    document.getElementById('reservation-form').addEventListener('submit', function(e) {
        e.preventDefault();
        addReservation();
    });

    document.getElementById('clear-reservation-form-btn').addEventListener('click', clearReservationForm);
    document.getElementById('filter-reservations-all-btn').addEventListener('click', () => filterReservations('all'));
    document.getElementById('filter-reservations-upcoming-btn').addEventListener('click', () => filterReservations('upcoming'));
    document.getElementById('filter-reservations-past-btn').addEventListener('click', () => filterReservations('past'));

    const reservationsList = document.getElementById('reservations-list');
    reservationsList.addEventListener('click', (e) => {
        const target = e.target.closest('button');
        if (!target) return;

        const reservationId = target.dataset.reservationId;
        if (!reservationId) return;

        if (target.classList.contains('delete-reservation-btn')) {
            deleteReservation(reservationId);
        }
    });

    loadEnhancedReservations();
}

function loadEnhancedReservations(filter = 'all') {
    const isAdmin = userRole === 'admin';
    let query = db.collection("reservations");

    if (!isAdmin) {
        query = query.where("user", "==", currentUser.email);
    }

    if (firestoreListeners.reservations) {
        firestoreListeners.reservations();
    }

    firestoreListeners.reservations = query.orderBy("date", "desc")
        .onSnapshot((querySnapshot) => {
            const reservationsList = document.getElementById("reservations-list");
            
            if (querySnapshot.empty) {
                reservationsList.innerHTML = `
                    <tr>
                        <td colspan="6" class="text-center text-muted py-5">
                            <h5>Nenhuma reserva encontrada</h5>
                        </td>
                    </tr>
                `;
                return;
            }
            
            let html = '';
            querySnapshot.forEach((doc) => {
                const reservation = doc.data();
                const date = new Date(reservation.date);
                const status = date < new Date() ? 'Passada' : 'Futura';

                if (filter === 'upcoming' && status === 'Passada') return;
                if (filter === 'past' && status === 'Futura') return;

                html += `
                    <tr class="animate-fade-in">
                        <td>${sanitizeHTML(reservation.area)}</td>
                        <td>${date.toLocaleDateString('pt-BR')}</td>
                        <td>${sanitizeHTML(reservation.time)}</td>
                        <td>${sanitizeHTML(reservation.guests) || '-'}</td>
                        <td><span class="badge-premium ${status === 'Futura' ? 'badge-success-premium' : 'badge-secondary-premium'}">${status}</span></td>
                        <td>
                            <div class="btn-group btn-group-sm">
                                <button class="btn btn-premium btn-danger-premium delete-reservation-btn" 
                                        data-reservation-id="${doc.id}"
                                        title="Excluir reserva">
                                    <i class="fas fa-trash"></i>
                                </button>
                            </div>
                        </td>
                    </tr>
                `;
            });
            reservationsList.innerHTML = html;
        });
}

async function addReservation() {
    const area = document.getElementById('reservation-area').value;
    const date = document.getElementById('reservation-date').value;
    const time = document.getElementById('reservation-time').value;
    const guests = document.getElementById('reservation-guests').value;
    const notes = document.getElementById('reservation-notes').value;

    if (!area || !date || !time) {
        showAlert('Por favor, preencha todos os campos obrigatórios', 'warning');
        return;
    }

    const existingReservation = await db.collection("reservations")
        .where("area", "==", area)
        .where("date", "==", date)
        .where("time", "==", time)
        .get();

    if (!existingReservation.empty) {
        showAlert('Esta área já está reservada para esta data e horário.', 'danger');
        return;
    }

    db.collection("reservations").add({
        area: area,
        date: date,
        time: time,
        guests: guests,
        notes: notes,
        user: currentUser.email,
        timestamp: firebase.firestore.FieldValue.serverTimestamp()
    })
    .then(() => {
        showAlert('Reserva efetuada com sucesso!', 'success');
        document.getElementById('reservation-form').reset();
    })
    .catch((error) => {
        console.error("Erro ao efetuar reserva: ", error);
        showAlert('Erro ao efetuar reserva', 'danger');
    });
}

function deleteReservation(reservationId) {
    if (confirm('Tem certeza que deseja excluir esta reserva?')) {
        db.collection("reservations").doc(reservationId).delete()
        .then(() => {
            showAlert('Reserva excluída com sucesso!', 'success');
        })
        .catch((error) => {
            console.error("Erro ao excluir reserva: ", error);
            showAlert('Erro ao excluir reserva', 'danger');
        });
    }
}

function clearReservationForm() {
    document.getElementById('reservation-form').reset();
}

function showReservationCalendar() {
    const calendarEl = document.getElementById('calendar');
    if (!calendarEl) return;

    const calendarModal = new bootstrap.Modal(document.getElementById('calendar-modal'));

    calendarEl.innerHTML = '<div class="loading"></div>';
    calendarModal.show();

    if (firestoreListeners.calendar) {
        firestoreListeners.calendar();
    }

    firestoreListeners.calendar = db.collection('reservations')
        .onSnapshot(snapshot => {
            const events = snapshot.docs.map(doc => {
                const data = doc.data();
                const [startHour, endHour] = data.time.split('-').map(t => t.split(':')[0]);
                return {
                    title: `${sanitizeHTML(data.area)} (${sanitizeHTML(data.user.split('@')[0])})`,
                    start: `${data.date}T${startHour}:00:00`,
                    end: `${data.date}T${endHour}:00:00`,
                    allDay: false,
                    extendedProps: {
                        ...data,
                        id: doc.id
                    }
                };
            });

            if (calendar) {
                calendar.destroy();
            }

            calendar = new FullCalendar.Calendar(calendarEl, {
                initialView: 'dayGridMonth',
                locale: 'pt-br',
                headerToolbar: {
                    left: 'prev,next today',
                    center: 'title',
                    right: 'dayGridMonth,timeGridWeek,timeGridDay'
                },
                events: events,
                dateClick: function(info) {
                    document.getElementById('reservation-date').value = info.dateStr;
                    calendarModal.hide();
                },
                eventClick: function(info) {
                    const event = info.event;
                    const props = event.extendedProps;
                    const content = `
                        <p><strong>Área:</strong> ${sanitizeHTML(props.area)}</p>
                        <p><strong>Data:</strong> ${new Date(props.date).toLocaleDateString('pt-BR')}</p>
                        <p><strong>Horário:</strong> ${sanitizeHTML(props.time)}</p>
                        <p><strong>Reservado por:</strong> ${sanitizeHTML(props.user)}</p>
                        ${props.notes ? `<p><strong>Observações:</strong> ${sanitizeHTML(props.notes)}</p>` : ''}
                    `;
                    showAlert(content, 'info', 10000);
                }
            });

            calendar.render();
        });
}

function filterReservations(filter) {
    document.querySelectorAll('.btn-group .btn').forEach(btn => btn.classList.remove('active'));
    document.getElementById(`filter-reservations-${filter}-btn`).classList.add('active');
    loadEnhancedReservations(filter);
}

export { renderReservations, showReservationCalendar, clearReservationForm, addReservation, filterReservations, deleteReservation };