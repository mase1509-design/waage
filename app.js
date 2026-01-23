document.addEventListener("DOMContentLoaded", () => {

  // ===============================
  // DOM
  // ===============================
  const form = document.getElementById("entryForm");
  const tableBody = document.querySelector("#dataTable tbody");

  const canvases = {
    weight: document.getElementById("chartWeight"),
    muscle: document.getElementById("chartMuscle"),
    fat: document.getElementById("chartFat")
  };

  const ctxs = {
    weight: canvases.weight.getContext("2d"),
    muscle: canvases.muscle.getContext("2d"),
    fat: canvases.fat.getContext("2d")
  };

  const dateInput = document.getElementById("date");
  const weightInput = document.getElementById("weight");
  const muscleInput = document.getElementById("muscle");
  const fatInput = document.getElementById("fat");

  // ===============================
  // CANVAS SCALING (RETINA SAFE)
  // ===============================
  function resizeCanvas(canvas, ctx) {
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();

    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;

    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  Object.keys(canvases).forEach(key =>
    resizeCanvas(canvases[key], ctxs[key])
  );

  window.addEventListener("resize", () => {
    Object.keys(canvases).forEach(key =>
      resizeCanvas(canvases[key], ctxs[key])
    );
    renderCharts();
  });

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
        <td>${d.weight.toFixed(1)}</td>
        <td>${d.muscle.toFixed(1)}</td>
        <td>${d.fat.toFixed(1)}</td>
      `;
      tableBody.appendChild(tr);
    });
  }

  // ===============================
  // GENERIC LINE CHART
  // ===============================
  function drawLineChart({
    ctx,
    values,
    labels,
    minY,
    maxY,
    color,
    unit
  }) {
    const w = ctx.canvas.width / (window.devicePixelRatio || 1);
    const h = ctx.canvas.height / (window.devicePixelRatio || 1);

    ctx.clearRect(0, 0, w, h);

    if (values.length < 2) return;

    const pad = 40;
    const chartW = w - pad * 2;
    const chartH = h - pad * 2;

    // Axes
    ctx.strokeStyle = "#333";
    ctx.lineWidth = 1.5;

    ctx.beginPath();
    ctx.moveTo(pad, pad);
    ctx.lineTo(pad, pad + chartH);
    ctx.lineTo(pad + chartW, pad + chartH);
    ctx.stroke();

    // Y labels
    ctx.font = "12px sans-serif";
    ctx.fillStyle = "#333";
    ctx.textAlign = "right";
    ctx.textBaseline = "middle";

    for (let i = 0; i <= 5; i++) {
      const value = minY + (i / 5) * (maxY - minY);
      const y = pad + chartH - (i / 5) * chartH;
      ctx.fillText(value.toFixed(0) + unit, pad - 6, y);
    }

    // X labels
    ctx.textAlign = "center";
    ctx.textBaseline = "top";
    labels.forEach((label, i) => {
      const x = pad + (i / (labels.length - 1)) * chartW;
      ctx.fillText(label.slice(5), x, pad + chartH + 6);
    });

    // Line
    ctx.strokeStyle = color;
    ctx.lineWidth = 3;
    ctx.beginPath();

    values.forEach((val, i) => {
      const x = pad + (i / (values.length - 1)) * chartW;
      const y =
        pad +
        chartH -
        ((val - minY) / (maxY - minY)) * chartH;

      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    });

    ctx.stroke();
  }

  // ===============================
  // RENDER ALL CHARTS
  // ===============================
  function renderCharts() {
    const labels = data.map(d => d.date);

    drawLineChart({
      ctx: ctxs.weight,
      values: data.map(d => d.weight),
      labels,
      minY: 70,
      maxY: 110,
      color: "#ff3b30",
      unit: "kg"
    });

    drawLineChart({
      ctx: ctxs.muscle,
      values: data.map(d => d.muscle),
      labels,
      minY: 20,
      maxY: 60,
      color: "#34c759",
      unit: "%"
    });

    drawLineChart({
      ctx: ctxs.fat,
      values: data.map(d => d.fat),
      labels,
      minY: 5,
      maxY: 15,
      color: "#007aff",
      unit: "%"
    });
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
    renderCharts();

    form.reset();
    dateInput.valueAsDate = new Date();
  });

  // ===============================
  // START
  // ===============================
  renderTable();
  renderCharts();
});
