const STORAGE_KEY = "halloween-monster-save-v1";
const MONSTERS = [
  { name: "Mumie", points: 7, loot: ["Gift", "Granate"], color: "#c7a878" },
  { name: "Kürbis", points: 5, loot: ["Gift"], color: "#e58c49" },
  { name: "Geist", points: 9, loot: ["Taler", "Dynamit"], color: "#b7c9c2" },
  { name: "Medusa", points: 15, loot: ["Taler"], color: "#92a66f" },
  { name: "Vampir", points: 10, loot: ["Granate"], color: "#c36c66" },
  { name: "Baum", points: 9, loot: ["Eis", "Gekreuzte Schwerter"], color: "#8d9b74" },
  { name: "Sensenmann", points: 16, loot: ["Gekreuzte Schwerter", "Granate", "Taler"], color: "#b6b8a8" },
  { name: "Spinne", points: 7, loot: ["Gift", "Eis"], color: "#a98574" },
  { name: "Teufel", points: 10, loot: ["Eis", "Dynamit"], color: "#dc765c" },
  { name: "Hexe", points: 15, loot: ["Dynamit", "Taler"], color: "#9bb0a0" },
  { name: "Frankenstein", points: 12, loot: ["Granate", "Gekreuzte Schwerter"], color: "#81a38a" },
  { name: "Werwolf", points: 9, loot: ["Granate"], color: "#b38b68" }
];
const WEAPONS = {
  "Dolch": { damage: 3, reusable: true },
  "Gift": { damage: 1 },
  "Eis": { damage: 3 },
  "Gekreuzte Schwerter": { damage: 4 },
  "Granate": { damage: 6 },
  "Dynamit": { damage: 10 }
};
const app = document.querySelector("#app");
let draftPlayers = [{ name: "", alliance: "" }, { name: "", alliance: "" }];
let state = loadGame();
let message = "";

function escapeHTML(value) {
  return String(value).replace(/[&<>"']/g, (character) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[character]);
}

function allianceName(value) {
  const name = String(value ?? "").trim();
  return name.toLocaleLowerCase("de-DE") === "keine" ? "" : name;
}

function allianceKey(value) {
  return allianceName(value).toLocaleLowerCase("de-DE");
}

function loadGame() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
    if (!saved || !Array.isArray(saved.players) || !saved.players.length) return null;
    let migrated = false;
    [...(saved.field ?? []), ...(saved.reserve ?? [])].forEach((monster) => {
      if (!monster || monster.empty || monster.name !== "Vampir" || monster.points === 10) return;
      const oldMaxHp = monster.maxHp ?? monster.points;
      const damageTaken = Math.max(0, oldMaxHp - monster.hp);
      monster.points = 10;
      monster.maxHp = 10;
      monster.hp = Math.max(0, 10 - damageTaken);
      migrated = true;
    });
    if (migrated) localStorage.setItem(STORAGE_KEY, JSON.stringify(saved));
    return saved;
  } catch {
    return null;
  }
}

function saveGame() {
  if (!state) return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  const status = document.querySelector("#save-status");
  if (status) status.textContent = "Spielstand gespeichert";
}

function id() {
  return globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function shuffle(items) {
  const result = [...items];
  for (let index = result.length - 1; index > 0; index -= 1) {
    const other = Math.floor(Math.random() * (index + 1));
    [result[index], result[other]] = [result[other], result[index]];
  }
  return result;
}

function icon(name) {
  const paths = {
    arrow: '<path d="M4 12h15M13 5l7 7-7 7"/>',
    plus: '<path d="M12 5v14M5 12h14"/>',
    x: '<path d="m6 6 12 12M18 6 6 18"/>',
    turn: '<path d="M20 7v5h-5M4 17v-5h5M5 9a7 7 0 0 1 12-2l3 5M4 12l3 5a7 7 0 0 0 12-2"/>'
  };
  return `<svg viewBox="0 0 24 24" aria-hidden="true">${paths[name] ?? paths.arrow}</svg>`;
}

function monsterArt(color) {
  return `<svg viewBox="0 0 72 72" role="img" aria-label="Monsterillustration" style="color:${escapeHTML(color)}"><path d="M13 27 8 12l15 8c8-5 18-5 26 0l15-8-5 18c4 8 3 19-3 26-5 6-13 9-21 9s-16-3-21-9c-6-7-7-19-1-29Z"/><path d="M23 37c3-4 8-4 11 0v10c-4 4-8 4-11 0Zm15 0c3-4 8-4 11 0v10c-4 4-8 4-11 0Z" fill="#171a16"/><path d="m31 53 5 7 5-7" fill="#f3eddb"/></svg>`;
}

function render() {
  if (!state) {
    renderLobby();
    return;
  }
  if (state.phase === "orderPreview") renderOrderPreview();
  else if (state.phase === "coinHandoff") renderCoinHandoff();
  else if (state.phase === "coinUse") renderCoinUse();
  else if (state.phase === "handoff") renderHandoff();
  else if (state.phase === "attack") renderAttackForm();
  else if (state.phase === "results") renderResults();
  else if (state.phase === "ended") renderEnd();
  else if (state.phase === "planning") renderPlanning();
  else renderTransfer();
}

function renderLobby() {
  const rows = draftPlayers.map((player, index) => `
    <div class="player-row">
      <span class="player-number">${String(index + 1).padStart(2, "0")}</span>
      <input class="text-input" type="text" maxlength="22" autocomplete="off" placeholder="Spielername" aria-label="Name von Spieler ${index + 1}" data-player-name="${index}" value="${escapeHTML(player.name)}">
      <input class="text-input" type="text" maxlength="22" autocomplete="off" placeholder="Ohne Allianz" aria-label="Allianzname für Spieler ${index + 1}" data-player-alliance="${index}" value="${escapeHTML(allianceName(player.alliance))}">
      <button class="remove-player" type="button" data-action="remove-player" data-index="${index}" aria-label="Spieler ${index + 1} entfernen" ${draftPlayers.length <= 2 ? "disabled" : ""}>${icon("x")}</button>
    </div>`).join("");
  const sample = MONSTERS.slice(0, 3);
  app.innerHTML = `
    <div class="setup-layout">
      <section class="setup-copy">
        <p class="eyebrow">Das Klassenzimmer wird zum Schlachtfeld</p>
        <h1>Gemeinsam spielen.<br><em>Geheim angreifen.</em></h1>
        <p class="intro">Stellt eure Allianzen auf, reicht das Gerät weiter und lasst die Monster für euch kämpfen. Eure Spielstände bleiben auf diesem Gerät.</p>
        <form class="setup-form" id="setup-form">
          <p class="section-label"><span>Spielerliste</span><span>${draftPlayers.length} / 12</span></p>
          <div class="player-list">${rows}</div>
          <button class="add-player" type="button" data-action="add-player" ${draftPlayers.length >= 12 ? "disabled" : ""}>${icon("plus")} Spieler hinzufügen</button>
          ${message ? `<p class="error-banner" role="alert">${escapeHTML(message)}</p>` : ""}
          <p class="form-note">Gib für Mitglieder derselben Allianz denselben Namen ein. Eine Allianz darf höchstens drei Spieler haben; das Feld kann leer bleiben.</p>
          <label class="test-mode-toggle"><input id="test-mode" type="checkbox"><span><strong>Testmodus</strong><small>Zeigt aktuelle Monsterlebenspunkte im Spiel.</small></span></label>
          <button class="primary-button setup-submit" type="submit">Spiel vorbereiten ${icon("arrow")}</button>
          <p class="setup-note">2 bis 12 Spieler · Start mit je 5 Siegpunkten</p>
        </form>
      </section>
      <aside class="setup-aside">
        <p class="eyebrow">Das Spielfeld</p>
        <h2>Drei Plätze.<br>Neun aus der Reserve.</h2>
        <p class="intro">Nur die Monster auf dem Schlachtfeld sind Ziele. Stirbt eines, rückt das nächste sofort nach.</p>
        <div class="field-preview">
          <div class="preview-top"><span>Aktive Monster</span><span>3 Plätze</span></div>
          <div class="preview-monsters">${sample.map((monster) => `<div class="preview-monster" style="--art-color:${monster.color}"><span class="preview-art">${monsterArt(monster.color)}</span><span><strong>${monster.name}</strong><small>Beute: ${monster.loot.join(", ")}</small></span><span class="preview-hp">${monster.points} ♥</span></div>`).join("")}</div>
          <div class="reserve-preview"><span>Monster in der Reserve</span><strong class="reserve-count">09</strong></div>
        </div>
        <div class="rules-strip"><span><i></i>Dolch immer verfügbar</span><span><i></i>Spezialwaffen als Beute</span><span><i></i>Spielstand lokal gespeichert</span></div>
      </aside>
    </div>`;
}

function createMonster(source) {
  return { id: id(), name: source.name, maxHp: source.points, hp: source.points, points: source.points, loot: [...source.loot], color: source.color, poison: 0, frozenBy: null };
}

function startGame() {
  const testMode = document.querySelector("#test-mode")?.checked ?? false;
  const names = draftPlayers.map((player, index) => ({ name: player.name.trim() || `Spieler ${index + 1}`, alliance: allianceName(player.alliance) }));
  if (names.length < 2 || names.length > 12) {
    message = "Es können 2 bis 12 Spieler teilnehmen.";
    renderLobby();
    return;
  }
  const allianceCounts = new Map();
  names.forEach((player) => {
    const key = allianceKey(player.alliance);
    if (key) allianceCounts.set(key, (allianceCounts.get(key) ?? 0) + 1);
  });
  if ([...allianceCounts.values()].some((count) => count > 3)) {
    message = "Jede Allianz darf höchstens drei Mitglieder haben.";
    renderLobby();
    return;
  }
  const monsters = MONSTERS.map(createMonster);
  state = {
    round: 1,
    phase: "transfer",
    testMode,
    players: names.map((player) => ({ id: id(), ...player, points: 5, weapons: [], talers: 0 })),
    field: monsters.slice(0, 3),
    reserve: monsters.slice(3),
    pending: [],
    order: [],
    attacks: {},
    resultsLog: [],
    plannerIndex: 0,
    currentPlanner: null
  };
  message = "";
  saveGame();
  render();
}

function renderBoard() {
  const cards = state.field.map((monster, index) => monster ? monsterCard(monster, index, false) : '<article class="monster-card slot-empty" aria-label="Leerer Monsterplatz"><span>Leerer Platz</span></article>').join("");
  return `<div class="battlefield">${cards || '<p class="board-empty">Das Schlachtfeld ist leer.</p>'}</div>${renderNextReserve()}<div class="reserve-bar"><span class="reserve-label"><span class="reserve-icon" aria-hidden="true"></span>Monster in der Reserve</span><strong class="reserve-count">${String(state.reserve.length).padStart(2, "0")}</strong></div>`;
}

function renderNextReserve() {
  const monsters = state.reserve.slice(0, 3);
  const cards = monsters.length ? monsters.map((monster, index) => `
    <article class="next-reserve-card" style="--art-color:${escapeHTML(monster.color)}">
      <span class="next-reserve-index">${String(index + 1).padStart(2, "0")}</span>
      <span class="next-reserve-art">${monsterArt(monster.color)}</span>
      <strong>${escapeHTML(monster.name)}</strong>
      <span class="next-reserve-points">${monster.points} SP</span>
    </article>`).join("") : '<p class="next-reserve-empty">Keine Monster mehr in der Reserve.</p>';
  return `<section class="next-reserve" aria-label="Nächste Monster aus der Reserve"><div class="board-heading"><h2>Nächste Reserve-Monster</h2><span>${monsters.length} sichtbar</span></div><div class="next-reserve-cards">${cards}</div></section>`;
}

function monsterCard(monster, index, selectable, selected = false, disabled = false) {
  if (!monster || monster.empty) return '<article class="monster-card slot-empty" aria-label="Leerer Monsterplatz"><span>Leerer Platz</span></article>';
  const classNames = ["monster-card", selected ? "selected" : "", disabled ? "disabled" : ""].filter(Boolean).join(" ");
  const clickAttrs = selectable && !disabled ? `data-action="select-target" data-index="${index}"` : "";
  const frozen = monster.frozenBy ? " · Eis" : "";
  const showHp = state.testMode || (state.phase === "attack" && state.hpPeekPlayers?.includes(state.currentPlanner));
  return `<article class="${classNames}" style="--art-color:${escapeHTML(monster.color)}" ${clickAttrs ? `role="button" tabindex="0" ${clickAttrs}` : ""}>
    <div class="monster-card-top"><span class="monster-position">${String(index + 1).padStart(2, "0")}${frozen}</span>${showHp ? `<span class="monster-hp">${monster.hp} ♥</span>` : ""}</div>
    <div class="monster-art">${monsterArt(monster.color)}</div>
    <div class="monster-card-bottom"><h3 class="monster-name">${escapeHTML(monster.name)}</h3><span class="monster-reward"><b>${monster.points} SP</b>${escapeHTML(monster.loot.join(" · "))}</span></div>
  </article>`;
}

function renderScoreList() {
  const sorted = [...state.players].sort((left, right) => right.points - left.points);
  return sorted.map((player, index) => {
    const alliance = allianceName(player.alliance);
    return `<div class="score-row${state.currentPlanner === player.id ? " current" : ""}"><span class="score-index">${String(index + 1).padStart(2, "0")}</span><span class="score-name">${escapeHTML(player.name)}${alliance ? `<small class="score-alliance">${escapeHTML(alliance)}</small>` : ""}</span><strong class="score-value">${player.points}</strong></div>`;
  }).join("");
}

function allianceGroups() {
  const groups = new Map();
  state.players.forEach((player) => {
    const key = allianceKey(player.alliance);
    if (key) groups.set(key, [...(groups.get(key) ?? []), player]);
  });
  return [...groups.entries()]
    .filter(([, members]) => members.length > 1)
    .map(([key, members]) => ({ key, name: allianceName(members[0].alliance), members }));
}

function renderAllocationRows(alliance) {
  const total = alliance.members.reduce((sum, player) => sum + player.points, 0);
  const maximum = total - alliance.members.length + 1;
  return alliance.members.map((player) => `
    <label class="allocation-row" for="allocation-${escapeHTML(player.id)}">
      <span class="allocation-name"><strong>${escapeHTML(player.name)}</strong><small>Aktuell ${player.points} SP</small></span>
      <span class="allocation-input-wrap"><input class="text-input" id="allocation-${escapeHTML(player.id)}" name="points-${escapeHTML(player.id)}" type="number" min="1" max="${maximum}" value="${player.points}" required data-allocation-points><small>SP</small></span>
    </label>`).join("");
}

function renderAllocationDialog() {
  const alliances = allianceGroups();
  const selected = alliances[0];
  if (!selected) return "";
  const total = selected.members.reduce((sum, player) => sum + player.points, 0);
  return `<dialog class="allocation-dialog" id="alliance-dialog" aria-labelledby="allocation-title">
    <div class="allocation-dialog-inner">
      <div class="allocation-heading"><div><p class="eyebrow">Vor den Angriffen</p><h2 id="allocation-title">Siegpunkte neu verteilen</h2></div><button class="remove-player" type="button" data-action="close-allocation" aria-label="Fenster schließen">${icon("x")}</button></div>
      <p class="allocation-intro">Wähle eine Allianz und teile ihren gesamten Punktepool neu auf. Die Verteilung wird erst nach deiner Bestätigung übernommen.</p>
      <form id="allocation-form" data-allocation-pool="${total}">
        <label class="field-label" for="allocation-alliance">Allianz auswählen</label>
        <select class="select-input allocation-select" id="allocation-alliance" name="alliance">${alliances.map((alliance) => `<option value="${escapeHTML(alliance.key)}" ${alliance.key === selected.key ? "selected" : ""}>${escapeHTML(alliance.name)}</option>`).join("")}</select>
        <div class="allocation-pool"><span>Verfügbare Siegpunkte</span><strong id="allocation-total">${total} SP</strong></div>
        <div class="allocation-members" id="allocation-members">${renderAllocationRows(selected)}</div>
        <p class="allocation-balance" id="allocation-balance" aria-live="polite">Alle ${total} SP sind zugeteilt.</p>
        <p class="allocation-message" id="allocation-message" role="alert"></p>
        <div class="allocation-actions"><button class="secondary-button" type="button" data-action="close-allocation">Abbrechen</button><button class="primary-button" id="confirm-allocation" type="submit">Verteilung bestätigen ${icon("arrow")}</button></div>
      </form>
    </div>
  </dialog>`;
}

function updateAllocationDialog(allianceKeyValue) {
  const alliance = allianceGroups().find((group) => group.key === allianceKeyValue);
  const form = document.querySelector("#allocation-form");
  if (!alliance || !form) return;
  const total = alliance.members.reduce((sum, player) => sum + player.points, 0);
  form.dataset.allocationPool = String(total);
  document.querySelector("#allocation-total").textContent = `${total} SP`;
  document.querySelector("#allocation-members").innerHTML = renderAllocationRows(alliance);
  document.querySelector("#allocation-message").textContent = "";
  updateAllocationBalance(form);
}

function updateAllocationBalance(form) {
  const pool = Number(form.dataset.allocationPool);
  const inputs = [...form.querySelectorAll("[data-allocation-points]")];
  const values = inputs.map((input) => Number(input.value));
  const assigned = values.reduce((sum, value) => sum + (Number.isFinite(value) ? value : 0), 0);
  const valid = inputs.every((input, index) => input.value !== "" && Number.isInteger(values[index]) && values[index] >= 1 && values[index] <= Number(input.max));
  const balance = document.querySelector("#allocation-balance");
  if (valid && assigned === pool) balance.textContent = `Alle ${pool} SP sind zugeteilt.`;
  else if (assigned < pool) balance.textContent = `Noch ${pool - assigned} SP zu verteilen.`;
  else balance.textContent = `${assigned - pool} SP zu viel verteilt.`;
  document.querySelector("#confirm-allocation").disabled = !(valid && assigned === pool);
}

function renderGameShell(content, eyebrow, title, subtitle = "") {
  app.innerHTML = `<div class="game-heading"><div><p class="eyebrow">${escapeHTML(eyebrow)}</p><h1>${escapeHTML(title)}</h1>${subtitle ? `<p class="intro">${escapeHTML(subtitle)}</p>` : ""}</div><div class="round-stamp"><span>Runde</span><strong>${state.round}</strong>${state.testMode ? '<small class="test-mode-badge">Testmodus</small>' : ""}</div></div>${content}`;
}

function renderTransfer() {
  const alliances = allianceGroups();
  const weaponHolders = state.players.filter((player) => player.weapons.length);
  const availableWeapons = [...new Set(weaponHolders.flatMap((player) => player.weapons))];
  const talerHolders = state.players.filter((player) => player.talers > 0);
  const weaponTransferForm = availableWeapons.length ? `
    <form id="weapon-transfer-form">
      <div class="transfer-form">
        <select class="select-input" name="from" aria-label="Spezialwaffe abgeben">${weaponHolders.map((player) => `<option value="${player.id}">${escapeHTML(player.name)}</option>`).join("")}</select>
        <select class="select-input" name="to" aria-label="Spezialwaffe erhalten">${state.players.map((player) => `<option value="${player.id}">${escapeHTML(player.name)}</option>`).join("")}</select>
        <select class="select-input" name="weapon" aria-label="Spezialwaffe auswählen">${availableWeapons.map((weapon) => `<option>${escapeHTML(weapon)}</option>`).join("")}</select>
      </div>
      <p class="form-note">Spezialwaffen können an jeden anderen Spieler weitergegeben werden.</p>
      <p class="transfer-message" id="weapon-transfer-message" role="status"></p>
      <button class="secondary-button" type="submit">Spezialwaffe weitergeben ${icon("arrow")}</button>
    </form>` : `<p class="form-note">Es gibt keine Spezialwaffen zum Weitergeben.</p>`;
  const talerTransferForm = talerHolders.length ? `
    <form id="taler-transfer-form">
      <div class="transfer-form">
        <select class="select-input" name="from" aria-label="Taler abgeben">${talerHolders.map((player) => `<option value="${player.id}">${escapeHTML(player.name)} · ${player.talers} Taler</option>`).join("")}</select>
        <select class="select-input" name="to" aria-label="Taler erhalten">${state.players.map((player) => `<option value="${player.id}">${escapeHTML(player.name)}</option>`).join("")}</select>
      </div>
      <p class="form-note">Es wird jeweils ein Taler weitergegeben.</p>
      <p class="transfer-message" id="taler-transfer-message" role="status"></p>
      <button class="secondary-button" type="submit">Taler weitergeben ${icon("arrow")}</button>
    </form>` : `<p class="form-note">Es gibt keine Taler zum Weitergeben.</p>`;
  const allocationButton = `<button class="secondary-button allocation-open" type="button" data-action="open-allocation" ${alliances.length ? "" : "disabled"}>Siegpunkte neu verteilen ${icon("arrow")}</button>`;
  const allocationHint = alliances.length ? "" : `<p class="form-note">Für die Neuverteilung müssen mindestens zwei Spieler derselben Allianz angehören. Lege die Allianz beim Spielstart fest.</p>`;
  const content = `<div class="game-layout"><section><div class="board-heading"><h2>Schlachtfeld</h2><span>Angriffsziele</span></div>${renderBoard()}</section><aside class="sidebar"><section class="side-section"><div class="side-title"><h2>Allianzverteilung</h2><span>vor den Angriffen</span></div><p class="form-note allocation-note">Wähle eine Allianz, um ihre Siegpunkte neu zuzuordnen. Die Rangfolge bleibt hier verborgen.</p>${allocationButton}${allocationHint}</section><section class="side-section"><div class="side-title"><h2>Spezialwaffen</h2><span>Übergabe</span></div>${weaponTransferForm}</section><section class="side-section"><div class="side-title"><h2>Taler</h2><span>Übergabe</span></div>${talerTransferForm}</section><div class="sidebar-actions"><button class="primary-button" type="button" data-action="start-planning">Angriffe planen ${icon("arrow")}</button></div></aside></div>${renderAllocationDialog()}`;
  renderGameShell(content, "Rundenbeginn", "Punkte teilen, dann angreifen", "Verteile Allianzpunkte neu, bevor die Angriffsreihenfolge festgelegt wird.");
}

function renderOrderPreview() {
  const rows = state.order.map((playerId, index) => {
    const player = state.players.find((item) => item.id === playerId);
    return `<div class="score-row"><span class="score-index">${String(index + 1).padStart(2, "0")}</span><span class="score-name">${escapeHTML(player.name)}</span><strong class="score-value">${player.points} SP</strong></div>`;
  }).join("");
  const content = `<section class="resolve-screen order-preview"><p class="eyebrow">Vor den Angriffen</p><h2>Diese Reihenfolge gilt für die Runde</h2><p class="intro">Die Reihenfolge richtet sich nach den Siegpunkten. Bei Gleichstand wird zufällig ausgelost. Eingelöste Taler sind berücksichtigt.</p><div class="score-list order-list">${rows}</div><div class="resolve-actions"><button class="primary-button" type="button" data-action="confirm-order">Reihenfolge bestätigen und Angriffe starten ${icon("arrow")}</button></div></section>`;
  renderGameShell(content, "Reihenfolge", "Angriffsreihenfolge", "Die Reihenfolge wird erst nach der Punkteverteilung gezeigt.");
}

function currentCoinPlayer() {
  const playerId = state.coinPlayers?.[state.coinPlayerIndex];
  return state.players.find((player) => player.id === playerId);
}

function renderCoinHandoff() {
  const player = currentCoinPlayer();
  if (!player) {
    state.phase = "orderPreview";
    saveGame();
    render();
    return;
  }
  app.innerHTML = `<section class="handoff"><div class="handoff-content"><div class="handoff-seal" aria-hidden="true">${state.coinPlayerIndex + 1}</div><p class="eyebrow">Taler einsetzen · ${state.coinPlayerIndex + 1} von ${state.coinPlayers.length}</p><h1>Weitergeben an<br><em>${escapeHTML(player.name)}</em></h1><p>Bitte das Gerät nur an ${escapeHTML(player.name)} weitergeben. Die Taler-Aktionen sind persönlich.</p><button class="primary-button" type="button" data-action="show-coin-actions">Nur ${escapeHTML(player.name)} sieht die Taler-Aktionen ${icon("arrow")}</button></div></section>`;
}

function renderCoinUse() {
  const player = currentCoinPlayer();
  if (!player) {
    finishCoinActions();
    return;
  }
  const rankOptions = state.order.map((playerId, index) => `<option value="${index + 1}">${index + 1}. Platz</option>`).join("");
  const monsters = state.field.filter((monster) => monster && !monster.empty);
  const hpRows = monsters.length ? monsters.map((monster) => `<div class="coin-hp-row"><span>${escapeHTML(monster.name)}</span><strong>${monster.hp} / ${monster.maxHp} ♥</strong></div>`).join("") : '<p class="form-note">Es sind keine Monster auf dem Schlachtfeld.</p>';
  const content = `<section class="resolve-screen coin-use"><p class="eyebrow">Persönliche Taler-Aktion</p><h2>${escapeHTML(player.name)}, du hast ${player.talers} Taler.</h2><p class="intro">Jeder eingelöste Taler ermöglicht eine Aktion. Du kannst mehrere Taler einzeln einsetzen.</p><div class="coin-action-grid"><section class="coin-action"><h3>Lebenspunkte ansehen</h3><p>Ein Fenster zeigt dir den aktuellen Stand. Bei deinem Angriff siehst du die dann aktuellen Lebenspunkte erneut.</p><button class="secondary-button" type="button" data-action="redeem-hp-taler" ${player.talers < 1 ? "disabled" : ""}>1 Taler einlösen ${icon("arrow")}</button></section><section class="coin-action"><h3>Rang festlegen</h3><p>Wähle deinen Platz für diese Runde. Die anderen Spieler rücken entsprechend nach.</p><form id="coin-rank-form"><label class="field-label" for="coin-rank">Dein Platz</label><select class="select-input" id="coin-rank" name="rank">${rankOptions}</select><button class="secondary-button" type="submit" ${player.talers < 1 ? "disabled" : ""}>1 Taler einlösen ${icon("arrow")}</button></form></section></div><div class="resolve-actions coin-finish"><button class="primary-button" type="button" data-action="finish-coin-actions">Fertig mit Taler-Aktionen ${icon("arrow")}</button></div><dialog class="allocation-dialog" id="taler-hp-dialog" aria-labelledby="taler-hp-title"><div class="allocation-dialog-inner"><div class="allocation-heading"><div><p class="eyebrow">Taler eingelöst</p><h2 id="taler-hp-title">Aktuelle Monster-Lebenspunkte</h2></div></div><p class="allocation-intro">Diese Anzeige ist nur für ${escapeHTML(player.name)} bestimmt.</p><div class="coin-hp-list">${hpRows}</div><div class="allocation-actions"><button class="primary-button" type="button" data-action="close-hp-reveal">Weiter ${icon("arrow")}</button></div></div></dialog></section>`;
  renderGameShell(content, "Taler einlösen", "Sonderaktionen vor der Reihenfolge", "Die Angriffsreihenfolge wird erst nach diesen persönlichen Aktionen bestätigt.");
  const dialog = document.querySelector("#taler-hp-dialog");
  if (state.hpRevealOpen && dialog && !dialog.open) dialog.showModal();
}

function finishCoinActions() {
  state.hpRevealOpen = false;
  state.coinPlayerIndex += 1;
  if (state.coinPlayerIndex >= state.coinPlayers.length) state.phase = "orderPreview";
  else state.phase = "coinHandoff";
  saveGame();
  render();
}

function redeemHpTaler() {
  const player = currentCoinPlayer();
  if (!player || player.talers < 1) return;
  player.talers -= 1;
  state.hpPeekPlayers ??= [];
  if (!state.hpPeekPlayers.includes(player.id)) state.hpPeekPlayers.push(player.id);
  state.hpRevealOpen = true;
  saveGame();
  render();
}

function redeemRankTaler(form) {
  const player = currentCoinPlayer();
  const rank = Number(new FormData(form).get("rank"));
  if (!player || player.talers < 1 || !Number.isInteger(rank) || rank < 1 || rank > state.order.length) return;
  const currentIndex = state.order.indexOf(player.id);
  if (currentIndex >= 0) state.order.splice(currentIndex, 1);
  state.order.splice(rank - 1, 0, player.id);
  player.talers -= 1;
  saveGame();
  render();
}

function beginPlanning() {
  const groups = new Map();
  state.players.forEach((player) => {
    const key = player.points;
    groups.set(key, [...(groups.get(key) ?? []), player]);
  });
  state.order = [...groups.keys()].sort((left, right) => right - left).flatMap((points) => shuffle(groups.get(points))).map((player) => player.id);
  state.attacks = {};
  state.plannerIndex = 0;
  state.currentPlanner = null;
  state.coinPlayers = state.order.filter((playerId) => state.players.find((player) => player.id === playerId)?.talers > 0);
  state.coinPlayerIndex = 0;
  state.hpPeekPlayers = [];
  state.hpRevealOpen = false;
  state.phase = state.coinPlayers.length ? "coinHandoff" : "orderPreview";
  saveGame();
  render();
}

function renderPlanning() {
  const playersReady = Object.keys(state.attacks).length;
  const content = `<div class="game-layout"><section><div class="board-heading"><h2>Schlachtfeld</h2><span>Angriffsziele</span></div>${renderBoard()}</section><aside class="sidebar"><section class="side-section"><div class="side-title"><h2>Punktestand</h2><span>${playersReady} / ${state.players.length} bereit</span></div><div class="score-list">${renderScoreList()}</div></section><div class="phase-panel"><p class="eyebrow">Geheime Eingabe</p><p class="phase-title">Angriffe werden verdeckt gesammelt</p><p class="phase-copy">Jeder Spieler wählt nacheinander ein Ziel und eine Waffe. Aufgedeckt wird erst, wenn alle gewählt haben.</p></div><div class="sidebar-actions"><button class="primary-button" type="button" data-action="begin-resolution">Alle Angriffe aufdecken ${icon("arrow")}</button></div></aside></div>`;
  renderGameShell(content, "Angriffsphase", "Alle Angriffe sind gewählt", "Die geheime Eingabe ist abgeschlossen.");
}

function renderHandoff() {
  const player = currentPlayer();
  const index = state.plannerIndex + 1;
  app.innerHTML = `<section class="handoff"><div class="handoff-content"><div class="handoff-seal" aria-hidden="true">${index}</div><p class="eyebrow">Geheime Eingabe · ${index} von ${state.order.length}</p><h1>Weitergeben an<br><em>${escapeHTML(player.name)}</em></h1><p>Bitte das Gerät nur an ${escapeHTML(player.name)} weitergeben. Die Angriffsdetails bleiben vor den anderen verborgen.</p><button class="primary-button" type="button" data-action="show-attack">Nur ${escapeHTML(player.name)} sieht den Angriff ${icon("arrow")}</button></div></section>`;
}

function currentPlayer() {
  return state.players.find((player) => player.id === state.currentPlanner);
}

function renderAttackForm() {
  const player = currentPlayer();
  const choices = ["Dolch", ...player.weapons];
  const canSeeHp = state.testMode || state.hpPeekPlayers?.includes(player.id);
  const hpNote = canSeeHp && !state.testMode ? "Durch deinen Taler siehst du die aktuellen Lebenspunkte der Monster." : "";
  const content = `<section class="attack-form"><p class="eyebrow">Geheime Eingabe · Spieler ${state.plannerIndex + 1} von ${state.order.length}</p><h2>${escapeHTML(player.name)}, wähle deinen Angriff.</h2><p class="intro">Du hast ${player.points} Siegpunkte. Dein Dolch bleibt immer verfügbar.</p>${hpNote ? `<p class="coin-hp-note">${escapeHTML(hpNote)}</p>` : ""}<div class="battlefield" id="target-field">${state.field.map((monster, index) => monsterCard(monster, index, true)).join("") || '<p class="board-empty">Keine Monster mehr auf dem Feld.</p>'}</div>${renderNextReserve()}<div class="attack-tools"><label><span class="field-label">Waffe</span><select class="select-input weapon-select" id="weapon-choice">${choices.map((weapon) => `<option>${escapeHTML(weapon)}</option>`).join("")}</select></label><label><span class="field-label">Zweites Ziel · nur Schwerter</span><select class="select-input weapon-select" id="second-target"><option value="">Kein zweites Ziel</option>${state.field.map((monster, index) => `<option value="${index}">${index + 1} · ${escapeHTML(monster.name)}</option>`).join("")}</select></label></div><p class="attack-help" id="attack-help">Wähle ein Monster auf dem Schlachtfeld.</p><button class="primary-button attack-submit" type="button" data-action="submit-attack" disabled>Angriff verdeckt abgeben ${icon("arrow")}</button></section>`;
  renderGameShell(content, "Private Eingabe", "Dein Zug", "Die anderen Spieler sehen weder Ziel noch Waffe.");
  updateAttackHelp();
}

function selectedTargets() {
  return [...document.querySelectorAll(".monster-card.selected")].map((card) => Number(card.dataset.index));
}

function updateAttackHelp() {
  const weapon = document.querySelector("#weapon-choice")?.value;
  const targets = selectedTargets();
  const help = document.querySelector("#attack-help");
  const submit = document.querySelector('[data-action="submit-attack"]');
  if (!help || !submit) return;
  if (weapon === "Gekreuzte Schwerter") help.textContent = targets.length === 2 ? "Beide Ziele erhalten je 2 Schaden." : "Ein Ziel erhält 4 Schaden. Wähle bei Bedarf ein zweites Ziel.";
  else help.textContent = weapon ? `${weapon}: ${WEAPONS[weapon].damage} Schaden${weapon === "Dynamit" ? " beim nächsten eigenen Zug" : " sofort"}.` : "Wähle ein Monster auf dem Schlachtfeld.";
  submit.disabled = targets.length === 0 || (targets.length > 1 && weapon !== "Gekreuzte Schwerter");
}

function submitAttack() {
  const player = currentPlayer();
  const weapon = document.querySelector("#weapon-choice").value;
  const targets = selectedTargets();
  if (!player || !targets.length || (targets.length > 1 && weapon !== "Gekreuzte Schwerter")) return;
  state.attacks[player.id] = { weapon, targets: weapon === "Gekreuzte Schwerter" ? targets.slice(0, 2) : [targets[0]] };
  if (weapon !== "Dolch") player.weapons.splice(player.weapons.indexOf(weapon), 1);
  state.plannerIndex += 1;
  if (state.plannerIndex >= state.order.length) {
    state.phase = "planning";
    state.currentPlanner = null;
  } else {
    state.currentPlanner = state.order[state.plannerIndex];
    state.phase = "handoff";
  }
  saveGame();
  render();
}

function monsterAt(slot) {
  return state.field[slot]?.empty ? null : state.field[slot] ?? null;
}

function addLog(message, death = false, rewards = []) {
  state.resultsLog.push({ message, death, rewards });
}

function killMonster(monster, slot, player, cause) {
  state.field[slot] = state.reserve.shift() ?? { empty: true, name: "Leerer Platz" };
  player.points += monster.points;
  const rewards = [];
  monster.loot.forEach((item) => {
    if (item === "Taler") player.talers += 1;
    else player.weapons.push(item);
    rewards.push(item);
  });
  addLog(`${player.name} hat ${monster.name} mit ${cause} besiegt.`, true, rewards);
}

function dealDamage(slot, amount, player, cause) {
  const monster = monsterAt(slot);
  if (!monster) return false;
  if (monster.frozenBy && monster.frozenBy !== player.id) {
    addLog(`${player.name}s Angriff mit ${cause} prallt an ${monster.name}s Eis-Schutz ab.`);
    return false;
  }
  monster.hp -= amount;
  addLog(`${player.name} fügt ${monster.name} mit ${cause} ${amount} Schaden zu.`);
  if (monster.hp <= 0) killMonster(monster, slot, player, cause);
  return true;
}

function resolveRound() {
  state.resultsLog = [];
  state.phase = "results";
  state.order.forEach((playerId) => {
    const player = state.players.find((entry) => entry.id === playerId);
    const attack = state.attacks[playerId];
    if (!player || !attack) return;
    state.field.forEach((monster) => {
      if (monster.frozenBy === player.id) monster.frozenBy = null;
    });
    const due = state.pending.filter((effect) => effect.playerId === player.id);
    state.pending = state.pending.filter((effect) => !due.includes(effect));
    due.forEach((effect) => {
      const targetSlot = state.field.findIndex((monster) => monster && !monster.empty && monster.id === effect.targetMonsterId);
      if (targetSlot >= 0) dealDamage(targetSlot, effect.damage, player, "Dynamit");
      else addLog(`${player.name}s Dynamit verfällt, weil das Ziel vorher besiegt wurde.`);
    });
    if (attack.weapon === "Dynamit") {
      const target = monsterAt(attack.targets[0]);
      if (target) {
        state.pending.push({ playerId: player.id, targetMonsterId: target.id, damage: 10 });
        addLog(`${player.name} platziert Dynamit an ${target.name}. Es explodiert vor dem nächsten eigenen Angriff.`);
      }
    } else {
      const targets = attack.targets;
      if (attack.weapon === "Gekreuzte Schwerter") {
        const damage = targets.length === 1 ? 4 : 2;
        targets.forEach((slot) => dealDamage(slot, damage, player, attack.weapon));
      } else {
        const slot = targets[0];
        const target = monsterAt(slot);
        const blockedByIce = target?.frozenBy && target.frozenBy !== player.id;
        if (attack.weapon === "Gift" && target && !blockedByIce) target.poison = true;
        const damaged = dealDamage(slot, WEAPONS[attack.weapon].damage, player, attack.weapon);
        const remainingTarget = monsterAt(slot);
        if (attack.weapon === "Eis" && damaged && remainingTarget?.id === target?.id) remainingTarget.frozenBy = player.id;
      }
    }
    state.field.forEach((monster, slot) => {
      if (monster?.poison > 0) {
        monster.hp -= 1;
        addLog(`Gift entzieht ${monster.name} 1 Lebenspunkt.`);
        if (monster.hp <= 0) killMonster(monster, slot, player, "Gift");
      }
    });
  });
  state.currentPlanner = null;
  if (state.field.every((monster) => !monster || monster.empty) && !state.reserve.length) state.phase = "ended";
  saveGame();
  render();
}

function renderResults() {
  const deaths = state.resultsLog.filter((result) => result.death);
  const rows = deaths.length ? deaths.map((result) => `<div class="result-item death"><span class="result-copy">${escapeHTML(result.message)}${result.rewards?.length ? `<small class="result-rewards">Beute: ${escapeHTML(result.rewards.join(", "))}</small>` : ""}</span><span class="result-tag">MONSTER BESIEGT</span></div>`).join("") : '<div class="result-item"><span class="result-copy">In dieser Runde wurde kein Monster besiegt.</span></div>';
  const content = `<div class="resolve-screen"><p class="eyebrow">Runde ${state.round} · öffentliche Tötungen</p><h2>Wer hat ein Monster besiegt?</h2><div class="result-list">${rows}</div><div class="resolve-actions"><button class="primary-button" type="button" data-action="next-round">Weiter zur nächsten Runde ${icon("arrow")}</button></div></div>`;
  renderGameShell(content, "Kampfergebnis", "Das Schlachtfeld verändert sich", "Angezeigt werden nur besiegte Monster und ihre Sieger.");
}

function nextRound() {
  state.round += 1;
  state.phase = state.field.some((monster) => monster && !monster.empty) || state.reserve.length ? "transfer" : "ended";
  state.hpPeekPlayers = [];
  state.coinPlayers = [];
  state.coinPlayerIndex = 0;
  saveGame();
  render();
}

function finalScores() {
  const alliancePoints = new Map();
  state.players.forEach((player) => {
    const key = allianceKey(player.alliance);
    if (key) {
      alliancePoints.set(key, (alliancePoints.get(key) ?? 0) + player.points);
    }
  });
  return state.players.map((player) => {
    const key = allianceKey(player.alliance);
    if (!key) return { ...player, final: player.points };
    const members = state.players.filter((member) => allianceKey(member.alliance) === key).length;
    const average = alliancePoints.get(key) / members;
    return { ...player, final: Math.ceil(average * 10) / 10 };
  }).sort((left, right) => right.final - left.final);
}

function renderEnd() {
  const scores = finalScores();
  const best = scores[0]?.final;
  const winners = scores.filter((player) => player.final === best);
  app.innerHTML = `<section class="end-screen"><p class="eyebrow">Spiel beendet</p><h1>${winners.length > 1 ? "Gleichstand." : `Sieg für <em>${escapeHTML(winners[0].name)}</em>.`}</h1><p>${winners.length > 1 ? "Mehrere Spieler teilen sich den ersten Platz." : "Das Schlachtfeld ist leer."}</p><div class="winner-list">${scores.map((player) => `<div class="winner-row"><strong>${escapeHTML(player.name)}${allianceName(player.alliance) ? ` · ${escapeHTML(allianceName(player.alliance))}` : ""}</strong><span>${player.final} SP</span></div>`).join("")}</div><button class="primary-button" type="button" data-action="new-game">Neues Spiel vorbereiten ${icon("arrow")}</button></section>`;
}

function allocateAlliancePoints(form) {
  const data = new FormData(form);
  const alliance = allianceGroups().find((group) => group.key === data.get("alliance"));
  const error = document.querySelector("#allocation-message");
  const fail = (text) => { if (error) error.textContent = text; };
  if (!alliance) return fail("Wähle eine gültige Allianz aus.");
  const allocations = alliance.members.map((player) => ({ player, points: Number(data.get(`points-${player.id}`)) }));
  const total = alliance.members.reduce((sum, player) => sum + player.points, 0);
  if (allocations.some(({ points }) => !Number.isInteger(points) || points < 1)) return fail("Jedes Mitglied muss mindestens einen Siegpunkt behalten.");
  if (allocations.reduce((sum, allocation) => sum + allocation.points, 0) !== total) return fail("Verteile alle verfügbaren Siegpunkte, ohne die Gesamtsumme zu verändern.");
  allocations.forEach(({ player, points }) => { player.points = points; });
  saveGame();
  render();
}

function transferWeapon(form) {
  const data = new FormData(form);
  const sender = state.players.find((player) => player.id === data.get("from"));
  const receiver = state.players.find((player) => player.id === data.get("to"));
  const weapon = data.get("weapon");
  const error = document.querySelector("#weapon-transfer-message");
  const fail = (text) => { if (error) error.textContent = text; };
  if (!sender || !receiver || sender.id === receiver.id) return fail("Wähle zwei verschiedene Spieler aus.");
  const weaponIndex = sender.weapons.indexOf(weapon);
  if (weaponIndex < 0) return fail("Dieser Spieler besitzt die ausgewählte Spezialwaffe nicht mehr.");
  sender.weapons.splice(weaponIndex, 1);
  receiver.weapons.push(weapon);
  saveGame();
  render();
}

function transferTaler(form) {
  const data = new FormData(form);
  const sender = state.players.find((player) => player.id === data.get("from"));
  const receiver = state.players.find((player) => player.id === data.get("to"));
  const error = document.querySelector("#taler-transfer-message");
  const fail = (text) => { if (error) error.textContent = text; };
  if (!sender || !receiver || sender.id === receiver.id) return fail("Wähle zwei verschiedene Spieler aus.");
  if (sender.talers < 1) return fail("Dieser Spieler hat keinen Taler mehr.");
  sender.talers -= 1;
  receiver.talers += 1;
  saveGame();
  render();
}

app.addEventListener("input", (event) => {
  if (event.target.matches("[data-player-name]")) draftPlayers[Number(event.target.dataset.playerName)].name = event.target.value;
  if (event.target.matches("[data-player-alliance]")) draftPlayers[Number(event.target.dataset.playerAlliance)].alliance = event.target.value;
  if (event.target.matches("[data-allocation-points]")) updateAllocationBalance(event.target.form);
});

app.addEventListener("change", (event) => {
  if (event.target.matches("#weapon-choice")) updateAttackHelp();
  if (event.target.matches("#allocation-alliance")) updateAllocationDialog(event.target.value);
  if (event.target.matches("#second-target")) {
    const first = selectedTargets()[0];
    if (event.target.value !== "" && (first === undefined || Number(event.target.value) === first || state.field[Number(event.target.value)]?.empty)) {
      event.target.value = "";
    }
    const second = event.target.value === "" ? undefined : Number(event.target.value);
    document.querySelectorAll(".attack-form .monster-card").forEach((card) => {
      const index = Number(card.dataset.index);
      card.classList.toggle("selected", index === first || index === second);
    });
    updateAttackHelp();
  }
});

app.addEventListener("submit", (event) => {
  if (event.target.id === "setup-form") {
    event.preventDefault();
    startGame();
  }
  if (event.target.id === "allocation-form") {
    event.preventDefault();
    allocateAlliancePoints(event.target);
  }
  if (event.target.id === "weapon-transfer-form") {
    event.preventDefault();
    transferWeapon(event.target);
  }
  if (event.target.id === "taler-transfer-form") {
    event.preventDefault();
    transferTaler(event.target);
  }
  if (event.target.id === "coin-rank-form") {
    event.preventDefault();
    redeemRankTaler(event.target);
  }
});

document.addEventListener("click", (event) => {
  const actionElement = event.target.closest("[data-action]");
  if (!actionElement) return;
  const action = actionElement.dataset.action;
  if (action === "add-player" && draftPlayers.length < 12) {
    draftPlayers.push({ name: "", alliance: "" });
    message = "";
    renderLobby();
    document.querySelector(`[data-player-name="${draftPlayers.length - 1}"]`)?.focus();
  } else if (action === "remove-player" && draftPlayers.length > 2) {
    draftPlayers.splice(Number(actionElement.dataset.index), 1);
    renderLobby();
  } else if (action === "new-game") {
    if (!state || window.confirm("Ein neues Spiel starten? Der bisherige Spielstand auf diesem Gerät wird ersetzt.")) {
      state = null;
      localStorage.removeItem(STORAGE_KEY);
      draftPlayers = [{ name: "", alliance: "" }, { name: "", alliance: "" }];
      message = "";
      renderLobby();
    }
  } else if (action === "start-planning") {
    beginPlanning();
  } else if (action === "confirm-order") {
    state.plannerIndex = 0;
    state.currentPlanner = state.order[0];
    state.phase = "handoff";
    saveGame();
    render();
  } else if (action === "open-allocation") {
    document.querySelector("#alliance-dialog")?.showModal();
  } else if (action === "close-allocation") {
    document.querySelector("#alliance-dialog")?.close();
  } else if (action === "show-coin-actions") {
    state.phase = "coinUse";
    saveGame();
    render();
  } else if (action === "redeem-hp-taler") {
    redeemHpTaler();
  } else if (action === "close-hp-reveal") {
    state.hpRevealOpen = false;
    saveGame();
    render();
  } else if (action === "finish-coin-actions") {
    finishCoinActions();
  } else if (action === "show-attack") {
    state.phase = "attack";
    render();
  } else if (action === "select-target") {
    const selected = Number(actionElement.dataset.index);
    const weapon = document.querySelector("#weapon-choice")?.value;
    const cards = [...document.querySelectorAll(".attack-form .monster-card")];
    if (weapon === "Gekreuzte Schwerter" && event.shiftKey) {
      const card = cards[selected];
      if (card?.classList.contains("selected")) card.classList.remove("selected");
      else if (document.querySelectorAll(".attack-form .monster-card.selected").length < 2) card?.classList.add("selected");
    } else {
      cards.forEach((card, index) => card.classList.toggle("selected", index === selected));
    }
    const secondSelect = document.querySelector("#second-target");
    if (secondSelect) secondSelect.value = "";
    updateAttackHelp();
  } else if (action === "submit-attack") {
    submitAttack();
  } else if (action === "begin-resolution") {
    resolveRound();
  } else if (action === "next-round") {
    nextRound();
  }
});

app.addEventListener("keydown", (event) => {
  if (event.target.matches(".attack-form .monster-card") && (event.key === "Enter" || event.key === " ")) {
    event.preventDefault();
    event.target.click();
  }
});

if (state) {
  document.querySelector("#save-status").textContent = "Spielstand geladen";
  if (state.phase === "attack") state.phase = "handoff";
}
render();