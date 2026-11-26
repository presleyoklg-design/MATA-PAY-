// MATA PAY — prototype de démonstration uniquement.
const state = { balance: 0, operations: [], dailyChecks: [], withdrawalRequests: [] };
const titles = {
  dashboard: "Tableau de bord",
  register: "Créer un compte",
  savings: "Mon épargne",
  mobikisi: "Carte Mobikisi",
  credit: "Simulation crédit",
  history: "Historique"
};

function navigate(page) {
  document.querySelectorAll(".page").forEach(section => section.classList.remove("active"));
  const target = document.getElementById(page);
  if (!target) return;
  target.classList.add("active");
  document.getElementById("page-title").textContent = titles[page] || "MATA PAY";
  const profileLabel = document.getElementById("profile-label");
  if (profileLabel) profileLabel.textContent = demoProfile ? demoProfile + " — démonstration" : "Visiteur — démonstration";
  document.querySelectorAll("[data-page]").forEach(button => button.classList.toggle("active", button.dataset.page === page));
  window.scrollTo({ top: 0, behavior: "smooth" });
  updateInterface();
}
document.querySelectorAll("[data-page]").forEach(button => button.addEventListener("click", () => navigate(button.dataset.page)));
document.addEventListener("click", event => {
  const trigger = event.target.closest("[data-go]");
  if (trigger) {
    event.preventDefault();
    navigate(trigger.dataset.go);
  }
});

function money(amount) {
  return new Intl.NumberFormat("fr-FR", { maximumFractionDigits: 0 }).format(amount) + " FCFA";
}
function makeReference() {
  const stamp = new Date().toISOString().replace(/[-:TZ.]/g, "").slice(0, 14);
  return "MP-" + stamp + "-" + Math.random().toString(36).slice(2, 8).toUpperCase();
}
function localDayKey(date = new Date()) {
  return [date.getFullYear(), String(date.getMonth()+1).padStart(2,"0"), String(date.getDate()).padStart(2,"0")].join("-");
}
function productBalance(product) {
  return state.operations.filter(op => op.product === product).reduce((sum, op) => sum + op.amount, 0);
}
function showResult(id, message) {
  const el = document.getElementById(id);
  el.style.display = "block";
  el.textContent = message;
}
function openReceipt(operation) {
  const receiptWindow = window.open("", "_blank");
  if (!receiptWindow) {
    alert("Autorisez les fenêtres pop-up pour consulter le reçu, puis réessayez.");
    return;
  }
  const safe = value => String(value ?? "").replace(/[&<>"']/g, char => ({
    "&":"&amp;", "<":"&lt;", ">":"&gt;", '"':"&quot;", "'":"&#39;"
  }[char]));
  receiptWindow.document.write(`<!doctype html><html lang="fr"><head><meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1"><title>Reçu MATA PAY - ${safe(operation.reference)}</title>
  <style>
  body{font-family:Arial,sans-serif;background:#f5f7f4;color:#25352c;padding:20px}
  .receipt{max-width:580px;margin:20px auto;background:#fff;border:1px solid #e7ece7;border-radius:16px;padding:28px}
  h1{color:#124b35;margin:0 0 6px}.subtitle{color:#7c8980;font-size:13px}
  .amount{font-size:30px;color:#124b35;font-weight:bold;margin:25px 0}
  .row{display:flex;justify-content:space-between;gap:16px;padding:13px 0;border-bottom:1px solid #e7ece7}
  .row span{color:#7c8980}.status{color:#124b35;font-weight:bold}
  .note{color:#7c8980;font-size:12px;line-height:1.6;margin-top:24px}
  button{background:#124b35;color:white;border:0;border-radius:8px;padding:13px 18px;margin-top:20px;font-weight:bold}
  @media print{body{background:#fff;padding:0}.receipt{border:0;margin:0 auto}button{display:none}}
  </style></head><body><main class="receipt">
  <h1>MATA PAY</h1><div class="subtitle">Reçu de dépôt — Prototype de démonstration</div>
  <div class="amount">+${safe(money(operation.amount))}</div>
  <div class="row"><span>Formule</span><strong>${safe(operation.product)}</strong></div>
  <div class="row"><span>Date et heure</span><strong>${safe(operation.date)}</strong></div>
  ${operation.maturityDate ? `<div class="row"><span>Échéance indicative (un an)</span><strong>${safe(operation.maturityDate)}</strong></div>` : ""}
  <div class="row"><span>Référence unique</span><strong>${safe(operation.reference)}</strong></div>
  <div class="row"><span>Statut</span><strong class="status">Confirmé — simulation</strong></div>
  <div class="row"><span>Solde total simulé après dépôt</span><strong>${safe(money(operation.balanceAfter))}</strong></div>
  <div class="row"><span>Description</span><strong>${safe(operation.note)}</strong></div>
  <p class="note">Ce document atteste uniquement d'une opération fictive dans le prototype. Il ne constitue pas une preuve de dépôt de fonds réels. Pour obtenir un PDF, choisissez « Enregistrer au format PDF » dans les options d'impression du navigateur.</p>
  <button onclick="window.print()">Imprimer / Enregistrer en PDF</button></main></body></html>`);
  receiptWindow.document.close();
}

const depositProduct = document.getElementById("deposit-product");
const depositAmount = document.getElementById("deposit-amount");
const depositMinimum = document.getElementById("deposit-minimum");
const mobikisiChoice = document.getElementById("mobikisi-choice");
const mobikisiChoiceField = document.getElementById("mobikisi-choice-field");
function updateDepositRule() {
  const isMobikisi = depositProduct.value === "Compte Mobikisi";
  mobikisiChoiceField.hidden = !isMobikisi;
  if (isMobikisi) {
    depositAmount.value = mobikisiChoice.value;
    depositAmount.min = mobikisiChoice.value;
    depositAmount.readOnly = true;
    depositMinimum.textContent = "Une seule contribution quotidienne par date est autorisée dans cette démonstration.";
  } else {
    depositAmount.readOnly = false;
    depositAmount.min = "1";
    depositMinimum.textContent = depositProduct.value === "Épargne Bloquée"
      ? "Durée de référence : un an. Aucun retrait anticipé n'est simulé."
      : "Retrait mensuel indiqué sur l'affiche. Aucun rendement n'est calculé automatiquement.";
  }
}
depositProduct.addEventListener("change", updateDepositRule);
mobikisiChoice.addEventListener("change", () => {
  depositAmount.value = mobikisiChoice.value;
  depositAmount.min = mobikisiChoice.value;
});

document.getElementById("deposit-button").addEventListener("click", () => {
  const amount = Number(depositAmount.value);
  const product = depositProduct.value;
  const noteInput = document.getElementById("deposit-note");
  const note = noteInput.value.trim();
  if (!Number.isSafeInteger(amount) || amount <= 0) {
    alert("Veuillez saisir un montant entier valide en FCFA.");
    return;
  }
  if (product === "Compte Mobikisi") {
    const selected = Number(mobikisiChoice.value);
    if (amount !== selected) {
      alert("Choisissez l'un des montants Mobikisi affichés.");
      return;
    }
    if (state.operations.some(op => op.product === product && op.dayKey === localDayKey())) {
      alert("Une contribution Mobikisi a déjà été enregistrée aujourd'hui dans cette démonstration.");
      return;
    }
  }
  const confirmedAt = new Date();
  const maturityDate = product === "Épargne Bloquée"
    ? new Date(confirmedAt.getFullYear()+1, confirmedAt.getMonth(), confirmedAt.getDate()).toLocaleDateString("fr-FR")
    : null;
  const operation = {
    amount, product, note: note || "Opération simulée",
    date: confirmedAt.toLocaleString("fr-FR"),
    timestamp: confirmedAt.toISOString(),
    dayKey: localDayKey(confirmedAt),
    reference: makeReference(),
    status: "confirmed",
    balanceAfter: state.balance + amount,
    maturityDate
  };
  state.balance += amount;
  state.operations.unshift(operation);
  saveState();
  depositAmount.value = "";
  noteInput.value = "";
  const result = document.getElementById("deposit-result");
  result.style.display = "block";
  result.replaceChildren();
  const message = document.createElement("p");
  message.textContent = "Dépôt fictif confirmé : " + money(amount) + " — " + operation.reference;
  const receiptButton = document.createElement("button");
  receiptButton.className = "primary-button";
  receiptButton.textContent = "Consulter / enregistrer le reçu PDF";
  receiptButton.addEventListener("click", () => openReceipt(operation));
  result.append(message, receiptButton);
  updateInterface();
});

document.getElementById("simple-withdrawal-button").addEventListener("click", () => {
  const now = new Date();
  const monthKey = now.getFullYear() + "-" + String(now.getMonth()+1).padStart(2,"0");
  if (state.withdrawalRequests.some(item => item.monthKey === monthKey)) {
    showResult("simple-withdrawal-result", "Une demande de retrait mensuel a déjà été enregistrée pour ce mois dans la démonstration.");
  } else {
    const request = { monthKey, date: now.toLocaleString("fr-FR"), reference: makeReference(), status: "demande fictive" };
    state.withdrawalRequests.push(request);
    saveState();
    showResult("simple-withdrawal-result", "Demande de retrait mensuel fictive enregistrée : " + request.reference + ". Aucun fonds n'est versé.");
  }
});
function refreshSavingsTracking() {
  const checked = state.dailyChecks.includes(localDayKey());
  document.getElementById("blocked-checkin-status").textContent = checked
    ? "Pointage du jour déjà effectué — simulation."
    : "Aucun pointage enregistré aujourd'hui.";
}
document.getElementById("blocked-checkin-button").addEventListener("click", () => {
  const today = localDayKey();
  if (state.dailyChecks.includes(today)) {
    showResult("blocked-checkin-result", "Le pointage du jour a déjà été effectué.");
  } else {
    state.dailyChecks.push(today);
    saveState();
    showResult("blocked-checkin-result", "Pointage journalier enregistré — simulation uniquement.");
  }
  refreshSavingsTracking();
});

// SIMULATION DE CRÉDIT — aucune demande réelle.
document.getElementById("credit-button").addEventListener("click", () => {
  const amount = Number(document.getElementById("credit-amount").value);
  const duration = Number(document.getElementById("credit-duration").value);
  if (!Number.isFinite(amount) || amount <= 0 || !Number.isInteger(duration) || duration < 1 || duration > 60) {
    alert("Veuillez vérifier le montant et la durée.");
    return;
  }
  const monthly = amount / duration;
  const result = document.getElementById("credit-result");
  result.style.display = "block";
  result.innerHTML = "<strong>Résultat indicatif</strong><br>Montant demandé : " + money(amount) +
    "<br>Durée : " + duration + " mois<br>Mensualité estimée hors intérêts et frais : <strong>" +
    money(monthly) + "</strong><br><small>Ce calcul ne représente pas une offre de financement.</small>";
});

function renderOperations(containerId, limit, productFilter) {
  const container = document.getElementById(containerId);
  const filtered = productFilter ? state.operations.filter(op => op.product === productFilter) : state.operations;
  const operations = limit ? filtered.slice(0, limit) : filtered;
  if (containerId === "history-table") {
    const body = container.querySelector("tbody");
    body.replaceChildren();
    operations.forEach(operation => {
      const row = document.createElement("tr");
      [operation.product || "Épargne Simple", operation.note, money(operation.amount), operation.date].forEach(value => {
        const cell = document.createElement("td"); cell.textContent = value; row.appendChild(cell);
      });
      body.appendChild(row);
    });
    return;
  }
  if (!operations.length) {
    container.className = "empty";
    container.textContent = "Aucune opération enregistrée.";
    return;
  }
  container.className = "table-wrap";
  const table = document.createElement("table");
  const head = document.createElement("tr");
  ["Date", "Formule", "Description", "Montant", "Reçu"].forEach(label => {
    const th = document.createElement("th"); th.textContent = label; head.appendChild(th);
  });
  table.appendChild(head);
  operations.forEach(operation => {
    const row = document.createElement("tr");
    [operation.date, operation.product || "Épargne Simple", operation.note, "+" + money(operation.amount)].forEach(value => {
      const cell = document.createElement("td"); cell.textContent = value; row.appendChild(cell);
    });
    const cell = document.createElement("td");
    const button = document.createElement("button");
    button.className = "primary-button";
    button.textContent = "Voir le reçu";
    button.addEventListener("click", () => openReceipt(operation));
    cell.appendChild(button); row.appendChild(cell); table.appendChild(row);
  });
  container.replaceChildren(table);
}

function updateInterface() {
  const count = state.operations.length;
  const balanceText = money(state.balance);
  document.getElementById("dashboard-balance").textContent = balanceText;
  document.getElementById("dashboard-count").textContent = count;
  document.getElementById("savings-balance").textContent = balanceText;
  document.getElementById("savings-count").textContent = count;
  document.getElementById("mobikisi-total").textContent = money(productBalance("Compte Mobikisi"));
  document.getElementById("mobikisi-count").textContent = state.operations.filter(op => op.product === "Compte Mobikisi").length;
  document.getElementById("simple-balance").textContent = money(productBalance("Épargne Simple"));
  document.getElementById("blocked-balance").textContent = money(productBalance("Épargne Bloquée"));
  document.getElementById("mobikisi-savings-balance").textContent = money(productBalance("Compte Mobikisi"));
  renderOperations("recent-activity", 5);
  renderOperations("mobikisi-history", 5, "Compte Mobikisi");
  renderOperations("savings-history", 10);
  renderOperations("history-table");
}

const STORAGE_KEY = "matapay-demo-v1";
const PROFILE_KEY = "matapay-demo-profile-v1";
let demoProfile = "";
function saveState() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (error) {
    console.warn("Sauvegarde locale indisponible :", error);
    alert("La sauvegarde locale n'est pas disponible sur cet appareil.");
  }
}
function loadState() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || "null");
    if (!saved || !Array.isArray(saved.operations)) return;
    state.operations = saved.operations.filter(op =>
      op && Number.isSafeInteger(op.amount) && op.amount > 0 &&
      typeof op.note === "string" && typeof op.date === "string"
    ).map(op => ({
      ...op,
      product: op.product || "Épargne Simple",
      reference: op.reference || makeReference(),
      status: "confirmed"
    }));
    state.dailyChecks = Array.isArray(saved.dailyChecks) ? saved.dailyChecks : [];
    state.withdrawalRequests = Array.isArray(saved.withdrawalRequests) ? saved.withdrawalRequests : [];
    state.balance = state.operations.reduce((total, op) => total + op.amount, 0);
  } catch (error) {
    console.warn("Données locales non récupérables :", error);
  }
}
try {
  const savedProfile = localStorage.getItem(PROFILE_KEY);
  if (savedProfile) {
    try {
      const parsedProfile = JSON.parse(savedProfile);
      demoProfile = parsedProfile && typeof parsedProfile === "object"
        ? (parsedProfile.name || "")
        : savedProfile;
    } catch {
      demoProfile = savedProfile;
    }
  }
} catch (error) { demoProfile = ""; }
const registerForm = document.getElementById("register-form");
if (registerForm) {
  registerForm.addEventListener("submit", event => {
    event.preventDefault();
    const field = document.getElementById("display-name");
    const firstNameField = document.getElementById("demo-first-name");
    const emailField = document.getElementById("demo-email");
    const ageField = document.getElementById("demo-age");
    const genderField = document.getElementById("demo-gender");
    const countryField = document.getElementById("demo-country");
    const cityField = document.getElementById("demo-city");
    const neighborhoodField = document.getElementById("demo-neighborhood");
    const phoneField = document.getElementById("demo-phone");
    const name = field.value.trim().replace(/\s+/g, " ");
    const firstName = firstNameField.value.trim().replace(/\s+/g, " ");
    const email = emailField.value.trim();
    const age = Number(ageField.value);
    const country = countryField.value.trim();
    const city = cityField.value.trim();
    const neighborhood = neighborhoodField.value.trim();
    const phone = phoneField.value.trim();
    if (!name || name.length > 40 || !firstName || firstName.length > 50) {
      showResult("register-result", "Renseignez un nom d'affichage et un prénom valides.");
      return;
    }
    if (!email || !emailField.checkValidity()) {
      showResult("register-result", "Saisissez une adresse e-mail au format valide. Utilisez une adresse fictive pour la démonstration.");
      return;
    }
    if (!Number.isInteger(age) || age < 18 || age > 120) {
      showResult("register-result", "L'âge doit être un nombre entier compris entre 18 et 120 ans.");
      return;
    }
    if (!country || !city || !neighborhood) {
      showResult("register-result", "Renseignez le pays, la ville et le quartier.");
      return;
    }
    if (!phoneField.checkValidity() || !phone) {
      showResult("register-result", "Saisissez un numéro de démonstration valide (7 à 20 caractères autorisés).");
      return;
    }
    demoProfile = name;
    const demoDetails = { name, firstName, email, age, gender: genderField.value, country, city, neighborhood, phone };
    try {
      localStorage.setItem(PROFILE_KEY, JSON.stringify(demoDetails));
      showResult("register-result", "Votre espace de démonstration est créé sur cet appareil. Aucune opération réelle n'est possible.");
      document.getElementById("profile-label").textContent = demoProfile + " — démonstration";
      registerForm.reset();
    } catch (error) {
      showResult("register-result", "La sauvegarde locale n'est pas disponible sur cet appareil. Réessayez dans un autre navigateur.");
    }
  });
}
loadState();
updateDepositRule();
updateInterface();
refreshSavingsTracking();
