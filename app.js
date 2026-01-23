document.addEventListener("DOMContentLoaded", () => {

  const form = document.getElementById("entryForm");
  const tableBody = document.querySelector("#dataTable tbody");
  const canvas = document.getElementById("chart");
  const ctx = canvas.getContext("2d");

  const dateInput = document.getElementById("date");
  const weightInput = document.getElementById("weight");
  const muscleInput = document.getElementById("muscle");
  const fatInput = document.getElementById("fat");

  // ===============================
  // CANVAS FIX (ZWINGEND)
  // ===============================
  function resizeCanvas() {
    const rect = canvas.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;

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

  let data = JSON.parse(localStorage.getItem("bodyData") || "[]");

  // ===============================
  // TABLE
  // ===============================
  function renderTable() {
    tableBody.innerHTML = "";
    data.forEach(d => {
      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td>${d.date}</td>
        <td>${d.weight}</td>
        <td>${d.muscle}</td>
        <td>${d.fat}</td>
      `;
      tableBody.appendChild(tr);
    });
  }

  // ===============================
  // CHART + AXES (UNÜBERSEHBAR)
  // ===============================
function renderChart() {
  const w = canvas.width / (window.devicePixelRatio || 1);
  const h = canvas.height / (window.devicePixelRatio || 1);

  ctx.clearRect(0, 0, w, h);

  if (data.length < 2) return;

  const pad = 50;
  const chartW = w - pad * 2;
  const chartH = h - pad * 2;

  // Feste Skala
  const maxY = 100;
  const minY = 0;

  // Achsen
  ctx.strokeStyle = "#000";
  ctx.lineWidth = 2;

  ctx.beginPath();
  ctx.moveTo(pad, pad);
  ctx.lineTo(pad, pad + chartH);
  ctx.lineTo(pad + chartW, pad + chartH);
  ctx.stroke();

  // Y Labels
  ctx.font = "12px sans-serif";
  ctx.textAlign = "right";
  ctx.textBaseline = "middle";

  for (let i = 0; i <= 5; i++) {
    const val = i * 20;
    const y = pad + chartH - (val / maxY) * chartH;
    ctx.fillText(val + "%", pad - 6, y);
  }

  // X Labels
  ctx.textAlign = "center";
  ctx.textBaseline = "top";
  data.forEach((d, i) => {
    const x = pad + (i / (data.length - 1)) * chartW;
    ctx.fillText(d.date.slice(5), x, pad + chartH + 6);
  });

  function drawLine(key, color, normalize = false) {
    ctx.strokeStyle = color;
    ctx.lineWidth = 3;
    ctx.beginPath();

    data.forEach((d, i) => {
      let value = d[key];

      // Gewicht normalisieren (z.B. 0–150 kg → 0–100 %)
      if (normalize) value = (value / 150) * 100;

      const x = pad + (i / (data.length - 1)) * chartW;
      const y = pad + chartH - (value / maxY) * chartH;

      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);

      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.arc(x, y, 4, 0, Math.PI * 2);
      ctx.fill();
    });

    ctx.stroke();
  }

  drawLine("weight", "#ff3b30", true);  // normiertes Gewicht
  drawLine("muscle", "#34c759");        // %
  drawLine("fat", "#007aff");           // %
}


  // ===============================
  // FORM
  // ===============================
  form.addEventListener("submit", e => {
    e.preventDefault();

    data.push({
      date: dateInput.value,
      weight: Number(weightInput.value),
      muscle: Number(muscleInput.value),
      fat: Number(fatInput.value)
    });

    localStorage.setItem("bodyData", JSON.stringify(data));

    renderTable();
    renderChart();

    form.reset();
    dateInput.valueAsDate = new Date();
  });

  renderTable();
  renderChart();
});
