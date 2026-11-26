/* MATA-PAY — logique isolée de l'espace prêt.
   Démonstration locale : aucun dossier réel ni service financier. */
(() => {
  "use strict";

  const form = document.getElementById("credit-simulation-form");
  if (!form) return;

  const amountInput = document.getElementById("credit-amount");
  const durationInput = document.getElementById("credit-duration");
  const result = document.getElementById("credit-result");
  const countLabel = document.getElementById("credit-simulation-count");
  let simulationCount = 0;

  const formatMoney = value => new Intl.NumberFormat("fr-FR", {
    maximumFractionDigits: 2,
    minimumFractionDigits: 0
  }).format(value) + " FCFA";

  function showError(message) {
    result.classList.add("is-visible");
    result.innerHTML = "";
    const paragraph = document.createElement("p");
    paragraph.className = "credit-result-note";
    paragraph.setAttribute("role", "alert");
    paragraph.textContent = message;
    result.appendChild(paragraph);
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

    const monthlyAverage = amount / duration;
    simulationCount += 1;
    countLabel.textContent = String(simulationCount);

    result.classList.add("is-visible");
    result.innerHTML = "";

    const title = document.createElement("div");
    title.className = "credit-result-title";
    title.textContent = "Estimation pédagogique — hors frais et intérêts";

    const total = document.createElement("strong");
    total.className = "credit-result-total";
    total.textContent = formatMoney(monthlyAverage) + " / mois";

    const breakdown = document.createElement("div");
    breakdown.className = "credit-result-breakdown";

    const entries = [
      ["Montant fictif", formatMoney(amount)],
      ["Durée illustrative", duration + " mois"],
      ["Taux appliqué", "Aucun"],
      ["Frais appliqués", "Aucun"]
    ];

    entries.forEach(([label, value]) => {
      const item = document.createElement("div");
      const small = document.createElement("small");
      const strong = document.createElement("strong");
      small.textContent = label;
      strong.textContent = value;
      item.append(small, strong);
      breakdown.appendChild(item);
    });

    const note = document.createElement("p");
    note.className = "credit-result-note";
    note.textContent = "Calcul simplifié : montant divisé par durée. Ce résultat n'est pas un échéancier contractuel, ne vérifie aucune éligibilité et ne constitue pas une offre ou une approbation de prêt.";

    result.append(title, total, breakdown, note);
  });
})();
