/* MATA-PAY — parcours de prêt fictif.
   Données locales de démonstration uniquement : aucun dossier réel. */
(() => {
  "use strict";

  const STORE_KEY = "matapay-demo-credit-files-v1";
  const form = document.getElementById("credit-simulation-form");
  if (!form) return;

  const amountInput = document.getElementById("credit-amount");
  const durationInput = document.getElementById("credit-duration");
  const result = document.getElementById("credit-result");
  const countLabel = document.getElementById("credit-simulation-count");
  const createWrap = document.getElementById("credit-file-create-wrap");
  const createButton = document.getElementById("credit-create-file");
  const createMessage = document.getElementById("credit-create-message");
  const purposeInput = document.getElementById("credit-purpose");
  let simulationCount = 0;
  let latestSimulation = null;

  const money = value => new Intl.NumberFormat("fr-FR", {
    maximumFractionDigits: 2, minimumFractionDigits: 0
  }).format(value) + " FCFA";

  const dateTime = value => new Intl.DateTimeFormat("fr-FR", {
    dateStyle: "medium", timeStyle: "short"
  }).format(new Date(value));

  function loadFiles() {
    try {
      const parsed = JSON.parse(localStorage.getItem(STORE_KEY) || "[]");
      return Array.isArray(parsed) ? parsed.filter(item =>
        item && typeof item.id === "string" && Number.isFinite(item.amount) &&
        Number.isFinite(item.duration) && Array.isArray(item.events)
      ) : [];
    } catch (_) {
      return [];
    }
  }

  let files = loadFiles();

  function saveFiles() {
    try {
      localStorage.setItem(STORE_KEY, JSON.stringify(files));
      return true;
    } catch (_) {
      return false;
    }
  }

  function makeId() {
    const bytes = new Uint8Array(6);
    if (window.crypto && window.crypto.getRandomValues) {
      window.crypto.getRandomValues(bytes);
      return "MP-DEMO-" + Array.from(bytes, b => b.toString(16).padStart(2, "0")).join("").toUpperCase();
    }
    return "MP-DEMO-" + Date.now().toString(36).toUpperCase();
  }

  function element(tag, className, content) {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (content !== undefined) node.textContent = content;
    return node;
  }

  function showError(message) {
    result.classList.add("is-visible");
    result.replaceChildren(element("p", "credit-result-note", message));
  }

  function addAudit(file, action, status) {
    file.events.push({
      action,
      status,
      at: new Date().toISOString(),
      actor: "Administration de démonstration"
    });
    file.updatedAt = new Date().toISOString();
  }

  function statusLabel(status) {
    return ({
      submitted: "Soumis — en attente",
      reviewing: "En cours d'étude — simulation",
      favorable: "Avis favorable simulé",
      unfavorable: "Avis défavorable simulé"
    })[status] || "Statut de démonstration";
  }

  function statusClass(status) {
    return ({
      submitted: "is-pending",
      reviewing: "is-reviewing",
      favorable: "is-favorable",
      unfavorable: "is-unfavorable"
    })[status] || "is-pending";
  }

  function renderMemberFile() {
    const container = document.getElementById("credit-member-file");
    const status = document.getElementById("credit-file-status");
    if (!container || !status) return;

    const file = files.slice().sort((a, b) => b.createdAt.localeCompare(a.createdAt))[0];
    if (!file) {
      status.textContent = "Non créé";
      container.className = "credit-empty-state";
      container.replaceChildren(
        element("span", "credit-empty-icon", "▤"),
        element("strong", "", "Aucun dossier de démonstration"),
        element("p", "", "Après une simulation, vous pourrez créer un dossier fictif et suivre son évolution ici. N'ajoutez aucun document officiel ni renseignement personnel.")
      );
      return;
    }

    status.textContent = "Dossier créé";
    container.className = "credit-member-file-card";
    container.replaceChildren();

    const head = element("div", "credit-member-file-head");
    const ref = element("div", "credit-file-reference", "Référence " + file.id);
    const pill = element("span", "credit-status-pill " + statusClass(file.status), statusLabel(file.status));
    head.append(ref, pill);

    const details = element("div", "credit-member-file-details");
    [
      ["Objet fictif", file.purpose],
      ["Montant simulé", money(file.amount)],
      ["Durée illustrative", file.duration + " mois"],
      ["Créé le", dateTime(file.createdAt)]
    ].forEach(([label, value]) => {
      const item = element("div", "credit-member-detail");
      item.append(element("small", "", label), element("strong", "", value));
      details.appendChild(item);
    });

    const disclaimer = element("p", "credit-member-disclaimer",
      "Suivi fictif enregistré uniquement dans ce navigateur. Retrouvez toutes les étapes et décisions simulées dans la rubrique Historique.");
    container.append(head, details, disclaimer);
  }

  function renderAdmin() {
    const list = document.getElementById("credit-admin-files");
    if (!list) return;

    const total = document.getElementById("credit-admin-total");
    const pending = document.getElementById("credit-admin-pending");
    const decided = document.getElementById("credit-admin-decided");

    total.textContent = String(files.length);
    pending.textContent = String(files.filter(file => file.status === "submitted" || file.status === "reviewing").length);
    decided.textContent = String(files.filter(file => file.status === "favorable" || file.status === "unfavorable").length);

    list.replaceChildren();
    if (!files.length) {
      const empty = element("div", "credit-empty-state");
      empty.append(
        element("span", "credit-empty-icon", "▤"),
        element("strong", "", "Aucun dossier disponible"),
        element("p", "", "Créez d'abord un dossier de démonstration depuis l'espace Prêt.")
      );
      list.appendChild(empty);
    } else {
      files.slice().sort((a, b) => b.createdAt.localeCompare(a.createdAt)).forEach(file => {
        const card = element("article", "credit-admin-file-card");
        const top = element("div", "credit-admin-file-top");
        const identity = element("div", "credit-admin-file-identity");
        identity.append(
          element("strong", "", file.id),
          element("small", "", file.purpose + " • créé le " + dateTime(file.createdAt))
        );
        top.append(identity, element("span", "credit-status-pill " + statusClass(file.status), statusLabel(file.status)));

        const facts = element("div", "credit-admin-file-facts");
        facts.append(
          element("span", "", money(file.amount)),
          element("span", "", file.duration + " mois"),
          element("span", "", file.events.length + " événement(s)")
        );

        const actions = element("div", "credit-admin-actions");
        const review = element("button", "credit-admin-action", "Marquer en étude");
        review.type = "button";
        review.dataset.creditAction = "review";
        review.dataset.fileId = file.id;
        review.disabled = file.status === "reviewing";
        const favorable = element("button", "credit-admin-action is-positive", "Avis favorable fictif");
        favorable.type = "button";
        favorable.dataset.creditAction = "favorable";
        favorable.dataset.fileId = file.id;
        const unfavorable = element("button", "credit-admin-action is-negative", "Avis défavorable fictif");
        unfavorable.type = "button";
        unfavorable.dataset.creditAction = "unfavorable";
        unfavorable.dataset.fileId = file.id;
        actions.append(review, favorable, unfavorable);

        card.append(top, facts, actions);
        list.appendChild(card);
      });
    }


  }

  form.addEventListener("submit", event => {
    event.preventDefault();
    const amount = Number(amountInput.value);
    const duration = Number(durationInput.value);
    const allowedDurations = [3, 6, 12, 18, 24];

    if (!Number.isSafeInteger(amount) || amount <= 0) {
      showError("Saisissez un montant fictif valide, exprimé en nombre entier de FCFA.");
      amountInput.focus();
      return;
    }
    if (!allowedDurations.includes(duration)) {
      showError("Choisissez une durée proposée dans cette maquette.");
      durationInput.focus();
      return;
    }

    latestSimulation = { amount, duration, monthlyAverage: amount / duration };
    simulationCount += 1;
    countLabel.textContent = String(simulationCount);

    result.classList.add("is-visible");
    const title = element("div", "credit-result-title", "Estimation pédagogique — hors frais et intérêts");
    const total = element("strong", "credit-result-total", money(latestSimulation.monthlyAverage) + " / mois");
    const breakdown = element("div", "credit-result-breakdown");
    [["Montant fictif", money(amount)], ["Durée illustrative", duration + " mois"], ["Taux appliqué", "Aucun"], ["Frais appliqués", "Aucun"]]
      .forEach(([label, value]) => {
        const item = element("div");
        item.append(element("small", "", label), element("strong", "", value));
        breakdown.appendChild(item);
      });
    const note = element("p", "credit-result-note",
      "Calcul simplifié : montant divisé par durée. Ce résultat n'est pas un échéancier contractuel, ne vérifie aucune éligibilité et ne constitue pas une offre ou une approbation de prêt.");
    result.replaceChildren(title, total, breakdown, note);
    createWrap.hidden = false;
    createMessage.textContent = "";
  });

  createButton.addEventListener("click", () => {
    if (!latestSimulation) {
      createMessage.textContent = "Effectuez d'abord une simulation fictive.";
      return;
    }
    const now = new Date().toISOString();
    const file = {
      id: makeId(),
      purpose: purposeInput.value,
      amount: latestSimulation.amount,
      duration: latestSimulation.duration,
      status: "submitted",
      createdAt: now,
      updatedAt: now,
      events: []
    };
    addAudit(file, "Dossier fictif créé et transmis à la file de démonstration", file.status);
    files.push(file);
    if (!saveFiles()) {
      files = files.filter(item => item.id !== file.id);
      createMessage.textContent = "Le navigateur n'a pas permis l'enregistrement local. Vérifiez son espace de stockage.";
      return;
    }
    createMessage.textContent = "Dossier de démonstration créé : " + file.id;
    renderMemberFile();
    renderAdmin();
  });

  document.addEventListener("click", event => {
    const button = event.target.closest("[data-credit-action]");
    if (!button) return;
    const file = files.find(item => item.id === button.dataset.fileId);
    if (!file) return;

    const action = button.dataset.creditAction;
    const messages = {
      review: ["Dossier placé en cours d'étude — simulation", "reviewing"],
      favorable: ["Avis favorable simulé — sans valeur contractuelle", "favorable"],
      unfavorable: ["Avis défavorable simulé — sans effet réel", "unfavorable"]
    };
    if (!messages[action]) return;

    file.status = messages[action][1];
    addAudit(file, messages[action][0], file.status);
    if (!saveFiles()) {
      file.status = "submitted";
      return;
    }
    renderAdmin();
    renderMemberFile();
  });

  renderMemberFile();
  renderAdmin();
})();

  form.addEventListener("submit", event => {
    event.preventDefault();
    const amount = Number(amountInput.value);
    const duration = Number(durationInput.value);
    const allowedDurations = [3, 6, 12, 18, 24];

    if (!Number.isSafeInteger(amount) || amount <= 0) {
      showError("Saisissez un montant fictif valide, exprimé en nombre entier de FCFA.");
      amountInput.focus();
      return;
    }
    if (!allowedDurations.includes(duration)) {
      showError("Choisissez une durée proposée dans cette maquette.");
      durationInput.focus();
      return;
    }

    latestSimulation = { amount, duration, monthlyAverage: amount / duration };
    simulationCount += 1;
    countLabel.textContent = String(simulationCount);

    result.classList.add("is-visible");
    const title = element("div", "credit-result-title", "Estimation pédagogique — hors frais et intérêts");
    const total = element("strong", "credit-result-total", money(latestSimulation.monthlyAverage) + " / mois");
    const breakdown = element("div", "credit-result-breakdown");
    [["Montant fictif", money(amount)], ["Durée illustrative", duration + " mois"], ["Taux appliqué", "Aucun"], ["Frais appliqués", "Aucun"]]
      .forEach(([label, value]) => {
        const item = element("div");
        item.append(element("small", "", label), element("strong", "", value));
        breakdown.appendChild(item);
      });
    const note = element("p", "credit-result-note",
      "Calcul simplifié : montant divisé par durée. Ce résultat n'est pas un échéancier contractuel, ne vérifie aucune éligibilité et ne constitue pas une offre ou une approbation de prêt.");
    result.replaceChildren(title, total, breakdown, note);
    createWrap.hidden = false;
    createMessage.textContent = "";
  });

  createButton.addEventListener("click", () => {
    if (!latestSimulation) {
      createMessage.textContent = "Effectuez d'abord une simulation fictive.";
      return;
    }
    const now = new Date().toISOString();
    const file = {
      id: makeId(),
      purpose: purposeInput.value,
      amount: latestSimulation.amount,
      duration: latestSimulation.duration,
      status: "submitted",
      createdAt: now,
      updatedAt: now,
      events: []
    };
    addAudit(file, "Dossier fictif créé et transmis à la file de démonstration", file.status);
    files.push(file);
    if (!saveFiles()) {
      files = files.filter(item => item.id !== file.id);
      createMessage.textContent = "Le navigateur n'a pas permis l'enregistrement local. Vérifiez son espace de stockage.";
      return;
    }
    createMessage.textContent = "Dossier de démonstration créé : " + file.id;
    renderMemberFile();
    renderAdmin();
  });

  document.addEventListener("click", event => {
    const button = event.target.closest("[data-credit-action]");
    if (!button) return;
    const file = files.find(item => item.id === button.dataset.fileId);
    if (!file) return;

    const action = button.dataset.creditAction;
    const messages = {
      review: ["Dossier placé en cours d'étude — simulation", "reviewing"],
      favorable: ["Avis favorable simulé — sans valeur contractuelle", "favorable"],
      unfavorable: ["Avis défavorable simulé — sans effet réel", "unfavorable"]
    };
    if (!messages[action]) return;

    file.status = messages[action][1];
    addAudit(file, messages[action][0], file.status);
    if (!saveFiles()) {
      file.status = "submitted";
      return;
    }
    renderAdmin();
    renderMemberFile();
  });

  renderMemberFile();
  renderAdmin();
})();
