// ===============================
// DOM ELEMENTE
// ===============================
const form = document.getElementById("entryForm");
const tableBody = document.querySelector("#dataTable tbody");
const chart = document.getElementById("chart");
const ctx = chart.getContext("2d");

const dateInput = document.getElementById("date");
const weightInput = document.getElementById("weight");
const muscleInput = document.getElementById("muscle");
const fatInput = document.getElementById("fat");

// ===============================
// INITIALISIERUNG
// ===============================
dateInput.valueAsDate = new Date();

let data = [];
try {
  data = JSON.parse(localStorage.getItem("bodyData")) || [];
} catch {
  data = [];
}

// ===============================
// SPEICHERN
// ===============================
function saveData() {
  localStorage.setItem("bodyData", JSON.stringify(data));
}

// ===============================
// TABELLE
// ===============================
function renderTable() {
  tableBody.innerHTML = "";

  data.forEach(entry => {
    const row = document.createElement("tr");

    row.innerHTML = `
      <td>${entry.date}</td>
      <td>${entry.weight.toFixed(1)}</td>
      <td>${entry.muscle.toFixed(1)}</td>
      <td>${entry.fat.toFixed(1)}</td>
    `;

    tableBody.appendChild(row);
  });
}

// ===============================
// DIAGRAMM
// ===============================
function renderChart() {
  // Canvas leeren
  ctx.clearRect(0, 0, chart.width, chart.height);

  if (data.length < 2) return;

  const padding = 30;
  const width = chart.width - padding * 2;
  const height = chart.height - padding * 2;

  function drawLine(key, color) {
    const values = data.map(d => d[key]);
    const min = Math.min(...values);
    const max = Math.max(...values);
    const range = max - min || 1;

    ctx.strokeStyle = color;
    ctx.lineWidth = 3;
    ctx.beginPath();

    data.forEach((d, i) => {
      const x =
        padding + (i / (data.length - 1)) * width;

      const y =
        padding +
        height -
        ((d[key] - min) / range) * height;

      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);

      // Punkt
      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.arc(x, y, 4, 0, Math.PI * 2);
      ctx.fill();
    });

    ctx.stroke();
  }

  drawLine("weight", "#ff3b30"); // Gewicht
  drawLine("muscle", "#34c759"); // Muskelmasse
  drawLine("fat", "#007aff");    // Fettwert
}

// ===============================
// FORMULAR
// ===============================
form.addEventListener("submit", e => {
  e.preventDefault();

  const entry = {
    date: dateInput.value,
    weight: Number(weightInput.value),
    muscle: Number(muscleInput.value),
    fat: Number(fatInput.value)
  };

  if (
    !entry.date ||
    isNaN(entry.weight) ||
    isNaN(entry.muscle) ||
    isNaN(entry.fat)
  ) {
    alert("Bitte alle Felder korrekt ausfüllen");
    return;
  }

  data.push(entry);
  saveData();

  renderTable();
  renderChart();

  form.reset();
  dateInput.valueAsDate = new Date();
});

// ===============================
// INITIAL RENDER
// ===============================
renderTable();
renderChart();
