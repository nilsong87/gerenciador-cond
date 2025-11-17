// Este arquivo contém sua configuração do Firebase.
// Para produção, é altamente recomendável usar variáveis de ambiente
// ou um proxy do lado do servidor para evitar expor chaves de API sensíveis diretamente no código do lado do cliente.

// Exemplo de como você pode carregar a configuração de variáveis de ambiente
// (Este é um exemplo conceitual; a implementação real depende do seu processo de build/hospedagem)
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "YOUR_AUTH_DOMAIN",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "YOUR_PROJECT_ID",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "YOUR_STORAGE_BUCKET",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "YOUR_MESSAGING_SENDER_ID",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "YOUR_APP_ID",
// Opcional
};

// Initialize Firebase
// Ensure Firebase SDK is loaded before this script
if (typeof firebase !== 'undefined' && !firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
}

const db = firebase.firestore();
const storage = firebase.storage();

export { db, storage, firebaseConfig }; // Export firebaseConfig as well for other modules if needed