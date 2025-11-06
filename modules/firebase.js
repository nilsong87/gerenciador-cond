// ATENÇÃO: ESTE ARQUIVO DEVE CONTER APENAS A CONFIGURAÇÃO CLIENT-SIDE DO FIREBASE.
// NUNCA COLOQUE CHAVES DE CONTA DE SERVIÇO (SERVICE ACCOUNT KEYS) AQUI, POIS ELAS SÃO SENSÍVEIS E DEVEM SER USADAS APENAS EM AMBIENTES DE BACKEND SEGUROS.

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
firebase.initializeApp(firebaseConfig);

// Firebase services
const auth = firebase.auth();
const db = firebase.firestore();
const storage = firebase.storage();

export { auth, db, storage };