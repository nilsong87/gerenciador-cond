// Your web app's Firebase configuration
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
const db = firebase.firestore();
const storage = firebase.storage();

export { db, storage };