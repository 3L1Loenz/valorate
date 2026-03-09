const API_URL = window.location.origin;
let allPlayers = [];
let selectedIndex = -1;
let currentMatches = [];
function getLoggedInPlayer() {
  const saved = localStorage.getItem("valorateLoggedInPlayer");
  return saved ? JSON.parse(saved) : null;
}

function setLoggedInPlayer(player) {
  localStorage.setItem("valorateLoggedInPlayer", JSON.stringify(player));
}

function toggleUserMenu() {
  const dropdown = document.getElementById("userDropdown");

  if (dropdown.style.display === "block") {
    dropdown.style.display = "none";
  } else {
    dropdown.style.display = "block";
  }
}
function toggleUserMenu() {
  const dropdown = document.getElementById("userDropdown");

  if (dropdown.style.display === "block") {
    dropdown.style.display = "none";
  } else {
    dropdown.style.display = "block";
  }
}

function parseRiotId(riotId) {
  if (!riotId.includes("#")) return null;

  const [name, tag] = riotId.split("#");
  if (!name || !tag) return null;

  return {
    name: name.trim(),
    tag: tag.trim()
  };
}

function getTopAgent(stats) {
  return [...stats].sort((a, b) => a.worldRank - b.worldRank)[0];
}

function getAverageWinRate(stats) {
  return (stats.reduce((sum, item) => sum + item.winRate, 0) / stats.length).toFixed(1);
}

function getAverageKda(stats) {
  return (stats.reduce((sum, item) => sum + item.kda, 0) / stats.length).toFixed(2);
}

function getTotalMatches(stats) {
  return stats.reduce((sum, item) => sum + item.matches, 0);
}

function buildGlobalRankingList() {
  return allPlayers.map((player) => {
    const topAgent = getTopAgent(player.stats);

    return {
      name: player.name,
      tag: player.tag,
      region: player.region,
      rank: player.rank,
      bestAgent: topAgent.agent,
      avgWinRate: Number(getAverageWinRate(player.stats)),
      avgKda: Number(getAverageKda(player.stats)),
      totalMatches: getTotalMatches(player.stats)
    };
  }).sort((a, b) => b.avgWinRate - a.avgWinRate);
}

function findPlayerGlobalPosition(name, tag) {
  const ranking = buildGlobalRankingList();
  return ranking.findIndex(
    (item) =>
      item.name.toLowerCase() === name.toLowerCase() &&
      item.tag.toLowerCase() === tag.toLowerCase()
  ) + 1;
}

function loginPlayer() {
  const input = document.getElementById("loginRiotId");
  if (!input) return;

  const riotId = input.value.trim();
  const parsed = parseRiotId(riotId);

  if (!parsed) {
    alert("Please enter Riot ID in this format: Name#TAG");
    return;
  }

  const player = allPlayers.find(
    (item) =>
      item.name.toLowerCase() === parsed.name.toLowerCase() &&
      item.tag.toLowerCase() === parsed.tag.toLowerCase()
  );

  if (!player) {
    alert("Player not found.");
    return;
  }

  setLoggedInPlayer(player);
  renderLoggedInPlayer();
}

function renderLoggedInPlayer() {
  const authState = document.getElementById("authState");
  const loggedInState = document.getElementById("loggedInState");
  const myRankPanel = document.getElementById("myRankPanel");

  if (!authState || !loggedInState) return;

  const player = getLoggedInPlayer();

  if (!player) {
    authState.style.display = "block";
    loggedInState.style.display = "none";
    loggedInState.innerHTML = "";
    return;
    // LOGIN OLDU
myRankPanel.style.display = "none";

const userMenu = document.getElementById("userMenu");
const userMenuName = document.getElementById("userMenuName");
const userProfileLink = document.getElementById("userProfileLink");

if (userMenu) {
  userMenu.style.display = "block";
}

if (userMenuName) {
  userMenuName.textContent = `${player.name}#${player.tag}`;
}

if (userProfileLink) {
  userProfileLink.href =
    `player.html?name=${encodeURIComponent(player.name)}&tag=${encodeURIComponent(player.tag)}`;
}
  }
  myRankPanel.style.display = "none";

  const bestAgent = getTopAgent(player.stats);
  const avgWinRate = getAverageWinRate(player.stats);
  const avgKda = getAverageKda(player.stats);
  const totalMatches = getTotalMatches(player.stats);
  const globalPosition = findPlayerGlobalPosition(player.name, player.tag);

  authState.style.display = "none";
  loggedInState.style.display = "block";

  loggedInState.innerHTML = `
    <div class="my-rank-card">
      <div class="my-rank-header">
        <div>
          <h2>${player.name}#${player.tag}</h2>
          <p>
  ${player.region} •
  <span class="rank-pill ${getRankClass(player.rank)}">${player.rank}</span>
</p>
        </div>

        <div class="my-rank-actions">
          <a class="profile-btn" href="player.html?name=${encodeURIComponent(player.name)}&tag=${encodeURIComponent(player.tag)}">
            Open My Profile
          </a>
          <button class="logout-btn" onclick="logoutPlayer()">Logout</button>
        </div>
      </div>

      <div class="my-rank-stats">
        <div class="my-rank-mini-card">
          <span>Global Position</span>
          <strong>#${globalPosition}</strong>
        </div>

        <div class="my-rank-mini-card">
          <span>Best Agent</span>
          <strong>${bestAgent.agent}</strong>
        </div>

        <div class="my-rank-mini-card">
          <span>Avg Win Rate</span>
          <strong>${avgWinRate}%</strong>
        </div>

        <div class="my-rank-mini-card">
          <span>Avg KDA</span>
          <strong>${avgKda}</strong>
        </div>

        <div class="my-rank-mini-card">
          <span>Total Matches</span>
          <strong>${totalMatches}</strong>
        </div>
      </div>
    </div>
  `;
}

function getAgentImage(agentName) {
  return `images/agents/${agentName.toLowerCase()}.png`;
}
function getRankClass(rank) {
  if (!rank) return "";

  const normalized = rank.toLowerCase().trim();

  if (normalized.includes("iron")) return "rank-iron";
  if (normalized.includes("bronze")) return "rank-bronze";
  if (normalized.includes("silver")) return "rank-silver";
  if (normalized.includes("gold")) return "rank-gold";
  if (normalized.includes("platinum")) return "rank-platinum";
  if (normalized.includes("diamond")) return "rank-diamond";
  if (normalized.includes("ascendant")) return "rank-ascendant";
  if (normalized.includes("immortal")) return "rank-immortal";
  if (normalized.includes("radiant")) return "rank-radiant";

  return "";
}

function getRecentSearches() {
  const saved = localStorage.getItem("valorateRecentSearches");
  return saved ? JSON.parse(saved) : [];
}

function saveRecentSearch(riotId) {
  let recent = getRecentSearches();

  recent = recent.filter((item) => item.toLowerCase() !== riotId.toLowerCase());
  recent.unshift(riotId);

  if (recent.length > 5) {
    recent = recent.slice(0, 5);
  }

  localStorage.setItem("valorateRecentSearches", JSON.stringify(recent));
}

function renderRecentSearches() {
  const list = document.getElementById("recentSearchesList");
  const box = document.getElementById("recentSearchesBox");

  if (!list || !box) return;

  const recent = getRecentSearches();

  if (!recent.length) {
    box.style.display = "none";
    list.innerHTML = "";
    return;
  }

  box.style.display = "block";

  list.innerHTML = recent.map((riotId) => {
    const [name, tag] = riotId.split("#");
    return `
      <a class="recent-search-item" href="player.html?name=${encodeURIComponent(name)}&tag=${encodeURIComponent(tag || "")}">
        ${riotId}
      </a>
    `;
  }).join("");
}

async function loadPlayers() {
  try {
    const response = await fetch(`${API_URL}/players`);
    allPlayers = await response.json();
  } catch (error) {
    console.error("Failed to load players:", error);
  }
}

function renderAutocomplete(query) {
  const box = document.getElementById("autocompleteBox");
  if (!box) return;

  const trimmed = query.trim().toLowerCase();

  if (!trimmed) {
    box.innerHTML = "";
    box.style.display = "none";
    currentMatches = [];
    selectedIndex = -1;
    return;
  }

  currentMatches = allPlayers
    .filter((player) =>
      `${player.name}#${player.tag}`.toLowerCase().includes(trimmed)
    )
    .slice(0, 6);

  if (!currentMatches.length) {
    box.innerHTML = "";
    box.style.display = "none";
    selectedIndex = -1;
    return;
  }

  selectedIndex = -1;
  box.style.display = "block";

  box.innerHTML = currentMatches.map((player, index) => `
    <div class="autocomplete-item" data-index="${index}">
      <div class="autocomplete-row">
        <strong>${player.name}#${player.tag}</strong>
        <span class="autocomplete-rank">${player.rank}</span>
      </div>
      <small>${player.region} • Best Agent: ${player.bestAgent}</small>
    </div>
  `).join("");

  document.querySelectorAll(".autocomplete-item").forEach((item) => {
    item.addEventListener("click", () => {
      const index = Number(item.dataset.index);
      selectPlayer(currentMatches[index]);
    });
  });
}

function selectPlayer(player) {
  if (!player) return;

  const input = document.getElementById("playerInput");
  const box = document.getElementById("autocompleteBox");

  if (input) {
    input.value = `${player.name}#${player.tag}`;
  }

  if (box) {
    box.innerHTML = "";
    box.style.display = "none";
  }

  saveRecentSearch(`${player.name}#${player.tag}`);
  renderRecentSearches();

  window.location.href = `player.html?name=${encodeURIComponent(player.name)}&tag=${encodeURIComponent(player.tag)}`;
}

function updateSelection(items) {
  items.forEach((item) => item.classList.remove("autocomplete-selected"));

  if (selectedIndex >= 0 && items[selectedIndex]) {
    items[selectedIndex].classList.add("autocomplete-selected");
  }
}

async function loadAgents() {
  const agentsList = document.getElementById("agentsList");
  if (!agentsList) return;

  try {
    const response = await fetch(`${API_URL}/agents`);
    const agents = await response.json();

    agentsList.innerHTML = "";

    for (const agent of agents) {
      let bestPlayerText = "No data";

      try {
        const res = await fetch(`${API_URL}/leaderboard/${encodeURIComponent(agent.name)}`);
        const leaderboard = await res.json();

        if (leaderboard.length > 0) {
          const best = leaderboard.sort((a, b) => a.rank - b.rank)[0];
          bestPlayerText = `${best.player}${best.tag ? `#${best.tag}` : ""}`;
        }
      } catch (err) {
        console.log("Leaderboard load failed for", agent.name);
      }

      const div = document.createElement("div");
      div.className = "agent-card";

      div.innerHTML = `
        <img src="${getAgentImage(agent.name)}" alt="${agent.name}" class="agent-image" />
        <h3>${agent.name}</h3>
        <p class="agent-best-player">Best Player: ${bestPlayerText}</p>
      `;

      div.onclick = () => {
        window.location.href = `agent-leaderboard.html?agent=${encodeURIComponent(agent.name)}`;
      };

      agentsList.appendChild(div);
    }
  } catch (error) {
    console.error("Failed to load agents:", error);
  }
}

function searchPlayer() {
  const input = document.getElementById("playerInput");
  if (!input) return;

  const riotId = input.value.trim();

  if (!riotId) return;

  if (!riotId.includes("#")) {
    alert("Please enter Riot ID in this format: Name#TAG");
    return;
  }

  const parts = riotId.split("#");
  const name = parts[0].trim();
  const tag = parts[1].trim();

  if (!name || !tag) {
    alert("Please enter a valid Riot ID like Ace#EU1");
    return;
  }

  saveRecentSearch(`${name}#${tag}`);
  renderRecentSearches();

  window.location.href = `player.html?name=${encodeURIComponent(name)}&tag=${encodeURIComponent(tag)}`;
}

function setupAutocomplete() {
  const input = document.getElementById("playerInput");
  const box = document.getElementById("autocompleteBox");

  if (!input || !box) return;

  input.addEventListener("input", (e) => {
    renderAutocomplete(e.target.value);
  });

  input.addEventListener("keydown", (e) => {
    const items = document.querySelectorAll(".autocomplete-item");

    if (box.style.display !== "block" || !items.length) {
      if (e.key === "Enter") {
        searchPlayer();
        e.preventDefault();
      }
      return;
    }

    if (e.key === "ArrowDown") {
      selectedIndex++;
      if (selectedIndex >= items.length) selectedIndex = 0;
      updateSelection(items);
      e.preventDefault();
    }

    if (e.key === "ArrowUp") {
      selectedIndex--;
      if (selectedIndex < 0) selectedIndex = items.length - 1;
      updateSelection(items);
      e.preventDefault();
    }

    if (e.key === "Enter") {
      if (selectedIndex >= 0 && currentMatches[selectedIndex]) {
        selectPlayer(currentMatches[selectedIndex]);
      } else {
        searchPlayer();
      }
      e.preventDefault();
    }

    if (e.key === "Escape") {
      box.innerHTML = "";
      box.style.display = "none";
      selectedIndex = -1;
    }
  });

  document.addEventListener("click", (e) => {
    if (!box.contains(e.target) && e.target !== input) {
      box.innerHTML = "";
      box.style.display = "none";
      selectedIndex = -1;
    }
  });
}

function getLoggedInPlayer() {
  const saved = localStorage.getItem("valorateLoggedInPlayer");
  return saved ? JSON.parse(saved) : null;
}

function setLoggedInPlayer(player) {
  localStorage.setItem("valorateLoggedInPlayer", JSON.stringify(player));
}

function logoutPlayer() {
  localStorage.removeItem("valorateLoggedInPlayer");
  renderLoggedInPlayer();
}

function parseRiotId(riotId) {
  if (!riotId.includes("#")) return null;

  const [name, tag] = riotId.split("#");
  if (!name || !tag) return null;

  return {
    name: name.trim(),
    tag: tag.trim()
  };
}

function getTopAgent(stats) {
  return [...stats].sort((a, b) => a.worldRank - b.worldRank)[0];
}

function getAverageWinRate(stats) {
  return (stats.reduce((sum, item) => sum + item.winRate, 0) / stats.length).toFixed(1);
}

function getAverageKda(stats) {
  return (stats.reduce((sum, item) => sum + item.kda, 0) / stats.length).toFixed(2);
}

function getTotalMatches(stats) {
  return stats.reduce((sum, item) => sum + item.matches, 0);
}

function buildGlobalRankingList() {
  return allPlayers.map((player) => {
    const topAgent = getTopAgent(player.stats);

    return {
      name: player.name,
      tag: player.tag,
      region: player.region,
      rank: player.rank,
      bestAgent: topAgent.agent,
      avgWinRate: Number(getAverageWinRate(player.stats)),
      avgKda: Number(getAverageKda(player.stats)),
      totalMatches: getTotalMatches(player.stats)
    };
  }).sort((a, b) => b.avgWinRate - a.avgWinRate);
}

function findPlayerGlobalPosition(name, tag) {
  const ranking = buildGlobalRankingList();
  return ranking.findIndex(
    (item) =>
      item.name.toLowerCase() === name.toLowerCase() &&
      item.tag.toLowerCase() === tag.toLowerCase()
  ) + 1;
}
function getRankClass(rank) {
  if (!rank) return "";

  const normalized = rank.toLowerCase().trim();

  if (normalized.includes("iron")) return "rank-iron";
  if (normalized.includes("bronze")) return "rank-bronze";
  if (normalized.includes("silver")) return "rank-silver";
  if (normalized.includes("gold")) return "rank-gold";
  if (normalized.includes("platinum")) return "rank-platinum";
  if (normalized.includes("diamond")) return "rank-diamond";
  if (normalized.includes("ascendant")) return "rank-ascendant";
  if (normalized.includes("immortal")) return "rank-immortal";
  if (normalized.includes("radiant")) return "rank-radiant";

  return "";
}

function loginPlayer() {
  const input = document.getElementById("loginRiotId");
  if (!input) return;

  const riotId = input.value.trim();
  const parsed = parseRiotId(riotId);

  if (!parsed) {
    alert("Please enter Riot ID in this format: Name#TAG");
    return;
  }

  const player = allPlayers.find(
    (item) =>
      item.name.toLowerCase() === parsed.name.toLowerCase() &&
      item.tag.toLowerCase() === parsed.tag.toLowerCase()
  );

  if (!player) {
    alert("Player not found.");
    return;
  }

  setLoggedInPlayer(player);
  renderLoggedInPlayer();
}

function renderLoggedInPlayer() {
  const authState = document.getElementById("authState");
  const loggedInState = document.getElementById("loggedInState");

  if (!authState || !loggedInState) return;

  const player = getLoggedInPlayer();

  if (!player) {
    authState.style.display = "block";
    loggedInState.style.display = "none";
    loggedInState.innerHTML = "";
    return;
  }

  const bestAgent = getTopAgent(player.stats);
  const avgWinRate = getAverageWinRate(player.stats);
  const avgKda = getAverageKda(player.stats);
  const totalMatches = getTotalMatches(player.stats);
  const globalPosition = findPlayerGlobalPosition(player.name, player.tag);

  authState.style.display = "none";
  loggedInState.style.display = "block";

  loggedInState.innerHTML = `
    <div class="my-rank-card">
      <div class="my-rank-header">
        <div>
          <h2>${player.name}#${player.tag}</h2>
          <p>
  ${player.region} •
  <span class="rank-pill ${getRankClass(player.rank)}">${player.rank}</span>
</p>
        </div>

        <div class="my-rank-actions">
          <a class="profile-btn" href="player.html?name=${encodeURIComponent(player.name)}&tag=${encodeURIComponent(player.tag)}">
            Open My Profile
          </a>
          <button class="logout-btn" onclick="logoutPlayer()">Logout</button>
        </div>
      </div>

      <div class="my-rank-stats">
        <div class="my-rank-mini-card">
          <span>Global Position</span>
          <strong>#${globalPosition}</strong>
        </div>

        <div class="my-rank-mini-card">
          <span>Best Agent</span>
          <strong>${bestAgent.agent}</strong>
        </div>

        <div class="my-rank-mini-card">
          <span>Avg Win Rate</span>
          <strong>${avgWinRate}%</strong>
        </div>

        <div class="my-rank-mini-card">
          <span>Avg KDA</span>
          <strong>${avgKda}</strong>
        </div>

        <div class="my-rank-mini-card">
          <span>Total Matches</span>
          <strong>${totalMatches}</strong>
        </div>
      </div>
    </div>
  `;
}

async function initApp() {
  await loadPlayers();
  await loadAgents();
  renderRecentSearches();
  setupAutocomplete();
  renderLoggedInPlayer();
}

initApp();