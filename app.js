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
  ctx.clearRect(0,0,chart.width,chart.height);
  if (data.length < 2) return;

  const pad = 20;
  const maxVal = Math.max(...data.map(d => Math.max(d.weight, d.muscle, d.fat)));
  const minVal = Math.min(...data.map(d => Math.min(d.weight, d.muscle, d.fat)));

  function drawLine(key, color) {
    ctx.strokeStyle = color;
    ctx.beginPath();
    data.forEach((d,i) => {
      const x = pad + i*(chart.width-2*pad)/(data.length-1);
      const y = chart.height - pad - (d[key]-minVal)/(maxVal-minVal)*(chart.height-2*pad);
      if(i===0) ctx.moveTo(x,y); else ctx.lineTo(x,y);
    });
    ctx.stroke();
  }

  drawLine('weight','red');
  drawLine('muscle','green');
  drawLine('fat','blue');
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
