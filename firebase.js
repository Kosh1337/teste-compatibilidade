// firebase.js

// 🔹 IMPORTS VIA CDN (OBRIGATÓRIO ASSIM)
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

// 🔹 SUA CONFIGURAÇÃO (já está correta)
const firebaseConfig = {
  apiKey: "AIzaSyCuNt8nJnzmH62L-jeRS-dUGMbNLo2v-qM",
  authDomain: "nosso-aniversario.firebaseapp.com",
  projectId: "nosso-aniversario",
  storageBucket: "nosso-aniversario.firebasestorage.app",
  messagingSenderId: "435088884263",
  appId: "1:435088884263:web:015946a6f81da264278402"
};

// 🔹 INICIALIZA
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// 🔹 EXPORTA O BANCO
export { db };