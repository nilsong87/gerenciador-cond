import { db, collection, getDocs } from './firebase.js';
import { showAlert } from './ui.js';

async function generateSystemReport() {
    showAlert('Gerando relatório do sistema...', 'info');

    try {
        const usersSnapshot = await getDocs(collection(db, 'users'));
        const packagesSnapshot = await getDocs(collection(db, 'packages'));
        const reservationsSnapshot = await getDocs(collection(db, 'reservations'));
        const incidentsSnapshot = await getDocs(collection(db, 'incidents'));

        const reportData = {
            totalUsers: usersSnapshot.size,
            totalPackages: packagesSnapshot.size,
            totalReservations: reservationsSnapshot.size,
            totalIncidents: incidentsSnapshot.size,
            timestamp: new Date().toLocaleString('pt-BR'),
        };

        const reportHtml = `
            <h2>Relatório do Sistema</h2>
            <p>Gerado em: ${reportData.timestamp}</p>
            <ul>
                <li>Total de Usuários: ${reportData.totalUsers}</li>
                <li>Total de Encomendas: ${reportData.totalPackages}</li>
                <li>Total de Reservas: ${reportData.totalReservations}</li>
                <li>Total de Ocorrências: ${reportData.totalIncidents}</li>
            </ul>
        `;

        const reportWindow = window.open('', '', 'width=800,height=600');
        reportWindow.document.write(reportHtml);
        reportWindow.document.close();
        reportWindow.print();

    } catch (error) {
        console.error('Erro ao gerar relatório:', error);
        showAlert('Erro ao gerar relatório.', 'danger');
    }
}

export { generateSystemReport };
