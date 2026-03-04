import { db } from "./firebase.js";
import { doc, setDoc, onSnapshot } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

const params = new URLSearchParams(window.location.search);
const roomId = params.get("room");

if (!roomId) {
  alert("Adicione ?room=nomedasala na URL");
  throw new Error("RoomId ausente.");
}

const questions = [
  "Quando você pensa em nós dois, o que você mais espera que a gente construa juntos?",
  "O que eu faço que te deixa mais feliz, mesmo que eu nem perceba?",
  "Existe algo em mim que te dá medo de se entregar totalmente?",
  "Quando a gente briga ou fica estranho, o que passa na sua cabeça que você nem sempre fala?",
  "Você sente que pode ser 100% você comigo? Se não, o que te trava?",
  "Se um dia eu estivesse distante, como você reagiria de verdade?",
  "O que você mais admira em mim, mas talvez nunca tenha dito claramente?",
  "Se alguém perguntasse por que você escolheu ficar comigo, o que você responderia?",
  "Qual é o seu maior medo quando pensa no futuro da gente?",
  "Se você pudesse me pedir uma coisa para melhorar entre nós, qual seria?"
];

let currentQuestion = 0;
let respostas = [];
let userName = "";

const container = document.getElementById("question-container");

function pedirNome() {
  container.innerHTML = `
    <h2>Digite seu nome</h2>
    <input type="text" id="nomeInput" placeholder="Seu nome">
    <button id="startBtn">Começar</button>
  `;

  document.getElementById("startBtn").addEventListener("click", () => {
    const nomeDigitado = document.getElementById("nomeInput").value.trim();

    if (!nomeDigitado) {
      alert("Digite seu nome.");
      return;
    }

    userName = nomeDigitado;
    showQuestion(0);
  });
}

function showQuestion(index) {
  const pergunta = questions[index];

  container.innerHTML = `
    <h2>Pergunta ${index + 1} de ${questions.length}</h2>
    <p>${pergunta}</p>

    <textarea id="resposta" rows="4" placeholder="Digite sua resposta..."></textarea>

    <label>Importância (0-10):</label>
    <input type="number" id="importancia" min="0" max="10">

    <button id="nextBtn">
      ${index === questions.length - 1 ? "Finalizar" : "Próxima"}
    </button>
  `;

  document.getElementById("nextBtn").addEventListener("click", nextQuestion);
}

async function nextQuestion() {
  const resposta = document.getElementById("resposta").value.trim();
  const importancia = Number(document.getElementById("importancia").value);

  if (!resposta) {
    alert("Responda antes de continuar.");
    return;
  }

  if (isNaN(importancia) || importancia < 0 || importancia > 10) {
    alert("Defina uma importância entre 0 e 10.");
    return;
  }

  respostas.push({
    pergunta: questions[currentQuestion],
    resposta,
    importancia
  });

  currentQuestion++;

  if (currentQuestion < questions.length) {
    showQuestion(currentQuestion);
  } else {
    await salvarNoFirestore();
    mostrarAguardando();
  }
}

async function salvarNoFirestore() {
  await setDoc(
    doc(db, "casais", roomId),
    {
      users: {
        [userName]: {
          respostas
        }
      }
    },
    { merge: true }
  );
}

function mostrarAguardando() {
  container.innerHTML = `
    <h2>Respostas enviadas</h2>
    <p>Aguardando a outra pessoa responder.</p>
  `;
}

onSnapshot(doc(db, "casais", roomId), (snapshot) => {
  const data = snapshot.data();
  if (!data?.users) return;

  const nomes = Object.keys(data.users);

  if (nomes.length === 2) {
    container.innerHTML = `
      <h2>Ambos responderam.</h2>
      <button id="verRespostasBtn">Veja aqui as respostas</button>
      <div id="respostasContainer"></div>
    `;

    document
      .getElementById("verRespostasBtn")
      .addEventListener("click", () => {
        mostrarRespostas(data.users);
      });
  }
});

function mostrarRespostas(usersObj) {
  const nomes = Object.keys(usersObj);
  const user1 = usersObj[nomes[0]];
  const user2 = usersObj[nomes[1]];

  const respostasContainer = document.getElementById("respostasContainer");

  let html = `<h3>${nomes[0]} x ${nomes[1]}</h3>`;

  for (let i = 0; i < user1.respostas.length; i++) {
    html += `
      <div style="margin-bottom:20px;">
        <strong>Pergunta ${i + 1}</strong><br><br>

        <b>${nomes[0]}:</b><br>
        ${user1.respostas[i].resposta}<br>
        Importância: ${user1.respostas[i].importancia}<br><br>

        <b>${nomes[1]}:</b><br>
        ${user2.respostas[i].resposta}<br>
        Importância: ${user2.respostas[i].importancia}
      </div>
      <hr>
    `;
  }

  respostasContainer.innerHTML = html;
}

pedirNome();

