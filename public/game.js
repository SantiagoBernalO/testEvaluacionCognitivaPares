// Variables globales del juego
const NUM_PARES = 4;

const form = document.getElementById("userForm");
const game = document.getElementById("memoryGame");
const resultBox = document.getElementById("results");
const cardGrid = document.getElementById("cardGrid");
const evaluationSection = document.getElementById("evaluationSection");

// Obtener userData desde el módulo auth.js
let userData = {};
import("./auth.js").then(module => {
  userData = module.userData;
});

let cardValues = [];
let flippedCards = [];
let matched = 0;
let totalTries = 0;
let errores = [];
let aciertos = [];
let startTime = 0;

let lastFlipTime = null;
let oneCardTime = null;
let intentos = [];

// Iniciar el juego cuando se envía el formulario
form.addEventListener("submit", function (e) {
  e.preventDefault();
  const formData = new FormData(form);
  const formValues = Object.fromEntries(formData.entries());
  userData = { ...userData, ...formValues }; // Mezcla los datos anteriores con los nuevos
  form.classList.remove("active");
  startGame();
});

// Función para iniciar el juego
function startGame() {
  game.classList.add("active");
  cardGrid.innerHTML = '';
  errores = [];
  aciertos = [];
  matched = 0;
  totalTries = 0;
  flippedCards = [];
  cardValues = [];

  // Generar números aleatorios para los pares
  const numbers = [];
  while (numbers.length < NUM_PARES) {
    const num = Math.floor(Math.random() * 90 + 10);
    if (!numbers.includes(num)) numbers.push(num);
  }

  cardValues = [...numbers, ...numbers];
  shuffleArray(cardValues);

  // Crear las tarjetas en el grid
  cardValues.forEach((num, index) => {
    const card = document.createElement("div");
    card.classList.add("card");
    card.dataset.value = num;
    card.dataset.id = index;

    card.innerHTML = `<div class="card-inner">
    <div class="card-front">?</div>
    <div class="card-back">${num}</div>
    </div>`;
    card.addEventListener("click", () => flipCard(card));
    cardGrid.appendChild(card);
  });

  startTime = Date.now();
}

// Función para voltear una tarjeta
function flipCard(card) {
  if (card.classList.contains("flipped") || flippedCards.length === 2) return;

  const now = Date.now();

  if (flippedCards.length === 1) {
    const timeBetween = (now - oneCardTime) / 1000;

    intentos.push({
      intento: totalTries + 1,
      carta1_id: flippedCards[0].dataset.id,
      carta1_valor: flippedCards[0].dataset.value,
      carta2_id: card.dataset.id,
      carta2_valor: card.dataset.value,
      tiempo_entre_pares_seg: timeBetween.toFixed(2)
    });
  }

  if (flippedCards.length === 0) {
    oneCardTime = now;
  }

  card.classList.add("flipped");
  flippedCards.push(card);

  if (flippedCards.length === 2) {
    totalTries++;
    const [c1, c2] = flippedCards;

    if (c1.dataset.value === c2.dataset.value) {
      matched++;
      aciertos.push({
        intento: totalTries,
        id1: c1.dataset.id,
        id2: c2.dataset.id,
        valor: c1.dataset.value,
        resultado: "correcto"
      });
      flippedCards = [];

      if (matched === NUM_PARES) endGame();
    } else {
      errores.push({
        intento: totalTries,
        id1: c1.dataset.id,
        id2: c2.dataset.id,
        valor1: c1.dataset.value,
        valor2: c2.dataset.value,
        resultado: "incorrecto"
      });

      setTimeout(() => {
        c1.classList.remove("flipped");
        c2.classList.remove("flipped");
        flippedCards = [];
      }, 1000);
    }

    lastFlipTime = now;
  }
}

// Función para finalizar el juego
function endGame() {
  game.classList.remove("active");
  resultBox.classList.add("active");

  const endTime = Date.now();
  const duration = ((endTime - startTime) / 1000).toFixed(2);

  const summary = {
    ...userData,
    pares_presentados: cardValues.map((v, i) => ({ id: i, valor: v })),
    cantidad_pares: NUM_PARES,
    intentos_totales: totalTries,
    aciertos_totales: aciertos.length,
    errores_totales: errores.length,
    detalle_aciertos: aciertos,
    detalle_errores: errores,
    detalle_intentos: intentos,
    tiempo_total_segundos: duration
  };

  const apiURL = location.hostname === "localhost"
    ? "http://localhost:4000/guardar"
    : "https://testevaluacioncognitivapares.onrender.com/guardar";

  fetch(apiURL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(summary)
  })
    .then(res => res.text())
    .then(data => console.log("Guardado:", data))
    .catch(err => console.error("Error al guardar:", err));
}

// Función para mezclar un array (algoritmo Fisher-Yates)
function shuffleArray(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
}