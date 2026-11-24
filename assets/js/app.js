
// DONNÉES DE DÉMONSTRATION
const state = {
  balance: 0,
  operations: []
};

const titles = {
  dashboard: "Tableau de bord",
  savings: "Mon épargne",
  mobikisi: "Carte Mobikisi",
  credit: "Simulation crédit",
  history: "Historique"
};

// NAVIGATION ENTRE LES RUBRIQUES
function navigate(page) {
  document.querySelectorAll(".page").forEach(section => {
    section.classList.remove("active");
  });

  document.getElementById(page).classList.add("active");
  document.getElementById("page-title").textContent = titles[page];

  document.querySelectorAll("[data-page]").forEach(button => {
    button.classList.toggle("active", button.dataset.page === page);
  });

  window.scrollTo({ top: 0, behavior: "smooth" });
  updateInterface();
}

document.querySelectorAll("[data-page]").forEach(button => {
  button.addEventListener("click", () => navigate(button.dataset.page));
});

document.querySelectorAll("[data-go]").forEach(button => {
  button.addEventListener("click", () => navigate(button.dataset.go));
});

// FORMATAGE DES MONTANTS
function money(amount) {
  return new Intl.NumberFormat("fr-FR").format(amount) + " FCFA";
}

// AJOUT D'UN VERSEMENT FICTIF
document.getElementById("deposit-button").addEventListener("click", () => {
  const amount = Number(document.getElementById("deposit-amount").value);
  const note = document.getElementById("deposit-note").value.trim();

  if (!Number.isFinite(amount) || amount <= 0) {
    alert("Veuillez saisir un montant valide.");
    return;
  }

  state.balance += amount;

  state.operations.unshift({
    amount,
    note: note || "Versement simulé",
    date: new Date().toLocaleString("fr-FR")
  });

  saveState();

  document.getElementById("deposit-amount").value = "";
  document.getElementById("deposit-note").value = "";

  const result = document.getElementById("deposit-result");
  result.style.display = "block";
  result.textContent = "Versement simulé enregistré : " + money(amount);

  updateInterface();
});

// SIMULATION DE CREDIT
document.getElementById("credit-button").addEventListener("click", () => {
  const amount = Number(document.getElementById("credit-amount").value);
  const duration = Number(document.getElementById("credit-duration").value);

  if (!Number.isFinite(amount) || amount <= 0 ||
      !Number.isInteger(duration) || duration < 1 || duration > 60) {
    alert("Veuillez vérifier le montant et la durée.");
    return;
  }

  const monthly = amount / duration;
  const result = document.getElementById("credit-result");

  result.style.display = "block";
  result.innerHTML =
    "<strong>Résultat indicatif</strong><br>" +
    "Montant demandé : " + money(amount) + "<br>" +
    "Durée : " + duration + " mois<br>" +
    "Mensualité estimée hors intérêts et frais : <strong>" +
    money(monthly) + "</strong><br><small>Ce calcul ne représente pas une offre de financement.</small>";
});

// AFFICHAGE DES OPERATIONS
function renderOperations(containerId, limit) {
  const container = document.getElementById(containerId);
  const operations = limit
    ? state.operations.slice(0, limit)
    : state.operations;

  if (operations.length === 0) {
    container.className = "empty";
    container.textContent = "Aucune opération enregistrée.";
    return;
  }

  container.className = "table-wrap";
  const table = document.createElement("table");
  const head = document.createElement("tr");

  ["Date", "Description", "Montant"].forEach(label => {
    const th = document.createElement("th");
    th.textContent = label;
    head.appendChild(th);
  });

  table.appendChild(head);

  operations.forEach(operation => {
    const row = document.createElement("tr");

    [operation.date, operation.note, "+" + money(operation.amount)].forEach(value => {
      const td = document.createElement("td");
      td.textContent = value;
      row.appendChild(td);
    });

    table.appendChild(row);
  });

  container.replaceChildren(table);
}

// MISE A JOUR DE TOUTES LES RUBRIQUES
function updateInterface() {
  const count = state.operations.length;
  const balanceText = money(state.balance);

  document.getElementById("dashboard-balance").textContent = balanceText;
  document.getElementById("dashboard-count").textContent = count;
  document.getElementById("savings-balance").textContent = balanceText;
  document.getElementById("mobikisi-total").textContent = balanceText;
  document.getElementById("mobikisi-count").textContent = count;

  renderOperations("recent-activity", 5);
  renderOperations("mobikisi-history", 5);
  renderOperations("history-table");
}

// SAUVEGARDE LOCALE DES DONNEES DE DEMONSTRATION
const STORAGE_KEY = "matapay-demo-v1";

function saveState() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (error) {
    console.warn("Sauvegarde locale indisponible :", error);
  }
}

function loadState() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || "null");

    if (!saved || !Array.isArray(saved.operations)) return;

    state.operations = saved.operations.filter(operation =>
      operation &&
      Number.isSafeInteger(operation.amount) &&
      operation.amount > 0 &&
      typeof operation.note === "string" &&
      typeof operation.date === "string"
    );

    state.balance = state.operations.reduce(
      (total, operation) => total + operation.amount,
      0
    );
  } catch (error) {
    console.warn("Données locales non récupérables :", error);
  }
}

// DEMARRAGE
loadState();
updateInterface();
                          
