// ATENÇÃO: ESTE ARQUIVO DEVE CONTER APENAS A CONFIGURAÇÃO CLIENT-SIDE DO FIREBASE.
// NUNCA COLOQUE CHAVES DE CONTA DE SERVIÇO (SERVICE ACCOUNT KEYS) AQUI, POIS ELAS SÃO SENSÍVEIS E DEVEM SER USADAS APENAS EM AMBIENTES DE BACKEND SEGUROS.

import { firebaseConfig } from '../config.js';

// Initialize Firebase
firebase.initializeApp(firebaseConfig);

// Firebase services
const auth = firebase.auth();
const db = firebase.firestore();
const storage = firebase.storage();

export { auth, db, storage };