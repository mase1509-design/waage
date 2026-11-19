const STORAGE_KEY = "gewichtstracker_entries_v1";
const LEGACY_KEY = "bodyData";
const $ = (selector) => document.querySelector(selector);
const form = $("#entry-form");
const dateInput = $("#date");
const weightInput = $("#weight");
const historyBody = $("#history-body");
const canvas = $("#weight-chart");
const ctx = canvas.getContext("2d");
let entries = [];

try {
  // Clear the old version's browser data once, so its unrelated body metrics are not retained.
  if (localStorage.getItem("gewichtstracker_migrated_v1") !== "yes") {
    localStorage.removeItem(LEGACY_KEY);
    localStorage.setItem("gewichtstracker_migrated_v1", "yes");
  }
  entries = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
  if (!Array.isArray(entries)) entries = [];
} catch { entries = []; }

const todayISO = () => {
  const now = new Date();
  return new Date(now.getTime() - now.getTimezoneOffset() * 60000).toISOString().slice(0, 10);
};
const formatDate = (iso) => new Intl.DateTimeFormat("de-DE", {
  day: "2-digit", month: "2-digit", year: "numeric"
}).format(new Date(iso + "T12:00:00"));
const formatWeight = (value) => Number(value).toFixed(1).replace(".", ",");
const save = () => localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
const sortedEntries = () => [...entries].sort((a, b) => b.date.localeCompare(a.date));

function resetForm() {
  form.reset();
  dateInput.value = todayISO();
  delete form.dataset.editing;
  $("#save-button").innerHTML = 'Gewicht speichern <span>→</span>';
  $("#cancel-edit").hidden = true;
}
function renderHistory() {
  historyBody.replaceChildren();
  const sorted = sortedEntries();
  $("#empty-state").hidden = sorted.length > 0;
  sorted.forEach((entry) => {
    const row = document.createElement("tr");
    const date = document.createElement("td");
    date.textContent = formatDate(entry.date);
    const weight = document.createElement("td");
    weight.className = "weight-cell";
    weight.textContent = formatWeight(entry.weight) + " kg";
    const actions = document.createElement("td");
    actions.className = "actions-cell";

    const edit = document.createElement("button");
    edit.className = "icon-button";
    edit.type = "button";
    edit.textContent = "Bearbeiten";
    edit.setAttribute("aria-label", `Eintrag vom ${formatDate(entry.date)} bearbeiten`);
    edit.addEventListener("click", () => {
      dateInput.value = entry.date;
      weightInput.value = formatWeight(entry.weight);
      form.dataset.editing = entry.date;
      $("#save-button").innerHTML = 'Änderung speichern <span>→</span>';
      $("#cancel-edit").hidden = false;
      form.scrollIntoView({ behavior: "smooth", block: "center" });
      weightInput.focus();
    });

    const remove = document.createElement("button");
    remove.className = "icon-button delete";
    remove.type = "button";
    remove.textContent = "Löschen";
    remove.setAttribute("aria-label", `Eintrag vom ${formatDate(entry.date)} löschen`);
    remove.addEventListener("click", () => {
      if (!confirm(`Eintrag vom ${formatDate(entry.date)} wirklich löschen?`)) return;
      entries = entries.filter((item) => item.date !== entry.date);
      save();
      render();
    });

    actions.append(edit, remove);
    row.append(date, weight, actions);
    historyBody.append(row);
  });
}
function renderChart() {
  const width = canvas.clientWidth;
  const height = canvas.clientHeight;
  const dpr = Math.max(1, window.devicePixelRatio || 1);
  canvas.width = Math.round(width * dpr);
  canvas.height = Math.round(height * dpr);
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  ctx.clearRect(0, 0, width, height);

  const days = Number($("#range-select").value);
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - days);
  const points = [...entries]
    .filter((entry) => new Date(entry.date + "T12:00:00") >= cutoff)
    .sort((a, b) => a.date.localeCompare(b.date));

  const latest = sortedEntries()[0];
  $("#latest-weight").textContent = latest ? formatWeight(latest.weight) + " kg" : "—";
  $("#chart-subtitle").textContent = latest ? `Zuletzt am ${formatDate(latest.date)}` : "Noch keine Einträge";
  $("#chart-empty").hidden = points.length > 0;
  if (points.length < 2) return;

  const pad = { top: 18, right: 13, bottom: 29, left: 39 };
  const chartW = width - pad.left - pad.right;
  const chartH = height - pad.top - pad.bottom;
  const values = points.map((p) => Number(p.weight));
  const min = Math.floor((Math.min(...values) - 1) * 2) / 2;
  const max = Math.ceil((Math.max(...values) + 1) * 2) / 2;
  const span = Math.max(1, max - min);
  const x = (i) => pad.left + (i / (points.length - 1)) * chartW;
  const y = (v) => pad.top + ((max - v) / span) * chartH;

  ctx.font = "10px -apple-system, sans-serif";
  ctx.textAlign = "right";
  ctx.textBaseline = "middle";
  for (let i = 0; i <= 4; i++) {
    const value = min + (span * i) / 4;
    const yy = y(value);
    ctx.strokeStyle = "#edf0ec";
    ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(pad.left, yy); ctx.lineTo(width - pad.right, yy); ctx.stroke();
    ctx.fillStyle = "#87948b";
    ctx.fillText(formatWeight(value), pad.left - 7, yy);
  }

  const gradient = ctx.createLinearGradient(0, pad.top, 0, height - pad.bottom);
  gradient.addColorStop(0, "rgba(104, 157, 121, .22)");
  gradient.addColorStop(1, "rgba(104, 157, 121, 0)");
  ctx.beginPath();
  points.forEach((point, i) => i ? ctx.lineTo(x(i), y(point.weight)) : ctx.moveTo(x(i), y(point.weight)));
  ctx.lineTo(x(points.length - 1), height - pad.bottom);
  ctx.lineTo(x(0), height - pad.bottom);
  ctx.closePath();
  ctx.fillStyle = gradient; ctx.fill();

  ctx.beginPath();
  points.forEach((point, i) => i ? ctx.lineTo(x(i), y(point.weight)) : ctx.moveTo(x(i), y(point.weight)));
  ctx.strokeStyle = "#477b5c"; ctx.lineWidth = 2.5; ctx.lineJoin = "round"; ctx.lineCap = "round"; ctx.stroke();

  points.forEach((point, i) => {
    ctx.beginPath(); ctx.arc(x(i), y(point.weight), 3.5, 0, Math.PI * 2);
    ctx.fillStyle = "#fff"; ctx.fill(); ctx.strokeStyle = "#477b5c"; ctx.lineWidth = 2; ctx.stroke();
  });

  const labelIndices = [...new Set([0, Math.floor((points.length - 1) / 2), points.length - 1])];
  ctx.fillStyle = "#87948b"; ctx.textAlign = "center"; ctx.textBaseline = "top";
  labelIndices.forEach((i) => {
    const date = new Date(points[i].date + "T12:00:00");
    ctx.fillText(new Intl.DateTimeFormat("de-DE", { day: "2-digit", month: "2-digit" }).format(date), x(i), height - pad.bottom + 9);
  });
}
function render() { renderHistory(); renderChart(); }

form.addEventListener("submit", (event) => {
  event.preventDefault();
  const raw = weightInput.value.trim().replace(",", ".");
  if (!/^\d{1,3}(?:\.\d)?$/.test(raw)) {
    $("#form-message").textContent = "Bitte ein gültiges Gewicht mit höchstens einer Nachkommastelle eingeben.";
    weightInput.focus(); return;
  }
  const weight = Number(raw);
  if (!Number.isFinite(weight) || weight <= 0 || weight > 500) {
    $("#form-message").textContent = "Bitte ein realistisches Gewicht eingeben.";
    weightInput.focus(); return;
  }
  const date = dateInput.value;
  if (!date) { $("#form-message").textContent = "Bitte ein Datum auswählen."; return; }

  const editingDate = form.dataset.editing;
  entries = entries.filter((item) => item.date !== editingDate && item.date !== date);
  entries.push({ date, weight: Math.round(weight * 10) / 10 });
  save();
  $("#form-message").textContent = editingDate ? "Eintrag aktualisiert." : "Gewicht gespeichert.";
  resetForm();
  render();
});
$("#cancel-edit").addEventListener("click", resetForm);
$("#range-select").addEventListener("change", renderChart);
$("#export-button").addEventListener("click", () => {
  if (!entries.length) { alert("Noch keine Einträge zum Exportieren vorhanden."); return; }
  const rows = [["Datum", "Gewicht (kg)"], ...sortedEntries().map((e) => [e.date, formatWeight(e.weight).replace(",", ".")])];
  const csv = "\uFEFF" + rows.map((row) => row.map((cell) => `"${String(cell).replaceAll('"', '""')}"`).join(";")).join("\r\n");
  const url = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" }));
  const a = document.createElement("a"); a.href = url; a.download = "gewichtstracker.csv"; a.click();
  URL.revokeObjectURL(url);
});
dateInput.value = todayISO();
window.addEventListener("resize", renderChart);
render();
if ("serviceWorker" in navigator && location.protocol !== "file:") {
  window.addEventListener("load", () => navigator.serviceWorker.register("./sw.js").catch(() => {}));
}
