const STORAGE_KEY = "halloween-monster-save-v1";
const MONSTERS = [
  { name: "Mumie", points: 7, loot: ["Gift", "Granate"], color: "#c7a878" },
  { name: "Kürbis", points: 5, loot: ["Gift"], color: "#e58c49" },
  { name: "Medusa", points: 15, loot: ["Taler"], color: "#92a66f" },
  { name: "Vampir", points: 6, loot: ["Granate"], color: "#c36c66" },
  { name: "Baum", points: 9, loot: ["Eis", "Gekreuzte Schwerter"], color: "#8d9b74" },
  { name: "Sensenmann", points: 16, loot: ["Gekreuzte Schwerter", "Granate", "Taler"], color: "#b6b8a8" },
  { name: "Teufel", points: 10, loot: ["Eis", "Dynamit"], color: "#dc765c" },
  { name: "Hexe", points: 15, loot: ["Dynamit", "Taler"], color: "#9bb0a0" },
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
    return saved && Array.isArray(saved.players) && saved.players.length ? saved : null;
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
  if (state.phase === "handoff") renderHandoff();
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
  const sample = [MONSTERS[1], MONSTERS[5], MONSTERS[6]];
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
  const shuffledCards = shuffle(Array.from({ length: 12 }, () => createMonster(MONSTERS[Math.floor(Math.random() * MONSTERS.length)])));
  state = {
    round: 1,
    phase: "transfer",
    players: names.map((player) => ({ id: id(), ...player, points: 5, weapons: [], talers: 0, transferUsed: false })),
    field: shuffledCards.slice(0, 3),
    reserve: shuffledCards.slice(3),
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
  return `<div class="battlefield">${cards || '<p class="board-empty">Das Schlachtfeld ist leer.</p>'}</div><div class="reserve-bar"><span class="reserve-label"><span class="reserve-icon" aria-hidden="true"></span>Monster in der Reserve</span><strong class="reserve-count">${String(state.reserve.length).padStart(2, "0")}</strong></div>`;
}

function monsterCard(monster, index, selectable, selected = false, disabled = false) {
  if (!monster || monster.empty) return '<article class="monster-card slot-empty" aria-label="Leerer Monsterplatz"><span>Leerer Platz</span></article>';
  const classNames = ["monster-card", selected ? "selected" : "", disabled ? "disabled" : ""].filter(Boolean).join(" ");
  const clickAttrs = selectable && !disabled ? `data-action="select-target" data-index="${index}"` : "";
  const frozen = monster.frozenBy ? " · Eis" : "";
  return `<article class="${classNames}" style="--art-color:${escapeHTML(monster.color)}" ${clickAttrs ? `role="button" tabindex="0" ${clickAttrs}` : ""}>
    <div class="monster-card-top"><span class="monster-position">${String(index + 1).padStart(2, "0")}${frozen}</span><span class="monster-hp">${monster.hp} ♥</span></div>
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

function renderGameShell(content, eyebrow, title, subtitle = "") {
  app.innerHTML = `<div class="game-heading"><div><p class="eyebrow">${escapeHTML(eyebrow)}</p><h1>${escapeHTML(title)}</h1>${subtitle ? `<p class="intro">${escapeHTML(subtitle)}</p>` : ""}</div><div class="round-stamp"><span>Runde</span><strong>${state.round}</strong></div></div>${content}`;
}

function renderTransfer() {
  const playersWithAlliance = state.players.filter((player) => allianceKey(player.alliance));
  const transferOptions = playersWithAlliance.filter((player) => !player.transferUsed);
  const transferForm = playersWithAlliance.length >= 2 && transferOptions.length >= 2 ? `
    <form id="transfer-form">
      <div class="transfer-form">
        <select class="select-input" name="from" aria-label="Punkte abgeben">${transferOptions.map((player) => `<option value="${player.id}">${escapeHTML(player.name)} · ${player.points} SP</option>`).join("")}</select>
        <select class="select-input" name="to" aria-label="Punkte erhalten">${transferOptions.map((player) => `<option value="${player.id}">${escapeHTML(player.name)} · ${player.points} SP</option>`).join("")}</select>
        <input class="text-input" name="amount" type="number" min="1" value="1" aria-label="Anzahl Siegpunkte">
      </div>
      <p class="transfer-message" id="transfer-message" role="status"></p>
      <button class="secondary-button" type="submit">Siegpunkte übertragen ${icon("arrow")}</button>
    </form>` : `<p class="form-note">Für diese Runde ist kein weiterer Allianztransfer möglich.</p>`;
  const content = `<div class="game-layout"><section><div class="board-heading"><h2>Schlachtfeld</h2><span>Angriffsziele</span></div>${renderBoard()}</section><aside class="sidebar"><section class="side-section"><div class="side-title"><h2>Punktestand</h2><span>${state.players.length} Spieler</span></div><div class="score-list">${renderScoreList()}</div></section><section class="side-section"><div class="side-title"><h2>Allianztransfer</h2><span>vor den Angriffen</span></div><div class="transfer-list">${state.players.map((player) => `<div class="transfer-player"><span>${escapeHTML(player.name)}${player.transferUsed ? " · übertragen" : ""}</span><strong>${player.points}</strong></div>`).join("")}</div>${transferForm}</section><div class="sidebar-actions"><button class="primary-button" type="button" data-action="start-planning">Angriffe planen ${icon("arrow")}</button></div></aside></div>`;
  renderGameShell(content, "Rundenbeginn", "Punkte teilen, dann angreifen", "Allianzmitglieder können vor den Angriffen Siegpunkte übertragen.");
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
  state.currentPlanner = state.order[0];
  state.phase = "handoff";
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
  const content = `<section class="attack-form"><p class="eyebrow">Geheime Eingabe · Spieler ${state.plannerIndex + 1} von ${state.order.length}</p><h2>${escapeHTML(player.name)}, wähle deinen Angriff.</h2><p class="intro">Du hast ${player.points} Siegpunkte. Dein Dolch bleibt immer verfügbar.</p><div class="battlefield" id="target-field">${state.field.map((monster, index) => monsterCard(monster, index, true)).join("") || '<p class="board-empty">Keine Monster mehr auf dem Feld.</p>'}</div><div class="attack-tools"><label><span class="field-label">Waffe</span><select class="select-input weapon-select" id="weapon-choice">${choices.map((weapon) => `<option>${escapeHTML(weapon)}</option>`).join("")}</select></label><label><span class="field-label">Zweites Ziel · nur Schwerter</span><select class="select-input weapon-select" id="second-target"><option value="">Kein zweites Ziel</option>${state.field.map((monster, index) => `<option value="${index}">${index + 1} · ${escapeHTML(monster.name)}</option>`).join("")}</select></label></div><p class="attack-help" id="attack-help">Wähle ein Monster auf dem Schlachtfeld.</p><button class="primary-button attack-submit" type="button" data-action="submit-attack" disabled>Angriff verdeckt abgeben ${icon("arrow")}</button></section>`;
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
  else help.textContent = weapon ? `${weapon}: ${WEAPONS[weapon].damage} Schaden${weapon === "Dynamit" ? " beim nächsten Zug" : " sofort"}.` : "Wähle ein Monster auf dem Schlachtfeld.";
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

function addLog(message, death = false) {
  state.resultsLog.push({ message, death });
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
  addLog(`${player.name} hat ${monster.name} besiegt.`, true);
}

function dealDamage(slot, amount, player, cause) {
  const monster = monsterAt(slot);
  if (!monster) return;
  if (monster.frozenBy && monster.frozenBy !== player.id) {
    addLog(`${player.name}s Angriff mit ${cause} prallt an ${monster.name}s Eis-Schutz ab.`);
    return;
  }
  monster.hp -= amount;
  addLog(`${player.name} fügt ${monster.name} mit ${cause} ${amount} Schaden zu.`);
  if (monster.hp <= 0) killMonster(monster, slot, player, cause);
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
    const due = state.pending.filter((effect) => effect.playerId === player.id && effect.dueRound <= state.round);
    state.pending = state.pending.filter((effect) => !due.includes(effect));
    due.forEach((effect) => {
      const targetSlot = state.field.findIndex((monster) => monster && !monster.empty && monster.id === effect.targetMonsterId);
      if (targetSlot >= 0) dealDamage(targetSlot, effect.damage, player, "Dynamit");
      else addLog(`${player.name}s Dynamit verpufft, weil das Ziel vorher besiegt wurde.`);
    });
    if (attack.weapon === "Dynamit") {
      const target = monsterAt(attack.targets[0]);
      if (target) {
        state.pending.push({ playerId: player.id, targetMonsterId: target.id, damage: 10, dueRound: state.round + 1 });
        addLog(`${player.name} platziert Dynamit an ${target.name}. Es explodiert vor dem nächsten eigenen Angriff.`);
      }
    } else {
      const targets = attack.targets;
      if (attack.weapon === "Gekreuzte Schwerter") {
        const damage = targets.length === 1 ? 4 : 2;
        targets.forEach((slot) => dealDamage(slot, damage, player, attack.weapon));
      } else {
        const slot = targets[0];
        dealDamage(slot, WEAPONS[attack.weapon].damage, player, attack.weapon);
        const monster = monsterAt(slot);
        if (attack.weapon === "Gift" && monster) monster.poison += 1;
        if (attack.weapon === "Eis" && monster) monster.frozenBy = player.id;
      }
    }
    state.field.forEach((monster, slot) => {
      if (monster?.poison > 0) {
        monster.poison -= 1;
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
  const rows = deaths.length ? deaths.map((result) => `<div class="result-item death"><span class="result-copy">${escapeHTML(result.message)}</span><span class="result-tag">MONSTER BESIEGT</span></div>`).join("") : '<div class="result-item"><span class="result-copy">In dieser Runde wurde kein Monster besiegt.</span></div>';
  const content = `<div class="resolve-screen"><p class="eyebrow">Runde ${state.round} · öffentliche Tötungen</p><h2>Wer hat ein Monster besiegt?</h2><div class="result-list">${rows}</div><div class="resolve-actions"><button class="primary-button" type="button" data-action="next-round">Weiter zur nächsten Runde ${icon("arrow")}</button></div></div>`;
  renderGameShell(content, "Kampfergebnis", "Das Schlachtfeld verändert sich", "Angezeigt werden nur besiegte Monster und ihre Sieger.");
}

function nextRound() {
  state.round += 1;
  state.players.forEach((player) => { player.transferUsed = false; });
  state.phase = state.field.some((monster) => monster && !monster.empty) || state.reserve.length ? "transfer" : "ended";
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

function transferPoints(form) {
  const data = new FormData(form);
  const sender = state.players.find((player) => player.id === data.get("from"));
  const receiver = state.players.find((player) => player.id === data.get("to"));
  const amount = Math.floor(Number(data.get("amount")));
  const error = document.querySelector("#transfer-message");
  const fail = (text) => { if (error) error.textContent = text; };
  if (!sender || !receiver || sender.id === receiver.id) return fail("Wähle zwei verschiedene Spieler aus.");
  if (!allianceKey(sender.alliance) || allianceKey(sender.alliance) !== allianceKey(receiver.alliance)) return fail("Punkte können nur innerhalb derselben Allianz übertragen werden.");
  if (sender.transferUsed || receiver.transferUsed) return fail("Jeder Spieler kann pro Runde nur an einem Transfer teilnehmen.");
  if (!Number.isInteger(amount) || amount < 1 || sender.points - amount < 1) return fail("Der abgebende Spieler muss mindestens einen Siegpunkt behalten.");
  sender.points -= amount;
  receiver.points += amount;
  sender.transferUsed = true;
  receiver.transferUsed = true;
  saveGame();
  render();
}

app.addEventListener("input", (event) => {
  if (event.target.matches("[data-player-name]")) draftPlayers[Number(event.target.dataset.playerName)].name = event.target.value;
  if (event.target.matches("[data-player-alliance]")) draftPlayers[Number(event.target.dataset.playerAlliance)].alliance = event.target.value;
});

app.addEventListener("change", (event) => {
  if (event.target.matches("#weapon-choice")) updateAttackHelp();
  if (event.target.matches("#second-target")) {
    const second = event.target.value;
    if (second !== "" && state.field[Number(second)]?.empty) {
      event.target.value = "";
      updateAttackHelp();
      return;
    }
    if (second !== "") {
      const first = selectedTargets()[0];
      if (first !== undefined && Number(second) !== first) {
        const card = document.querySelector(`.attack-form .monster-card[data-index="${Number(second)}"]`);
        if (card && !card.classList.contains("selected")) card.classList.add("selected");
      }
    }
    updateAttackHelp();
  }
});

app.addEventListener("submit", (event) => {
  if (event.target.id === "setup-form") {
    event.preventDefault();
    startGame();
  }
  if (event.target.id === "transfer-form") {
    event.preventDefault();
    transferPoints(event.target);
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
  } else if (action === "show-attack") {
    state.phase = "attack";
    render();
  } else if (action === "select-target") {
    const selected = Number(actionElement.dataset.index);
    const weapon = document.querySelector("#weapon-choice")?.value;
    const cards = [...document.querySelectorAll(".attack-form .monster-card")];
    if (weapon === "Gekreuzte Schwerter" && event.shiftKey) {
      cards[selected]?.classList.toggle("selected");
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