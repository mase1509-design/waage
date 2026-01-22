const form = document.getElementById('entryForm');
const tableBody = document.querySelector('#dataTable tbody');
const chart = document.getElementById('chart');
const ctx = chart.getContext('2d');

document.getElementById('date').valueAsDate = new Date();

let data = JSON.parse(localStorage.getItem('bodyData') || '[]');

function saveData() {
  localStorage.setItem('bodyData', JSON.stringify(data));
}

function renderTable() {
  tableBody.innerHTML = '';
  data.forEach(d => {
    const row = document.createElement('tr');
    row.innerHTML = `<td>${d.date}</td><td>${d.weight}</td><td>${d.muscle}</td><td>${d.fat}</td>`;
    tableBody.appendChild(row);
  });
}

function renderChart() {
  ctx.clearRect(0, 0, chart.width, chart.height);
  if (data.length < 2) return;

  const pad = 30;
  const h = chart.height - pad * 2;
  const w = chart.width - pad * 2;

  function drawLine(key, color) {
    const values = data.map(d => d[key]);
    const min = Math.min(...values);
    const max = Math.max(...values);

    ctx.strokeStyle = color;
    ctx.lineWidth = 3;
    ctx.beginPath();

    data.forEach((d, i) => {
      const x = pad + (i / (data.length - 1)) * w;
      const y = pad + h - ((d[key] - min) / (max - min || 1)) * h;

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

  drawLine('weight', '#ff3b30'); // Gewicht
  drawLine('muscle', '#34c759'); // Muskel
  drawLine('fat', '#007aff');    // Fett
}

form.addEventListener('submit', e => {
  e.preventDefault();
  const entry = {
    date: date.value,
    weight: parseFloat(weight.value),
    muscle: parseFloat(muscle.value),
    fat: parseFloat(fat.value)
  };
  data.push(entry);
  saveData();
  renderTable();
  renderChart();
  form.reset();
  date.valueAsDate = new Date();
});

renderTable();
renderChart();
