const STORAGE_KEY = "halloween-monster-save-v1";
const MONSTERS = [
  { name: "Mumie", points: 7, loot: ["Gift", "Granate"], color: "#c7a878" },
  { name: "Kürbis", points: 5, loot: ["Gift"], color: "#e58c49" },
  { name: "Geist", points: 9, loot: ["Taler", "Dynamit"], color: "#b7c9c2" },
  { name: "Medusa", points: 15, loot: ["Taler"], color: "#d8aa82" },
  { name: "Vampir", points: 10, loot: ["Granate"], color: "#c36c66" },
  { name: "Baum", points: 9, loot: ["Eis", "Gekreuzte Schwerter"], color: "#a87852" },
  { name: "Sensenmann", points: 16, loot: ["Gekreuzte Schwerter", "Granate", "Taler"], color: "#b6b8a8" },
  { name: "Spinne", points: 7, loot: ["Gift", "Eis"], color: "#a98574" },
  { name: "Teufel", points: 10, loot: ["Eis", "Dynamit"], color: "#dc3b49" },
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
    const treeColor = MONSTERS.find((monster) => monster.name === "Baum").color;
    const devilColor = MONSTERS.find((monster) => monster.name === "Teufel").color;
    [...(saved.field ?? []), ...(saved.reserve ?? [])].forEach((monster) => {
      if (!monster || monster.empty) return;
      if (monster.name === "Baum" && monster.color !== treeColor) {
        monster.color = treeColor;
        migrated = true;
      }
      if (monster.name === "Teufel" && monster.color !== devilColor) {
        monster.color = devilColor;
        migrated = true;
      }
      if (monster.name !== "Vampir" || monster.points === 10) return;
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

function monsterArt(monster) {
  const art = monster.name === "Kürbis" ? `
    <path d="M33 24c-1-6 1-11 6-14 2 5 2 9 0 14l8 3H25l8-3Z" fill="#89966a" stroke="#4d6044" stroke-width="2" stroke-linejoin="round"/>
    <path d="M36 21c-7-4-17-1-22 6-7 10-5 25 3 33 5 5 12 7 19 4 7 3 14 1 19-4 8-8 10-23 3-33-5-7-15-10-22-6Z" fill="currentColor" stroke="#743f26" stroke-width="2" stroke-linejoin="round"/>
    <path d="M36 23c-5 9-5 30 0 40M31 23c-5 9-6 27-2 39m12-39c5 9 6 27 2 39" fill="none" stroke="#ad5e32" stroke-width="2" opacity=".8"/>
    <path d="m18 35 12-2-3 11-4 2-5-5Zm36 0-12-2 3 11 4 2 5-5ZM36 39l-5 10h10l-5-10ZM22 51q7-2 14 2 7-4 14-2-2 6-8 9l-6-3-6 3q-6-3-8-9Z" fill="#171a16" stroke="#542d1d" stroke-width="1.5" stroke-linejoin="round"/>
  ` : monster.name === "Mumie" ? `
    <g fill="currentColor" stroke="#554632" stroke-width="1.6" stroke-linejoin="round">
      <path d="M30 7Q36 4 42 7L43 17 41 22H31L29 17Z"/>
      <path d="m29 23-10-4-5-6-5 1-3 6 5 7 14 7Zm14 0 10-4 5-6 5 1 3 6-5 7-14 7Z"/>
      <path d="M28 22Q36 19 44 22L47 43 42 48H30L25 43Z"/>
      <path d="m29 44 10 2-7 14-3 8-9-3 5-9Zm11 1 8-2 3 15 7 8-8 5-9-8-5-12Z"/>
    </g>
    <g fill="none" stroke="#554632" stroke-width="1.35" stroke-linecap="round">
      <path d="m30 10 12 3m-12 1 12 3m-10 4 8-7M8 18l8 4m-10 1 9 4m-2-13 2 9m39-5-8 4m10 1-9 4m2-13-2 9M28 26l15 5m-17 1 19 6m-17 1 18 5m-14-16 13 13m-18 5 8 5m-11 2 9 5m-7 3 6 3m12-17-7 5m10 1-8 5m10 1-7 4"/>
    </g>
  ` : monster.name === "Geist" ? `
    <path d="M36 7C22 7 15 18 15 32l-9-4C2 34 3 47 8 53l5-9v14l8-3 1 8 8-4 6 9 7-9 8 4 1-8 8 3V44l5 9c5-6 6-19 2-25l-9 4C57 18 50 7 36 7Z" fill="currentColor" stroke="#71817a" stroke-width="2" stroke-linejoin="round"/>
    <path d="M18 30c3-4 8-6 13-3l-1 9c-2 4-8 4-11 1-2-2-2-5-1-7Zm23-3c5-3 10-1 13 3 1 2 1 5-1 7-3 3-9 3-11-1l-1-9Z" fill="#171a16"/>
    <path d="M19 45c2 3 1 7 0 10m34-10c-2 3-1 7 0 10" fill="none" stroke="#9eafa9" stroke-width="1.5" stroke-linecap="round"/>
  ` : monster.name === "Teufel" ? `
    <path d="M44 43c9-5 20-2 21 4 1 4-3 8-8 7l4-5-5-2-5 5-7-2Z" fill="#a91f31" stroke="#171a16" stroke-width="1.8" stroke-linejoin="round"/>
    <path d="M26 22c-6-2-9-7-8-13 5 4 9 4 13 5Zm20 0c6-2 9-7 8-13-5 4-9 4-13 5Z" fill="#c72d3c" stroke="#171a16" stroke-width="1.8" stroke-linejoin="round"/>
    <path d="M29 39c-6 2-9 7-10 14l-5 13h44l-5-13c-1-7-4-12-10-14l-7 6Z" fill="#dc3b49" stroke="#171a16" stroke-width="2" stroke-linejoin="round"/>
    <path d="m25 57-5 9h12l4-10 4 10h12l-5-9Z" fill="#b82435" stroke="#171a16" stroke-width="1.5" stroke-linejoin="round"/>
    <path d="M36 17c-8 0-13 6-12 14 1 7 5 11 12 14 7-3 11-7 12-14 1-8-4-14-12-14Z" fill="#ed4650" stroke="#171a16" stroke-width="2" stroke-linejoin="round"/>
    <path d="M28 29q4-4 8 0-4 5-8 0Zm8 0q4-4 8 0-4 5-8 0Z" fill="#171a16"/>
    <path d="M31 36q5-3 10 0l-2 5h-6Z" fill="#171a16"/>
    <path d="m32 36 2 5 2-5Zm5 0 2 5 2-5Z" fill="#f1e7cf" stroke="#171a16" stroke-width=".7" stroke-linejoin="round"/>
    <path d="M16 24v42" fill="none" stroke="#171a16" stroke-width="4" stroke-linecap="round"/>
    <path d="M16 25v40" fill="none" stroke="#c59a4e" stroke-width="1.6" stroke-linecap="round"/>
    <path d="M7 25V11l6 9 3-15 3 15 6-9v14" fill="none" stroke="#171a16" stroke-width="3.2" stroke-linecap="round" stroke-linejoin="round"/>
    <path d="M8 23V13l5 8 3-12 3 12 5-8v10" fill="none" stroke="#d4b263" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"/>
  ` : monster.name === "Spinne" ? `
    <g fill="none" stroke="#d7d9d2" stroke-width=".8" opacity=".65">
      <path d="M36 7v58M7 36h58M15 15l42 42M57 15 15 57M22 9l28 54M9 22l54 28M50 9 22 63M9 50l54-28"/>
      <path d="M25 17q11 8 22 0M17 25q8 11 0 22m30-30q-11 8-22 0m30 8q-8 11 0 22M17 47q11-8 22 0m8 8q-11-8-22 0M55 47q-11-8-22 0m-8 8q11-8 22 0"/>
    </g>
    <g class="spider-legs" fill="none" stroke="#241a22" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round">
      <path d="M30 30 23 24 18 15 10 11"/>
      <path d="M29 34 19 31 12 24 5 25"/>
      <path d="M29 39 19 41 12 47 5 47"/>
      <path d="M31 43 23 49 20 58 13 63"/>
      <path d="M42 30 49 24 54 15 62 11"/>
      <path d="M43 34 53 31 60 24 67 25"/>
      <path d="M43 39 53 41 60 47 67 47"/>
      <path d="M41 43 49 49 52 58 59 63"/>
    </g>
    <ellipse cx="36" cy="42" rx="8" ry="11" fill="#44313c" stroke="#171a16" stroke-width="2"/>
    <ellipse cx="36" cy="29" rx="7" ry="8" fill="#352631" stroke="#171a16" stroke-width="2"/>
    <path d="M32 42q4-4 8 0l-4 6Z" fill="#bd3047"/>
    <circle cx="33" cy="27" r="1.7" fill="#f1e7cf"/><circle cx="39" cy="27" r="1.7" fill="#f1e7cf"/>
  ` : monster.name === "Sensenmann" ? `
    <path d="M15 22C21 11 39 5 60 6 47 11 36 17 28 28l-9 11c2-8 1-13-4-17Z" fill="#e1e5e7" stroke="#171a16" stroke-width="2" stroke-linejoin="round"/>
    <path d="M15 21 24 67" fill="none" stroke="#171a16" stroke-width="5" stroke-linecap="round"/>
    <path d="M15 21 24 67" fill="none" stroke="#a16b45" stroke-width="2.5" stroke-linecap="round"/>
    <path d="M29 40c-7 2-11 8-12 18L10 68h52l-7-10c-1-10-5-16-12-18L36 49Z" fill="#383844" stroke="#171a16" stroke-width="2" stroke-linejoin="round"/>
    <path d="M28 43 24 63m20-20 4 20" fill="none" stroke="#555562" stroke-width="1.5" stroke-linecap="round"/>
    <path d="M36 10c-11 0-17 8-16 19 1 10 7 17 16 22 9-5 15-12 16-22 1-11-5-19-16-19Z" fill="#292a35" stroke="#171a16" stroke-width="2.5" stroke-linejoin="round"/>
    <path d="M36 17c-7 0-11 5-10 12l1 7c0 3 2 5 5 6v5h8v-5c3-1 5-3 5-6l1-7c1-7-3-12-10-12Z" fill="#f1e7cf" stroke="#171a16" stroke-width="1.5" stroke-linejoin="round"/>
    <circle cx="31" cy="29" r="3.5" fill="#171a16"/><circle cx="41" cy="29" r="3.5" fill="#171a16"/>
    <path d="m36 32-3 5h6l-3-5Z" fill="#171a16"/>
    <path d="M31 41h10v4H31Z" fill="#171a16"/>
    <path d="M34 41v4m3-4v4m3-4v4" stroke="#f1e7cf" stroke-width="1"/>
  ` : monster.name === "Baum" ? `
    <g fill="none" stroke="#40291c" stroke-width="5" stroke-linecap="round" stroke-linejoin="round">
      <path d="M33 37C28 29 28 21 29 13m-2 11-8-5-4-8m6 7-9 1m14-9-5-7M39 36c5-8 7-16 8-25m-4 14 10-7 3-8m-5 7 10 1m-15-7 5-7M31 40c-8-4-14-9-18-16m9 12-11-1-7-5m12 2-4-8M42 40c8-4 14-9 18-16m-9 12 11-1 7-5m-12 2 4-8M29 46c-8-1-14-4-19-9m8 6-11 2M43 46c8-1 14-4 19-9m-8 6 11 2"/>
    </g>
    <path d="M25 69c3-8 2-13 0-18-2-6 0-11 4-16-2-6-2-12 1-19h12c3 7 3 13 1 19 4 5 6 10 4 16-2 5-3 10 0 18l-8-4-3 5-5-5Z" fill="#4b3427" stroke="#40291c" stroke-width="2" stroke-linejoin="round"/>
    <g fill="none" stroke="#916844" stroke-width="1.6" stroke-linecap="round">
      <path d="M34 51c-1-6 1-10 2-14m2 17c1 4 0 8 2 12m-9-18-4-5m14 5 4-5M31 63l-9 6m18-6 10 6"/>
    </g>
    <path d="M27 42q5-5 9 0l-2 5h-6Zm9 0q5-5 9 0l-1 5h-6Z" fill="#f1e7cf" stroke="#40291c" stroke-width="1.5" stroke-linejoin="round"/>
    <path d="M29 51h14l-2 7-3-3-2 4-3-4-2 3Z" fill="#f1e7cf" stroke="#40291c" stroke-width="1.5" stroke-linejoin="round"/>
  ` : monster.name === "Vampir" ? `
    <path d="M23 43 12 46 5 55l15-3 16 10 16-10 15 3-7-9-11-3Z" fill="#ad2634" stroke="#171a16" stroke-width="2" stroke-linejoin="round"/>
    <path d="m24 42-8 3 10 11 10-6 10 6 10-11-8-3-12 7Z" fill="#781c2a" stroke="#171a16" stroke-width="1.5" stroke-linejoin="round"/>
    <path d="M22 28 16 25l2 13 7 2Zm28 0 6-3-2 13-7 2Z" fill="#efd5c4" stroke="#171a16" stroke-width="1.5" stroke-linejoin="round"/>
    <path d="M22 24c3-8 10-12 17-11 10 1 15 8 12 19l-2 10c-2 8-7 13-13 16-7-3-12-8-14-16l-2-9Z" fill="#efd5c4" stroke="#171a16" stroke-width="2" stroke-linejoin="round"/>
    <path d="M19 31c-2-12 6-21 17-21 12 0 19 9 16 21l-7-8-4 5-5-7-5 7-5-5Z" fill="#171a16" stroke="#171a16" stroke-width="2" stroke-linejoin="round"/>
    <path d="M25 36q5-4 10 0-5 5-10 0Zm12 0q5-4 10 0-5 5-10 0Z" fill="#fff1e8" stroke="#171a16" stroke-width="1.2"/>
    <circle cx="30" cy="36" r="2" fill="#bd3047"/><circle cx="42" cy="36" r="2" fill="#bd3047"/>
    <path d="m34 38-2 5h5l-3-5Z" fill="#d09c88"/>
    <path d="M28 46q8-4 16 0v4q-8 7-16 0Z" fill="#171a16"/>
    <path d="m30 46 3 7 2-7Zm10 0 2 7 3-7Z" fill="#fff1e8" stroke="#171a16" stroke-width=".8" stroke-linejoin="round"/>
    <path d="M25 33q5-3 10 0m2 0q5-3 10 0" fill="none" stroke="#171a16" stroke-width="1.8" stroke-linecap="round"/>
  ` : monster.name === "Medusa" ? `
    <g fill="none" stroke="#171a16" stroke-width="7" stroke-linecap="round" stroke-linejoin="round">
      <path d="M23 31C13 29 8 22 10 15c1-5 7-7 10-3 2 3 0 7-4 7m12 8C22 17 24 6 31 5c6-1 8 6 3 10m6 12C47 14 53 7 59 10c5 3 3 9-2 11m-8 10c10-2 16-8 14-15-1-5-6-6-9-3M20 40C9 37 6 45 11 51c3 4 8 2 9-2m32-9c11-3 14 5 9 11-3 4-8 2-9-2"/>
    </g>
    <g fill="none" stroke="#78c83f" stroke-width="4" stroke-linecap="round" stroke-linejoin="round">
      <path d="M23 31C13 29 8 22 10 15c1-5 7-7 10-3 2 3 0 7-4 7m12 8C22 17 24 6 31 5c6-1 8 6 3 10m6 12C47 14 53 7 59 10c5 3 3 9-2 11m-8 10c10-2 16-8 14-15-1-5-6-6-9-3M20 40C9 37 6 45 11 51c3 4 8 2 9-2m32-9c11-3 14 5 9 11-3 4-8 2-9-2"/>
    </g>
    <g fill="#78c83f" stroke="#171a16" stroke-width="1.5" stroke-linejoin="round">
      <path d="M16 20c-4 0-7-3-6-6 1-4 6-5 9-2l3 4-3 4Z"/>
      <path d="M31 11c-3-2-4-6-1-9 3-3 8-1 8 3l-1 5-4 3Z"/>
      <path d="M56 18c0-4 3-7 7-6 4 1 5 6 2 9l-4 2-4-3Z"/>
      <path d="M12 48c-3-2-3-6 0-8 3-2 7 0 7 4l-2 4-4 2Z"/>
      <path d="M57 48c3-2 3-6 0-8-3-2-7 0-7 4l2 4 4 2Z"/>
    </g>
    <g fill="#171a16"><circle cx="15" cy="15" r="1"/><circle cx="34" cy="6" r="1"/><circle cx="61" cy="15" r="1"/><circle cx="15" cy="43" r="1"/><circle cx="57" cy="43" r="1"/></g>
    <path d="M18 29c2-7 9-11 18-11s16 4 18 11l-3 18c-2 9-8 16-15 20-7-4-13-11-15-20Z" fill="#d8aa82" stroke="#171a16" stroke-width="2" stroke-linejoin="round"/>
    <path d="M23 37q6-5 12 0-6 6-12 0Zm14 0q6-5 12 0-6 6-12 0Z" fill="#f3eddb" stroke="#171a16" stroke-width="1.2"/>
    <ellipse cx="29" cy="37" rx="2" ry="3" fill="#d6a52f"/><ellipse cx="43" cy="37" rx="2" ry="3" fill="#d6a52f"/>
    <circle cx="29" cy="37" r="1" fill="#171a16"/><circle cx="43" cy="37" r="1" fill="#171a16"/>
    <path d="M24 33q5-3 10 0m4 0q5-3 10 0M36 40l-2 6h4l-2-6Zm-4 11q4-2 8 0" fill="none" stroke="#171a16" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"/>
    <path d="M32 52q4-2 8 0l-4 3Z" fill="#80524a" stroke="#171a16" stroke-width="1"/>
  ` : monster.name === "Frankenstein" ? `
    <rect x="7" y="35" width="17" height="7" rx="2" fill="#929a9d" stroke="#171a16" stroke-width="1.8"/>
    <rect x="48" y="35" width="17" height="7" rx="2" fill="#929a9d" stroke="#171a16" stroke-width="1.8"/>
    <path d="M12 36v5m4-5v5m40-5v5m4-5v5" stroke="#34363a" stroke-width="1.5"/>
    <circle cx="20" cy="38.5" r="5" fill="#82bd3e" stroke="#171a16" stroke-width="1.5"/>
    <circle cx="52" cy="38.5" r="5" fill="#82bd3e" stroke="#171a16" stroke-width="1.5"/>
    <path d="M20 18 19 29l2 22 2 8q13 5 26 0l2-8 2-22-1-11Z" fill="#82bd3e" stroke="#171a16" stroke-width="2" stroke-linejoin="round"/>
    <path d="M18 20V7h37v13l-5-3-5 5-6-5-6 5-6-5-5 5Z" fill="#171a16"/>
    <path d="M24 24l4 2 4-3 4 3 4-3 4 3" fill="none" stroke="#743542" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
    <path d="m25 26 2 3m5-6 2 3m6-3 2 3m4-2 2 3" stroke="#171a16" stroke-width="1.3" stroke-linecap="round"/>
    <path d="M23 34q6-5 12 0-6 8-12 0Zm14 0q6-5 12 0-6 8-12 0Z" fill="#f3eddb" stroke="#171a16" stroke-width="1.5"/>
    <circle cx="29" cy="34" r="2" fill="#171a16"/><circle cx="43" cy="34" r="2" fill="#171a16"/>
    <path d="M27 47h18l-2 6H29Z" fill="#171a16"/>
    <path d="M31 47v5m5-5v5m5-5v5" stroke="#f3eddb" stroke-width="1.3"/>
  ` : monster.name === "Hexe" ? `
    <circle cx="36" cy="36" r="29" fill="#ef8a24" stroke="#171a16" stroke-width="1.5"/>
    <circle cx="36" cy="36" r="25" fill="none" stroke="#ffbd4b" stroke-width="1" opacity=".8"/>
    <g fill="none" stroke-linecap="round" stroke-linejoin="round">
      <path d="M10 56 63 46" stroke="#171a16" stroke-width="4.5"/>
      <path d="M11 55 62 46" stroke="#a87852" stroke-width="1.5"/>
    </g>
    <path d="M12 54 7 50l3 7-6-2 5 6-5 2 8 1 7-6-1-5Z" fill="#211b25" stroke="#171a16" stroke-width="1.3" stroke-linejoin="round"/>
    <path d="M31 34c-7 3-10 9-9 15l-8 6 16-1 8-7 10 5 12-6-9-5-2-8-10-3-5 5Z" fill="#211b25" stroke="#171a16" stroke-width="1.8" stroke-linejoin="round"/>
    <path d="m32 43-7 9-7 3 3 3 11-4 8-8m2-4 8 8 7 2-2 4-10-2-11-8Z" fill="#211b25" stroke="#171a16" stroke-width="1.5" stroke-linejoin="round"/>
    <path d="M32 20c-6 0-9 5-7 10l5 6 8-1 3-5 7-3-8-2c-1-3-3-5-8-5Z" fill="#211b25" stroke="#171a16" stroke-width="1.5" stroke-linejoin="round"/>
    <path d="M14 25q21-8 45-1l-1 4q-23-5-43 2Zm12-3 6-14 13-4-5 10 12 8-7 2Z" fill="#171a16" stroke="#171a16" stroke-width="1.5" stroke-linejoin="round"/>
    <path d="M25 26 19 35l7-4m17-4 5 8-6-3" fill="none" stroke="#211b25" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
  ` : monster.name === "Werwolf" ? `
    <circle cx="36" cy="34" r="29" fill="#e7e4dc" stroke="#c7c8c5" stroke-width="1.5"/>
    <circle cx="22" cy="22" r="4" fill="#d5d4d0"/><circle cx="49" cy="16" r="3" fill="#d5d4d0"/><circle cx="52" cy="43" r="5" fill="#d5d4d0"/><circle cx="24" cy="47" r="2.5" fill="#d5d4d0"/>
    <path d="M25 38c-7-5-13-7-18-5 4 1 6 4 7 7-5-2-8-2-11 0 6 1 10 4 14 8l11 2Z" fill="#171a16" stroke="#171a16" stroke-width="1.5" stroke-linejoin="round"/>
    <path d="M23 36c4-7 11-10 19-8l5 7 7 8 8 6-3 4-12-4-5-6-3 10 6 10h-7l-6-8-4-9-5 9-8 4-4-3 8-9-2-7Z" fill="#171a16" stroke="#171a16" stroke-width="1.5" stroke-linejoin="round"/>
    <path d="M40 29c-3-4-4-8-2-12l-1-9 7 5 4-10 3 12 8-3-4 8 5 4-8 3-4 8Z" fill="#171a16" stroke="#171a16" stroke-width="1.5" stroke-linejoin="round"/>
    <path d="M49 23q5-4 10-2l-4 4-5 1Z" fill="#e7e4dc"/>
    <circle cx="48" cy="22" r="1.4" fill="#d6a52f"/>
    <path d="M45 50 51 53m-23 3-6 2m22 4 4 1" fill="none" stroke="#e7e4dc" stroke-width="1.2" stroke-linecap="round"/>
  ` : `
    <path d="M13 27 8 12l15 8c8-5 18-5 26 0l15-8-5 18c4 8 3 19-3 26-5 6-13 9-21 9s-16-3-21-9c-6-7-7-19-1-29Z"/>
    <path d="M23 37c3-4 8-4 11 0v10c-4 4-8 4-11 0Zm15 0c3-4 8-4 11 0v10c-4 4-8 4-11 0Z" fill="#171a16"/>
    <path d="m31 53 5 7 5-7" fill="#f3eddb"/>
  `;
  return `<svg viewBox="0 0 72 72" role="img" aria-label="${escapeHTML(monster.name)}" style="color:${escapeHTML(monster.color)}">${art}</svg>`;
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
          <div class="preview-monsters">${sample.map((monster) => `<div class="preview-monster" style="--art-color:${monster.color}"><span class="preview-art">${monsterArt(monster)}</span><span><strong>${monster.name}</strong><small>Beute: ${monster.loot.join(", ")}</small></span><span class="preview-hp">${monster.points} ♥</span></div>`).join("")}</div>
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
      <span class="next-reserve-art">${monsterArt(monster)}</span>
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
    <div class="monster-art">${monsterArt(monster)}</div>
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