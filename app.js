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

    // Hintergrund
    ctx.fillStyle = "#f0f0f0";
    ctx.fillRect(0, 0, w, h);

    // Debug Text
    ctx.fillStyle = "#000";
    ctx.font = "16px sans-serif";
    ctx.fillText("Chart active", 10, 20);

    if (data.length < 2) {
      ctx.fillText("Zu wenig Daten", 10, 45);
      return;
    }

    const pad = 50;
    const chartW = w - pad * 2;
    const chartH = h - pad * 2;

    // ACHSEN
    ctx.strokeStyle = "#000";
    ctx.lineWidth = 2;

    // Y
    ctx.beginPath();
    ctx.moveTo(pad, pad);
    ctx.lineTo(pad, pad + chartH);
    ctx.stroke();

    // X
    ctx.beginPath();
    ctx.moveTo(pad, pad + chartH);
    ctx.lineTo(pad + chartW, pad + chartH);
    ctx.stroke();

    // Y Labels 0–100
    ctx.font = "14px sans-serif";
    ctx.textAlign = "right";
    ctx.textBaseline = "middle";

    for (let i = 0; i <= 5; i++) {
      const y = pad + chartH - (i / 5) * chartH;
      const val = i * 20;
      ctx.fillText(val, pad - 8, y);
    }

    // X Labels (Datum)
    ctx.textAlign = "center";
    ctx.textBaseline = "top";
    data.forEach((d, i) => {
      const x = pad + (i / (data.length - 1)) * chartW;
      ctx.fillText(d.date.slice(5), x, pad + chartH + 8);
    });

    function drawLine(key, color) {
      const vals = data.map(d => d[key]);
      const min = Math.min(...vals);
      const max = Math.max(...vals);
      const range = max - min || 1;

      ctx.strokeStyle = color;
      ctx.lineWidth = 3;
      ctx.beginPath();

      data.forEach((d, i) => {
        const x = pad + (i / (data.length - 1)) * chartW;
        const y = pad + chartH - ((d[key] - min) / range) * chartH;

        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);

        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.arc(x, y, 4, 0, Math.PI * 2);
        ctx.fill();
      });

      ctx.stroke();
    }

    drawLine("weight", "red");
    drawLine("muscle", "green");
    drawLine("fat", "blue");
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
