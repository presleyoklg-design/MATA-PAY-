// MATA PAY — prototype de démonstration uniquement.
const state = { balance: 0, operations: [], dailyChecks: [], withdrawalRequests: [] };
const titles = {
  dashboard: "Tableau de bord",
  register: "Créer un compte",
  savings: "Mon épargne",
  mobikisi: "Carte Mobikisi",
  credit: "Espace prêt",
  "credit-admin": "Administration démo",
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
  *{box-sizing:border-box}
  body{font-family:Arial,sans-serif;background:#f2f5f2;color:#26382e;margin:0;padding:clamp(12px,4vw,28px)}
  .receipt{width:100%;max-width:620px;margin:clamp(4px,3vh,24px) auto;background:#fff;border:1px solid #e2e9e3;border-radius:20px;padding:clamp(20px,5vw,36px);box-shadow:0 12px 36px rgba(18,63,48,.08)}
  .receipt-head{display:flex;align-items:center;justify-content:space-between;gap:14px;padding-bottom:20px;border-bottom:1px solid #e8eee9}
  .brand{color:#124b35;font-size:25px;font-weight:900;letter-spacing:.06em}.brand-caption{display:block;margin-top:4px;color:#7c8980;font-size:11px}
  .demo-tag{flex:0 0 auto;padding:7px 10px;border-radius:30px;background:#fff6df;color:#765a19;font-size:10px;font-weight:800}
  .receipt-title{margin:24px 0 5px;color:#26382e;font-size:18px}.subtitle{margin:0;color:#7c8980;font-size:12px;line-height:1.5}
  .amount-panel{margin:22px 0;padding:20px;border:1px solid #dce9df;border-radius:14px;background:#f5faf6}
  .amount-label{display:block;color:#6e7e73;font-size:12px;font-weight:600}.amount{display:block;margin-top:8px;color:#124b35;font-size:clamp(26px,7vw,34px);font-weight:850;overflow-wrap:anywhere}
  .receipt-details{display:grid}.row{display:grid;grid-template-columns:minmax(0,.85fr) minmax(0,1.15fr);align-items:start;gap:12px;padding:14px 0;border-bottom:1px solid #edf1ed;font-size:13px}
  .row span{color:#7c8980;line-height:1.45}.row strong{text-align:right;color:#2e4035;line-height:1.45;overflow-wrap:anywhere}.status{color:#176044!important}
  .note{margin:22px 0 0;padding:13px 14px;border-left:3px solid #c49a3d;border-radius:7px;background:#fbf8ef;color:#71643f;font-size:11px;line-height:1.65}
  .receipt-actions{display:flex;gap:10px;margin-top:22px}.receipt-actions button{flex:1;min-width:0;min-height:48px;border:0;border-radius:10px;padding:12px 14px;background:#124b35;color:#fff;font-size:13px;font-weight:750;cursor:pointer}
  .receipt-actions .secondary{border:1px solid #dce5de;background:#fff;color:#315541}
  @media(max-width:420px){.receipt-head{align-items:flex-start}.demo-tag{font-size:9px;padding:6px 8px}.row{grid-template-columns:1fr;gap:5px}.row strong{text-align:left}.receipt-actions{flex-direction:column}}
  @media print{body{background:#fff;padding:0}.receipt{max-width:none;margin:0;border:0;border-radius:0;box-shadow:none;padding:18px}.receipt-actions{display:none}.note{break-inside:avoid}}
  </style></head><body><main class="receipt">
  <header class="receipt-head"><div><div class="brand">MATA PAY</div><span class="brand-caption">Épargne • Simplicité • Confiance</span></div><span class="demo-tag">DÉMONSTRATION</span></header>
  <h1 class="receipt-title">Reçu d'opération</h1><p class="subtitle">Confirmation d'une opération enregistrée dans le prototype.</p>
  <section class="amount-panel"><span class="amount-label">Montant de l'opération</span><strong class="amount">+${safe(money(operation.amount))}</strong></section>
  <section class="receipt-details">
  <div class="row"><span>Formule</span><strong>${safe(operation.product)}</strong></div>
  <div class="row"><span>Date et heure</span><strong>${safe(operation.date)}</strong></div>
  ${operation.maturityDate ? `<div class="row"><span>Échéance indicative</span><strong>${safe(operation.maturityDate)}</strong></div>` : ""}
  <div class="row"><span>Référence unique</span><strong>${safe(operation.reference)}</strong></div>
  <div class="row"><span>Statut</span><strong class="status">Confirmé — simulation</strong></div>
  <div class="row"><span>Solde total simulé après dépôt</span><strong>${safe(money(operation.balanceAfter))}</strong></div>
  ${operation.note ? `<div class="row"><span>Description</span><strong>${safe(operation.note)}</strong></div>` : ""}
  </section>
  <p class="note">Ce reçu concerne uniquement une opération fictive réalisée dans le prototype MATA PAY. Il ne constitue pas une preuve de dépôt de fonds réels ni un document financier officiel.</p>
  <div class="receipt-actions"><button onclick="window.print()">Imprimer / Enregistrer en PDF</button><button class="secondary" onclick="window.close()">Fermer</button></div>
  </main></body></html>`);
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
depositProduct.addEventListener("change", () => { renderPointageSheets(); document.getElementById("pointage-day-details").textContent = "Sélectionnez une journée marquée pour consulter les détails."; });
mobikisiChoice.addEventListener("change", () => {
  depositAmount.value = mobikisiChoice.value;
  depositAmount.min = mobikisiChoice.value;
});
const depositOptionsPanel = document.getElementById("deposit-options-panel");
const depositOptionsTitle = document.getElementById("deposit-options-title");
const depositOptionsDescription = document.getElementById("deposit-options-description");
document.querySelectorAll("[data-deposit-product]").forEach(button => {
  button.addEventListener("click", () => {
    const product = button.dataset.depositProduct;
    depositProduct.value = product;
    document.querySelectorAll("[data-deposit-product]").forEach(item => {
      item.classList.toggle("is-selected", item === button);
      item.setAttribute("aria-pressed", item === button ? "true" : "false");
    });
    depositOptionsTitle.textContent = product;
    depositOptionsDescription.textContent = product === "Épargne Simple"
      ? "Saisissez le montant que vous souhaitez simuler. La formule prévoit un retrait mensuel."
      : product === "Épargne Bloquée"
        ? "Saisissez le montant à simuler. La durée de référence de cette formule est d'un an."
        : "Choisissez l'une des contributions quotidiennes prévues pour Mobikisi.";
    depositAmount.value = "";
    mobikisiChoice.value = "300";
    document.querySelectorAll("[data-mobikisi-amount]").forEach(item => {
      const selected = item.dataset.mobikisiAmount === "300";
      item.classList.toggle("is-selected", selected);
      item.setAttribute("aria-pressed", selected ? "true" : "false");
    });
    depositOptionsPanel.hidden = false;
    updateDepositRule();
    if (product === "Compte Mobikisi") {
      depositAmount.value = "";
      depositAmount.readOnly = true;
      depositAmount.placeholder = "Choisissez une contribution ci-dessous";
    } else {
      depositAmount.placeholder = "Saisir un montant";
    }
    document.getElementById("deposit-result").style.display = "none";
    renderPointageSheets();
    document.getElementById("pointage-day-details").textContent = "Sélectionnez une journée marquée pour consulter les détails.";
  });
});
document.querySelectorAll("[data-mobikisi-amount]").forEach(button => {
  button.addEventListener("click", () => {
    mobikisiChoice.value = button.dataset.mobikisiAmount;
    depositAmount.value = mobikisiChoice.value;
    depositAmount.min = mobikisiChoice.value;
    document.querySelectorAll("[data-mobikisi-amount]").forEach(item => {
      const selected = item === button;
      item.classList.toggle("is-selected", selected);
      item.setAttribute("aria-pressed", selected ? "true" : "false");
    });
  });
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
    adminStatus: "pending",
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
    const request = { monthKey, date: now.toLocaleString("fr-FR"), timestamp: now.toISOString(), reference: makeReference(), status: "demande fictive" };
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
  renderPointageSheets();
});

// La logique du simulateur de prêt est isolée dans assets/js/credit.js.

function renderOperations(containerId, limit, productFilter) {
  const container = document.getElementById(containerId);
  if (!container) return;
  const filtered = productFilter ? state.operations.filter(op => op.product === productFilter) : state.operations;
  const operations = limit ? filtered.slice(0, limit) : filtered;
  if (!operations.length) {
    container.className = "activity-history-empty";
    container.textContent = "Aucune opération enregistrée pour le moment.";
    return;
  }
  container.className = "activity-history-list activity-history-list-" + containerId;
  const fragment = document.createDocumentFragment();
  operations.forEach(operation => {
    const card = document.createElement("article");
    card.className = "activity-history-card";
    const top = document.createElement("div");
    top.className = "activity-history-card-top";
    const info = document.createElement("div");
    info.className = "activity-history-info";
    const title = document.createElement("strong");
    title.className = "activity-history-title";
    title.textContent = operation.product || "Opération d'épargne";
    const date = document.createElement("span");
    date.className = "activity-history-date";
    date.textContent = operation.date || "Date non disponible";
    info.append(title, date);
    const amount = document.createElement("strong");
    amount.className = "activity-history-amount";
    amount.textContent = "+" + money(operation.amount);
    top.append(info, amount);
    card.appendChild(top);
    if (operation.note) {
      const description = document.createElement("p");
      description.className = "activity-history-description";
      description.textContent = operation.note;
      card.appendChild(description);
    }
    const footer = document.createElement("div");
    footer.className = "activity-history-footer";
    const reference = document.createElement("small");
    reference.textContent = "Réf. " + (operation.reference || "non disponible");
    const button = document.createElement("button");
    button.className = "primary-button activity-history-receipt";
    button.type = "button";
    button.textContent = "Voir le reçu";
    button.setAttribute("aria-label", "Voir le reçu de " + money(operation.amount));
    button.addEventListener("click", () => openReceipt(operation));
    footer.append(reference, button);
    card.appendChild(footer);
    fragment.appendChild(card);
  });
  container.replaceChildren(fragment);
}

function createHistoryEntry(item) {
  const card = document.createElement("article");
  card.className = "history-entry-card";
  const top = document.createElement("div");
  top.className = "history-entry-top";
  const info = document.createElement("div");
  info.className = "history-entry-info";
  const title = document.createElement("strong");
  title.className = "history-entry-title";
  title.textContent = item.title || "Activité";
  const date = document.createElement("span");
  date.className = "history-entry-date";
  date.textContent = item.date || "Date non disponible";
  info.append(title, date);
  const amount = document.createElement("strong");
  amount.className = "history-entry-amount";
  amount.textContent = item.amountLabel || "—";
  top.append(info, amount);
  card.appendChild(top);
  if (item.description) {
    const description = document.createElement("p");
    description.className = "history-entry-description";
    description.textContent = item.description;
    card.appendChild(description);
  }
  const footer = document.createElement("div");
  footer.className = "history-entry-footer";
  const reference = document.createElement("small");
  reference.textContent = item.reference ? "Réf. " + item.reference : "Activité de démonstration";
  footer.appendChild(reference);
  if (item.operation) {
    const button = document.createElement("button");
    button.className = "primary-button activity-history-receipt";
    button.type = "button";
    button.textContent = "Voir le reçu";
    button.addEventListener("click", () => openReceipt(item.operation));
    footer.appendChild(button);
  }
  card.appendChild(footer);
  return card;
}

function renderHistoryGroup(containerId, items, countId) {
  const container = document.getElementById(containerId);
  if (!container) return;
  const count = document.getElementById(countId);
  if (count) count.textContent = String(items.length);
  container.replaceChildren();
  container.className = "history-entry-list";
  if (!items.length) {
    const empty = document.createElement("div");
    empty.className = "activity-history-empty";
    empty.textContent = "Aucune activité enregistrée dans cette catégorie.";
    container.appendChild(empty);
    return;
  }
  const fragment = document.createDocumentFragment();
  items.forEach(item => fragment.appendChild(createHistoryEntry(item)));
  container.appendChild(fragment);
}

function renderCentralHistory() {
  const simple = [];
  const blocked = [];
  const mobikisi = [];
  const credit = [];
  const all = [];
  const add = (category, item) => {
    category.push(item);
    all.push(item);
  };
  state.operations.forEach(operation => {
    const item = {
      title: operation.product || "Opération d'épargne",
      date: operation.date || "Date non disponible",
      sortDate: operation.timestamp || operation.date || "",
      amountLabel: "+" + money(operation.amount),
      description: operation.note || "Opération fictive enregistrée",
      reference: operation.reference,
      operation
    };
    if (operation.product === "Compte Mobikisi") add(mobikisi, item);
    else if (operation.product === "Épargne Bloquée") add(blocked, item);
    else add(simple, item);
  });

  state.withdrawalRequests.forEach(request => {
    add(simple, {
      title: "Demande de retrait mensuel — Épargne Simple",
      date: request.date || request.monthKey || "Date non disponible",
      sortDate: request.timestamp || (request.monthKey ? request.monthKey + "-01" : request.date || ""),
      amountLabel: "Demande",
      description: "Demande de retrait fictive — aucun versement effectué.",
      reference: request.reference
    });
  });

  state.dailyChecks.forEach(day => {
    const parts = String(day).split("-").map(Number);
    const parsed = parts.length === 3 ? new Date(parts[0], parts[1]-1, parts[2]) : null;
    const dateLabel = parsed && !Number.isNaN(parsed.getTime())
      ? parsed.toLocaleDateString("fr-FR", {day:"2-digit",month:"long",year:"numeric"})
      : String(day);
    add(blocked, {
      title: "Pointage journalier — Épargne Bloquée",
      date: dateLabel,
      sortDate: String(day),
      amountLabel: "Pointage",
      description: "Pointage fictif enregistré."
    });
  });

  try {
    const files = JSON.parse(localStorage.getItem("matapay-demo-credit-files-v1") || "[]");
    if (Array.isArray(files)) {
      files.forEach(file => {
        (Array.isArray(file.events) ? file.events : []).forEach(event => {
          const item = {
            title: event.action || "Événement du dossier",
            date: event.at ? new Date(event.at).toLocaleString("fr-FR") : "Date non disponible",
            sortDate: event.at || file.createdAt || "",
            amountLabel: money(file.amount || 0),
            description: "Dossier " + (file.id || "de démonstration") + " • " + (file.purpose || "Objet non précisé") + " • " + (file.duration || "—") + " mois",
            reference: file.id
          };
          add(credit, item);
        });
      });
    }
  } catch (error) {
    console.warn("Historique des dossiers de démonstration indisponible :", error);
  }

  const newestFirst = items => items.sort((a,b) => {
    const ta = Date.parse(a.sortDate) || 0;
    const tb = Date.parse(b.sortDate) || 0;
    return tb - ta;
  });
  newestFirst(simple); newestFirst(blocked); newestFirst(mobikisi); newestFirst(credit); newestFirst(all);
  renderHistoryGroup("history-general", all, "history-general-count");
  renderHistoryGroup("history-simple", simple, "history-simple-count");
  renderHistoryGroup("history-blocked", blocked, "history-blocked-count");
  renderHistoryGroup("history-mobikisi", mobikisi, "history-mobikisi-count");
  renderHistoryGroup("history-credit", credit, "history-credit-count");
}

function formatOperationDateTime(value) {
  if (!value) return "Heure non disponible";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Heure non disponible";
  return new Intl.DateTimeFormat("fr-FR",{day:"2-digit",month:"2-digit",year:"numeric",hour:"2-digit",minute:"2-digit",second:"2-digit"}).format(date);
}
function showPointageDayDetails(dayKey,product) {
  const panel=document.getElementById("pointage-day-details");
  if(!panel)return;
  const parts=dayKey.split("-").map(Number);
  const label=new Date(parts[0],parts[1]-1,parts[2]).toLocaleDateString("fr-FR",{weekday:"long",day:"numeric",month:"long",year:"numeric"});
  const operations=state.operations.filter(op=>op.product===product&&op.dayKey===dayKey).sort((a,b)=>String(a.timestamp||"").localeCompare(String(b.timestamp||"")));
  panel.replaceChildren();
  const heading=document.createElement("strong");heading.textContent="Détails du "+label;panel.appendChild(heading);
  if(!operations.length){const p=document.createElement("p");p.textContent="Aucune épargne enregistrée ce jour.";panel.appendChild(p);return;}
  operations.forEach(op=>{
    const card=document.createElement("article");card.className="pointage-detail-operation";
    const amount=document.createElement("strong");amount.textContent=money(op.amount);
    const deposited=document.createElement("p");deposited.textContent="Épargne effectuée le : "+formatOperationDateTime(op.timestamp);
    const validated=document.createElement("p");
    validated.className=op.adminStatus==="validated"?"admin-status-validated":"admin-status-pending";
    validated.textContent=op.adminStatus==="validated"?"Validée par l'administration le : "+formatOperationDateTime(op.adminValidatedAt):"En attente de validation administrative.";
    const ref=document.createElement("small");ref.textContent="Référence : "+(op.reference||"—");
    card.append(amount,deposited,validated,ref);panel.appendChild(card);
  });
}
function renderPointageCalendar() {
  const container=document.getElementById("selected-pointage-calendar");
  if(!container)return;
  const product=depositProduct.value,offset=Number(container.dataset.monthOffset||0),now=new Date();
  const date=new Date(now.getFullYear(),now.getMonth()+offset,1),year=date.getFullYear(),month=date.getMonth();
  const days=new Date(year,month+1,0).getDate(),first=(new Date(year,month,1).getDay()+6)%7;
  const label=date.toLocaleDateString("fr-FR",{month:"long",year:"numeric"});
  const byDay={};
  state.operations.filter(op=>op.product===product&&op.dayKey).forEach(op=>(byDay[op.dayKey]||=[]).push(op));
  const toolbar=document.createElement("div");toolbar.className="calendar-toolbar";
  const prev=document.createElement("button");prev.type="button";prev.className="calendar-nav";prev.dataset.monthStep="-1";prev.textContent="‹ Mois précédent";
  const heading=document.createElement("strong");heading.textContent=label.charAt(0).toLocaleUpperCase("fr-FR")+label.slice(1);
  const next=document.createElement("button");next.type="button";next.className="calendar-nav";next.dataset.monthStep="1";next.textContent="Mois suivant ›";
  toolbar.append(prev,heading,next);
  const grid=document.createElement("div");grid.className="calendar-grid";
  ["Lun","Mar","Mer","Jeu","Ven","Sam","Dim"].forEach(x=>{const el=document.createElement("div");el.className="calendar-weekday";el.textContent=x;grid.appendChild(el);});
  for(let i=0;i<first;i++){const el=document.createElement("div");el.className="calendar-day calendar-day-empty";grid.appendChild(el);}
  for(let day=1;day<=days;day++){
    const key=[year,String(month+1).padStart(2,"0"),String(day).padStart(2,"0")].join("-"),ops=byDay[key]||[];
    const valid=ops.some(op=>op.adminStatus==="validated"),pending=ops.some(op=>op.adminStatus!=="validated");
    const cell=document.createElement(ops.length?"button":"div");if(ops.length)cell.type="button";
    cell.className="calendar-day"+(valid?" has-validated":pending?" has-pending":"")+(ops.length?" calendar-day-interactive":"");
    if(ops.length){cell.dataset.pointageDay=key;cell.dataset.pointageProduct=product;cell.setAttribute("aria-label","Voir les épargnes du "+key);}
    const num=document.createElement("span");num.className="calendar-day-number";num.textContent=day;
    const mark=document.createElement("span");mark.className="calendar-day-mark";mark.textContent=valid?"✓":pending?"…":"·";cell.append(num,mark);
    if(ops.length){const count=document.createElement("small");count.textContent=ops.length+" épargne(s)";cell.appendChild(count);}
    grid.appendChild(cell);
  }
  const list=document.createElement("div");list.className="calendar-operations";
  const prefix=year+"-"+String(month+1).padStart(2,"0");
  const monthOps=state.operations.filter(op=>op.product===product&&op.dayKey&&op.dayKey.startsWith(prefix)).sort((a,b)=>String(b.timestamp||"").localeCompare(String(a.timestamp||"")));
  if(!monthOps.length)list.textContent="Aucune épargne enregistrée pour cette formule ce mois-ci.";
  else{
    const title=document.createElement("strong");title.textContent="Opérations du mois";list.appendChild(title);
    monthOps.forEach(op=>{
      const row=document.createElement("div");row.className="calendar-operation";
      const info=document.createElement("div"),dt=document.createElement("strong"),amt=document.createElement("span"),status=document.createElement("small");
      dt.textContent=formatOperationDateTime(op.timestamp);amt.textContent=money(op.amount)+" — "+(op.note||"Épargne simulée");
      status.className=op.adminStatus==="validated"?"admin-status-validated":"admin-status-pending";
      status.textContent=op.adminStatus==="validated"?"✓ Validée par l'administration (démo)":"En attente de validation administrative";
      info.append(dt,amt,status);row.appendChild(info);
      if(op.adminStatus!=="validated"){const btn=document.createElement("button");btn.type="button";btn.className="calendar-validate-button";btn.dataset.validateOperation=op.reference;btn.textContent="Valider (admin démo)";row.appendChild(btn);}
      list.appendChild(row);
    });
  }
  container.replaceChildren(toolbar,grid,list);
}
function renderPointageSheets(){renderPointageCalendar();}
document.addEventListener("click",event=>{
  const month=event.target.closest("[data-month-step]");
  if(month){const cal=document.getElementById("selected-pointage-calendar");if(cal){cal.dataset.monthOffset=String(Number(cal.dataset.monthOffset||0)+Number(month.dataset.monthStep));renderPointageCalendar();}return;}
  const day=event.target.closest("[data-pointage-day]");
  if(day){showPointageDayDetails(day.dataset.pointageDay,day.dataset.pointageProduct);return;}
  const validate=event.target.closest("[data-validate-operation]");
  if(validate){
    const op=state.operations.find(item=>item.reference===validate.dataset.validateOperation);
    if(!op||op.adminStatus==="validated")return;
    op.adminStatus="validated";op.adminValidatedAt=new Date().toISOString();
    op.adminValidationReference="ADMIN-DEMO-"+makeReference().slice(3);
    saveState();renderPointageSheets();showPointageDayDetails(op.dayKey,op.product);
    showResult("deposit-result","Validation administrative fictive enregistrée pour "+op.reference+".");
  }
});
function updateInterface() {
  const count = state.operations.length;
  const balanceText = money(state.balance);
  document.getElementById("dashboard-balance").textContent = balanceText;
  document.getElementById("dashboard-count").textContent = count;
  document.getElementById("mobikisi-total").textContent = money(productBalance("Compte Mobikisi"));
  document.getElementById("mobikisi-count").textContent = state.operations.filter(op => op.product === "Compte Mobikisi").length;
  renderCentralHistory();
  renderPointageSheets();
}

const STORAGE_KEY = "matapay-demo-v1";
const PROFILE_KEY = "matapay-demo-profile-v1";
let demoProfile = "";
let demoProfileData = null;
let selectedProfilePhoto = "";
const DEFAULT_PROFILE_PHOTO = "assets/images/profile-placeholder.svg";
function renderProfilePhoto() {
  const photo = selectedProfilePhoto || (demoProfileData && demoProfileData.profilePhoto) || "";
  const preview = document.getElementById("profile-photo-preview");
  const avatar = document.getElementById("profile-avatar");
  if (preview) preview.src = photo || DEFAULT_PROFILE_PHOTO;
  if (avatar) avatar.src = photo || DEFAULT_PROFILE_PHOTO;
}
function compressProfilePhoto(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error("Lecture du fichier impossible."));
    reader.onload = () => {
      const image = new Image();
      image.onerror = () => reject(new Error("Cette image ne peut pas être ouverte."));
      image.onload = () => {
        const maxSide = 320;
        const scale = Math.min(1, maxSide / Math.max(image.width, image.height));
        const canvas = document.createElement("canvas");
        canvas.width = Math.max(1, Math.round(image.width * scale));
        canvas.height = Math.max(1, Math.round(image.height * scale));
        canvas.getContext("2d").drawImage(image, 0, 0, canvas.width, canvas.height);
        resolve(canvas.toDataURL("image/jpeg", 0.78));
      };
      image.src = reader.result;
    };
    reader.readAsDataURL(file);
  });
}

function createMemberNumber() {
  const bytes = new Uint8Array(8);
  if (window.crypto && typeof window.crypto.getRandomValues === "function") {
    window.crypto.getRandomValues(bytes);
  } else {
    for (let i = 0; i < bytes.length; i++) bytes[i] = Math.floor(Math.random() * 256);
  }
  return "MP-DEMO-" + Array.from(bytes, byte => byte.toString(16).padStart(2, "0")).join("").toUpperCase();
}
function saveDemoProfile() {
  if (!demoProfileData) return;
  localStorage.setItem(PROFILE_KEY, JSON.stringify(demoProfileData));
}
function renderMobikisiCard() {
  const nameNode = document.getElementById("mobikisi-member-name");
  const numberNode = document.getElementById("mobikisi-member-number");
  const statusNode = document.getElementById("mobikisi-card-status");
  const requestButton = document.getElementById("physical-card-request");
  const requestResult = document.getElementById("physical-card-result");
  if (!nameNode || !numberNode || !statusNode || !requestButton) return;
  if (!demoProfileData || !demoProfileData.memberNumber) {
    nameNode.textContent = "MEMBRE MATA PAY";
    numberNode.textContent = "MP-DEMO-••••••••••••";
    statusNode.textContent = "Créez votre espace de démonstration pour obtenir votre carte numérique.";
    requestButton.disabled = true;
    return;
  }
  nameNode.textContent = ((demoProfileData.firstName || "") + " " + (demoProfileData.name || "")).trim().toUpperCase();
  numberNode.textContent = demoProfileData.memberNumber;
  statusNode.textContent = "Carte numérique activée immédiatement dans cette démonstration.";
  requestButton.disabled = Boolean(demoProfileData.physicalCardRequested);
  requestButton.textContent = demoProfileData.physicalCardRequested ? "Demande physique enregistrée" : "Demander une carte physique";
  if (requestResult) requestResult.textContent = demoProfileData.physicalCardRequested
    ? "Votre demande de carte physique est enregistrée localement à titre de démonstration. Aucune fabrication ni livraison réelle n'est déclenchée."
    : "";
}
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
      status: op.status || "confirmed",
      adminStatus: op.adminStatus === "validated" ? "validated" : op.adminStatus === "pending" ? "pending" : "validated"
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
      if (parsedProfile && typeof parsedProfile === "object") {
        demoProfileData = parsedProfile;
        demoProfile = parsedProfile.name || "";
        selectedProfilePhoto = typeof parsedProfile.profilePhoto === "string" ? parsedProfile.profilePhoto : "";
        if (!demoProfileData.memberNumber) {
          demoProfileData.memberNumber = createMemberNumber();
          saveDemoProfile();
        }
      } else {
        demoProfile = savedProfile;
      }
    } catch {
      demoProfile = savedProfile;
    }
  }
} catch (error) { demoProfile = ""; }
const registerForm = document.getElementById("register-form");
const profilePhotoField = document.getElementById("demo-profile-photo");
const removeProfilePhotoButton = document.getElementById("remove-profile-photo");
if (profilePhotoField) profilePhotoField.addEventListener("change", async () => {
  const file = profilePhotoField.files && profilePhotoField.files[0];
  if (!file) return;
  if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
    profilePhotoField.value = "";
    showResult("profile-photo-result", "Format non accepté. Choisissez une image JPEG, PNG ou WebP.");
    return;
  }
  if (file.size > 5 * 1024 * 1024) {
    profilePhotoField.value = "";
    showResult("profile-photo-result", "La photo dépasse 5 Mo. Choisissez une image plus légère.");
    return;
  }
  try {
    selectedProfilePhoto = await compressProfilePhoto(file);
    renderProfilePhoto();
    showResult("profile-photo-result", "Photo prête. Elle sera enregistrée sur cet appareil après la création du compte de démonstration.");
  } catch (error) {
    selectedProfilePhoto = "";
    profilePhotoField.value = "";
    renderProfilePhoto();
    showResult("profile-photo-result", "Impossible de lire cette image. Essayez une autre photo.");
  }
});
if (removeProfilePhotoButton) removeProfilePhotoButton.addEventListener("click", () => {
  selectedProfilePhoto = "";
  if (profilePhotoField) profilePhotoField.value = "";
  if (demoProfileData) {
    demoProfileData.profilePhoto = "";
    try { saveDemoProfile(); } catch (error) { console.warn("Photo non supprimée du stockage local :", error); }
  }
  renderProfilePhoto();
  showResult("profile-photo-result", "La photo a été retirée de cet espace de démonstration.");
});
// INSCRIPTION — validation groupée des informations et justificatifs fictifs.
const DOCUMENT_KEY = "matapay-demo-document-v1";
const documentTypeField = document.getElementById("demo-document-type");
const documentExpiryField = document.getElementById("demo-document-expiry");
const documentHelp = document.getElementById("demo-document-date-help");

function currentAcademicYearEnd() {
  const now = new Date();
  const year = now.getFullYear();
  const endYear = now.getMonth() >= 8 ? year + 1 : year;
  return endYear + "-06-30";
}
function todayDateString() {
  const now = new Date();
  return [now.getFullYear(), String(now.getMonth()+1).padStart(2,"0"), String(now.getDate()).padStart(2,"0")].join("-");
}
function updateDocumentDateRule() {
  if (!documentTypeField || !documentExpiryField) return;
  const isStudentCard = documentTypeField.value === "Carte d'étudiant ou scolaire";
  documentExpiryField.min = todayDateString();
  if (isStudentCard) {
    documentExpiryField.max = currentAcademicYearEnd();
    documentHelp.textContent = "Pour une carte scolaire ou étudiante, la date doit être future et ne pas dépasser la fin de l'année scolaire en cours (" + currentAcademicYearEnd() + ").";
  } else {
    documentExpiryField.removeAttribute("max");
    documentHelp.textContent = "La date doit être aujourd'hui ou une date future.";
  }
}
function calculateAge(birthDate) {
  const birth = new Date(birthDate + "T00:00:00");
  const today = new Date();
  let age = today.getFullYear() - birth.getFullYear();
  if (today.getMonth() < birth.getMonth() ||
      (today.getMonth() === birth.getMonth() && today.getDate() < birth.getDate())) age--;
  return age;
}
function renderDemoDocument(documentInfo) {
  const summary = document.getElementById("demo-document-summary");
  if (!summary || !documentInfo) return;
  summary.textContent = "Justificatif sélectionné : " + documentInfo.type +
    " — date de validité : " + new Date(documentInfo.expiryDate + "T00:00:00").toLocaleDateString("fr-FR") +
    ". Contrôle simulé uniquement ; authenticité non vérifiée.";
}
if (registerForm) {
  if (documentTypeField) documentTypeField.addEventListener("change", updateDocumentDateRule);
  registerForm.addEventListener("submit", event => {
    event.preventDefault();
    const field = document.getElementById("display-name");
    const firstNameField = document.getElementById("demo-first-name");
    const birthDateField = document.getElementById("demo-birth-date");
    const birthPlaceField = document.getElementById("demo-birth-place");
    const emailField = document.getElementById("demo-email");
    const genderField = document.getElementById("demo-gender");
    const countryField = document.getElementById("demo-country");
    const cityField = document.getElementById("demo-city");
    const districtField = document.getElementById("demo-district");
    const neighborhoodField = document.getElementById("demo-neighborhood");
    const phoneField = document.getElementById("demo-phone");
    const name = field.value.trim().replace(/\s+/g, " ");
    const firstName = firstNameField.value.trim().replace(/\s+/g, " ");
    const birthDate = birthDateField.value;
    const birthPlace = birthPlaceField.value.trim();
    const email = emailField.value.trim();
    const country = countryField.value.trim();
    const city = cityField.value.trim();
    const district = districtField.value.trim();
    const neighborhood = neighborhoodField.value.trim();
    const phone = phoneField.value.trim();
    const documentType = documentTypeField.value;
    const expiryDate = documentExpiryField.value;

    if (!name || name.length > 40 || !firstName || firstName.length > 50) {
      showResult("register-result", "Renseignez un nom et un prénom valides."); return;
    }
    if (!birthDate || birthDate > todayDateString() || calculateAge(birthDate) < 18 || calculateAge(birthDate) > 120) {
      showResult("register-result", "Pour cette démonstration réservée aux adultes, choisissez une date de naissance fictive correspondant à un âge de 18 à 120 ans."); return;
    }
    if (!birthPlace || birthPlace.length > 100) {
      showResult("register-result", "Renseignez un lieu de naissance valide."); return;
    }
    if (!genderField.value) {
      showResult("register-result", "Choisissez le genre."); return;
    }
    if (!email || !emailField.checkValidity()) {
      showResult("register-result", "Saisissez une adresse e-mail au format valide. Utilisez une adresse fictive."); return;
    }
    if (!phoneField.checkValidity() || !phone) {
      showResult("register-result", "Saisissez un numéro de démonstration valide (7 à 20 caractères autorisés)."); return;
    }
    if (!country || !city || !district || !neighborhood) {
      showResult("register-result", "Renseignez le pays, la ville, l'arrondissement et le quartier."); return;
    }
    if (!selectedProfilePhoto) {
      showResult("register-result", "Ajoutez obligatoirement une photo de profil avant de créer votre espace.");
      if (profilePhotoField) profilePhotoField.focus();
      return;
    }
    if (!documentType || !expiryDate) {
      showResult("register-result", "Terminez la dernière étape : choisissez le type de pièce et sa date de validité."); return;
    }
    if (expiryDate < todayDateString()) {
      showResult("register-result", "Pièce refusée : la date de validité est dépassée."); return;
    }
    if (documentType === "Carte d'étudiant ou scolaire" && expiryDate > currentAcademicYearEnd()) {
      showResult("register-result", "Pièce refusée : la carte scolaire ou étudiante doit expirer au plus tard à la fin de l'année scolaire en cours (" + currentAcademicYearEnd() + ")."); return;
    }

    const demoDetails = {
      name, firstName, birthDate, birthPlace, gender: genderField.value,
      email, phone, country, city, district, neighborhood,
      memberNumber: (demoProfileData && demoProfileData.memberNumber) || createMemberNumber(),
      profilePhoto: selectedProfilePhoto,
      physicalCardRequested: false,
      cardIssueMode: "digital-immediate-physical-on-request"
    };
    const documentInfo = { type: documentType, expiryDate, status: "date valide — simulation" };
    try {
      demoProfileData = demoDetails;
      localStorage.setItem(PROFILE_KEY, JSON.stringify(demoDetails));
      localStorage.setItem(DOCUMENT_KEY, JSON.stringify(documentInfo));
      demoProfile = name;
      document.getElementById("profile-label").textContent = demoProfile + " — démonstration";
      renderDemoDocument(documentInfo);
      renderProfilePhoto();
      renderMobikisiCard();
      showResult("register-result", "Votre espace de démonstration est créé. Votre carte MOBIKISI numérique et son numéro de membre ont été générés immédiatement. Une carte physique pourra être demandée depuis l'espace MOBIKISI. Toutes les données restent fictives et locales ; aucune carte réelle n'est fabriquée.");
      registerForm.reset();
      selectedProfilePhoto = "";
      renderProfilePhoto();
      updateDocumentDateRule();
    } catch (error) {
      showResult("register-result", "La sauvegarde locale n'est pas disponible sur cet appareil. Réessayez dans un autre navigateur.");
    }
  });
}
if (documentTypeField && documentExpiryField) updateDocumentDateRule();

const physicalCardButton = document.getElementById("physical-card-request");
if (physicalCardButton) {
  physicalCardButton.addEventListener("click", () => {
    if (!demoProfileData || !demoProfileData.memberNumber) {
      showResult("physical-card-result", "Créez d'abord votre espace de démonstration.");
      return;
    }
    demoProfileData.physicalCardRequested = true;
    try {
      saveDemoProfile();
      renderMobikisiCard();
    } catch (error) {
      showResult("physical-card-result", "La demande n'a pas pu être enregistrée sur cet appareil.");
    }
  });
}

loadState();
renderProfilePhoto();
updateDepositRule();
updateInterface();
renderMobikisiCard();
refreshSavingsTracking();


// Diaporama tactile et automatique des affiches MATA-PAY
(() => {
  const slideshow = document.getElementById("matapay-reference-slideshow");
  if (!slideshow) return;
  const slides = Array.from(slideshow.querySelectorAll(".reference-slide"));
  if (!slides.length) return;
  let current = 0;
  let timer = null;
  let startX = 0;
  let startY = 0;
  let pointerActive = false;
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  function showSlide(index) {
    current = (index + slides.length) % slides.length;
    slides.forEach((slide, i) => {
      const active = i === current;
      slide.classList.toggle("is-active", active);
      slide.setAttribute("aria-hidden", String(!active));
      if (active) slide.removeAttribute("inert");
      else slide.setAttribute("inert", "");
    });
  }
  function stopAuto() {
    if (timer) window.clearInterval(timer);
    timer = null;
  }
  function startAuto() {
    stopAuto();
    if (!reducedMotion && !document.hidden) {
      timer = window.setInterval(() => showSlide(current + 1), 15000);
    }
  }
  function changeByGesture(direction) {
    showSlide(current + direction);
    startAuto();
  }

  slideshow.addEventListener("pointerdown", (event) => {
    if (event.pointerType === "mouse") return;
    pointerActive = true;
    startX = event.clientX;
    startY = event.clientY;
  }, { passive: true });
  slideshow.addEventListener("pointerup", (event) => {
    if (!pointerActive) return;
    pointerActive = false;
    const deltaX = event.clientX - startX;
    const deltaY = event.clientY - startY;
    if (Math.abs(deltaX) > 45 && Math.abs(deltaX) > Math.abs(deltaY) * 1.2) {
      changeByGesture(deltaX < 0 ? 1 : -1);
    }
  }, { passive: true });
  slideshow.addEventListener("pointercancel", () => { pointerActive = false; });
  slideshow.addEventListener("keydown", (event) => {
    if (event.key === "ArrowRight") { event.preventDefault(); changeByGesture(1); }
    if (event.key === "ArrowLeft") { event.preventDefault(); changeByGesture(-1); }
  });
  slideshow.addEventListener("mouseenter", stopAuto);
  slideshow.addEventListener("mouseleave", startAuto);
  slideshow.addEventListener("focusin", stopAuto);
  slideshow.addEventListener("focusout", (event) => {
    if (!slideshow.contains(event.relatedTarget)) startAuto();
  });
  document.addEventListener("visibilitychange", () => {
    if (document.hidden) stopAuto();
    else startAuto();
  });
  showSlide(0);
  startAuto();
})();
