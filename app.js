// ===============================
// DOM READY
// ===============================
document.addEventListener("DOMContentLoaded", () => {

  // ===============================
  // DOM ELEMENTE
  // ===============================
  const form = document.getElementById("entryForm");
  const tableBody = document.querySelector("#dataTable tbody");
  const canvas = document.getElementById("chart");
  const ctx = canvas.getContext("2d");

  const dateInput = document.getElementById("date");
  const weightInput = document.getElementById("weight");
  const muscleInput = document.getElementById("muscle");
  const fatInput = document.getElementById("fat");

  // ===============================
  // CANVAS FIX (DAS WAR DER FEHLER)
  // ===============================
  function resizeCanvas() {
    const dpr = window.devicePixelRatio || 1;

    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;

    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  resizeCanvas();
  window.addEventListener("resize", resizeCanvas);

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
  // TABELLE
  // ===============================
  function renderTable() {
    tableBody.innerHTML = "";
    data.forEach(e => {
      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td>${e.date}</td>
        <td>${e.weight.toFixed(1)}</td>
        <td>${e.muscle.toFixed(1)}</td>
        <td>${e.fat.toFixed(1)}</td>
      `;
      tableBody.appendChild(tr);
    });
  }

  // ===============================
  // DIAGRAMM (JETZT SICHTBAR)
  // ===============================
  function renderChart() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (data.length < 2) {
      // Debug-Hilfe: Rahmen zeichnen
      ctx.strokeStyle = "#ccc";
      ctx.strokeRect(0, 0, canvas.width, canvas.height);
      return;
    }

    const padding = 30;
    const w = canvas.width / (window.devicePixelRatio || 1) - padding * 2;
    const h = canvas.height / (window.devicePixelRatio || 1) - padding * 2;

    function drawLine(key, color) {
      const values = data.map(d => d[key]);
      const min = Math.min(...values);
      const max = Math.max(...values);
      const range = max - min || 1;

      ctx.strokeStyle = color;
      ctx.lineWidth = 3;
      ctx.beginPath();

      data.forEach((d, i) => {
        const x = padding + (i / (data.length - 1)) * w;
        const y = padding + h - ((d[key] - min) / range) * h;

        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);

        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.arc(x, y, 4, 0, Math.PI * 2);
        ctx.fill();
      });

      ctx.stroke();
    }

    drawLine("weight", "#ff3b30");
    drawLine("muscle", "#34c759");
    drawLine("fat", "#007aff");
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

    if (Object.values(entry).some(v => !v && v !== 0)) {
      alert("Bitte alle Felder ausfüllen");
      return;
    }

    data.push(entry);
    localStorage.setItem("bodyData", JSON.stringify(data));

    renderTable();
    renderChart();

    form.reset();
    dateInput.valueAsDate = new Date();
  });

  // ===============================
  // START
  // ===============================
  renderTable();
  renderChart();
});
