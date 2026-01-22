document.addEventListener("DOMContentLoaded", () => {

  // ===============================
  // DOM
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
  // CANVAS SCALING (RETINA FIX)
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
  // INIT
  // ===============================
  dateInput.valueAsDate = new Date();

  let data = [];
  try {
    data = JSON.parse(localStorage.getItem("bodyData")) || [];
  } catch {
    data = [];
  }

  // ===============================
  // TABLE
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
  // AXES
  // ===============================
  function drawAxes(pad, w, h) {
    ctx.strokeStyle = "#999";
    ctx.lineWidth = 1;

    // Y-Achse
    ctx.beginPath();
    ctx.moveTo(pad, pad);
    ctx.lineTo(pad, pad + h);
    ctx.stroke();

    // X-Achse
    ctx.beginPath();
    ctx.moveTo(pad, pad + h);
    ctx.lineTo(pad + w, pad + h);
    ctx.stroke();

    // Y-Skala
    ctx.fillStyle = "#666";
    ctx.font = "12px sans-serif";
    ctx.textAlign = "right";
    ctx.textBaseline = "middle";

    const steps = 5;
    for (let i = 0; i <= steps; i++) {
      const y = pad + h - (i / steps) * h;
      const value = Math.round((i / steps) * 100);
      ctx.fillText(value, pad - 6, y);

      ctx.strokeStyle = "#eee";
      ctx.beginPath();
      ctx.moveTo(pad, y);
      ctx.lineTo(pad + w, y);
      ctx.stroke();
    }

    // X-Labels (Datum)
    ctx.textAlign = "center";
    ctx.textBaseline = "top";
    data.forEach((d, i) => {
      const x = pad + (i / (data.length - 1 || 1)) * w;
      ctx.fillStyle = "#666";
      ctx.fillText(d.date.slice(5), x, pad + h + 6);
    });
  }

  // ===============================
  // CHART
  // ===============================
  function renderChart() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    if (data.length < 2) return;

    const pad = 40;
    const w = canvas.width / (window.devicePixelRatio || 1) - pad * 2;
    const h = canvas.height / (window.devicePixelRatio ||
