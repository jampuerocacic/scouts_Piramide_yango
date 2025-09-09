const Papa = require('papaparse');

async function loadData() {
  const url = localStorage.getItem("sheetUrl"); // obtenemos el link guardado
  if (!url) {
    alert("Por favor, ingresa y guarda un link de Google Sheets antes de cargar.");
    return;
  }

  const res = await fetch(url);
  const text = await res.text();

  console.log("Datos crudos del CSV:", text.substring(0, 200));

  const scouts = Papa.parse(text, { header: true, skipEmptyLines: true }).data;
  console.log("Objetos parseados:", scouts);

  // Procesar datos
  scouts.forEach(s => {
    s.id = s.ID;
    s.parentId = s.PADRE || null;
    s.name = s.SCOUT;
    s.companyIncome = parseFloat(s.INGRESO) || 0;
    s.directIncome = 0;
    s.descendantIncome = 0;
    s.totalIncome = 0;
  });

  const map = {};
  scouts.forEach(s => (map[s.id] = s));

  scouts.forEach(s => {
    s.directIncome = s.companyIncome * 0.01 / 0.03;
  });

  scouts.forEach(s => {
    let current = s.parentId;
    let share = 0.0025;
    while (current && map[current]) {
      const parent = map[current];
      parent.descendantIncome += s.companyIncome * share / 0.03;
      share /= 2;
      current = parent.parentId;
    }
  });

  scouts.forEach(s => {
    s.totalIncome = s.directIncome + s.descendantIncome;
  });

  // Guardar los datos para exportación
  window.lastScouts = scouts;

  // Renderizar la tabla
  renderTable(scouts);
}

function renderTable(scouts) {
  const tbody = document.querySelector("#resultTable tbody");
  tbody.innerHTML = "";

  scouts.forEach(s => {
    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${s.id}</td>
      <td>${s.name}</td>
      <td>${s.directIncome.toFixed(2)}</td>
      <td>${s.descendantIncome.toFixed(2)}</td>
      <td>${s.totalIncome.toFixed(2)}</td>
    `;
    tbody.appendChild(row);
  });
}

function exportCSV(scouts) {
  const data = scouts.map(s => ({
    ID: s.id,
    Scout: s.name,
    Directo: s.directIncome.toFixed(2),
    Descendientes: s.descendantIncome.toFixed(2),
    Total: s.totalIncome.toFixed(2)
  }));

  const csv = Papa.unparse(data);
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);

  const link = document.createElement("a");
  link.setAttribute("href", url);
  link.setAttribute("download", "scouts_resultados.csv");
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

// Guardar link en localStorage
function saveLink() {
  const urlInput = document.getElementById("sheetUrlInput").value.trim();
  if (!urlInput) {
    alert("Por favor ingresa un link válido.");
    return;
  }
  localStorage.setItem("sheetUrl", urlInput);
  alert("✅ Link guardado correctamente.");
}

// Conectar botones después de que el DOM esté listo
// Conectar botones después de que el DOM esté listo
document.addEventListener("DOMContentLoaded", () => {
  document.getElementById("loadBtn").addEventListener("click", loadData);
  document.getElementById("exportBtn").addEventListener("click", () => exportCSV(window.lastScouts || []));
  document.getElementById("saveLinkBtn").addEventListener("click", saveLink);
});

