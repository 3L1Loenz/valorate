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
  const riotIdInput = document.getElementById("loginRiotId");
  const regionInput = document.getElementById("loginRegion");

  const riotId = riotIdInput?.value.trim();
  const region = regionInput?.value || "eu";

  if (!riotId) {
    alert("Please enter Riot ID like TenZ#NA1");
    return;
  }

  if (!riotId.includes("#")) {
    alert("Please enter Riot ID in this format: Name#TAG");
    return;
  }

  const [name, tag] = riotId.split("#");

  if (!name || !tag) {
    alert("Please enter a valid Riot ID like TenZ#NA1");
    return;
  }

  const player = {
    name: name.trim(),
    tag: tag.trim(),
    region: region
  };

  localStorage.setItem("valorateLoggedPlayer", JSON.stringify(player));
  renderLoggedInPlayer();
}

function renderLoggedInPlayer() {
  const authState = document.getElementById("authState");
  const loggedInState = document.getElementById("loggedInState");
  const myRankPanel = document.getElementById("myRankPanel");

  if (!authState || !loggedInState || !myRankPanel) return;

  const player = getLoggedInPlayer();

  const userMenu = document.getElementById("userMenu");
  const userMenuName = document.getElementById("userMenuName");
  const userProfileLink = document.getElementById("userProfileLink");

  if (!player) {
    authState.style.display = "block";
    loggedInState.style.display = "none";
    loggedInState.innerHTML = "";
    myRankPanel.style.display = "block";

    if (userMenu) userMenu.style.display = "none";

    return;
  }

  myRankPanel.style.display = "block";

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
function loginFromNavbar() {
  const riotIdInput = document.getElementById("navRiotId");
  const regionInput = document.getElementById("navRegion");

  const riotId = riotIdInput?.value.trim();
  const region = regionInput?.value || "eu";

  if (!riotId) {
    alert("Please enter Riot ID like TenZ#NA1");
    return;
  }

  if (!riotId.includes("#")) {
    alert("Please enter Riot ID in this format: Name#TAG");
    return;
  }

  const [name, tag] = riotId.split("#");

  if (!name || !tag) {
    alert("Please enter a valid Riot ID like TenZ#NA1");
    return;
  }

  const player = {
    name: name.trim(),
    tag: tag.trim(),
    region: region
  };

  localStorage.setItem("valorateLoggedPlayer", JSON.stringify(player));

  renderLoggedInPlayer();
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
  const riotId = document.getElementById("playerInput").value.trim();
  const region = document.getElementById("regionInput")?.value || "eu";

  if (!riotId) return;

  if (!riotId.includes("#")) {
    alert("Please enter Riot ID like Name#TAG");
    return;
  }

  const [name, tag] = riotId.split("#");

  if (!name || !tag) {
    alert("Please enter a valid Riot ID like Ace#EU1");
    return;
  }

  window.location.href =
    `player.html?mode=live&region=${encodeURIComponent(region)}&name=${encodeURIComponent(name.trim())}&tag=${encodeURIComponent(tag.trim())}`;
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
async function renderLoggedInPlayer() {
  const authState = document.getElementById("authState");
  const loggedInState = document.getElementById("loggedInState");
  const myRankPanel = document.getElementById("myRankPanel");

  if (!authState || !loggedInState || !myRankPanel) return;

  const player = getLoggedInPlayer();

  if (!player) {
    authState.style.display = "block";
    loggedInState.style.display = "none";
    loggedInState.innerHTML = "";
    myRankPanel.style.display = "block";
    return;
  }

  authState.style.display = "none";
  loggedInState.style.display = "block";
  myRankPanel.style.display = "block";

  loggedInState.innerHTML = `
    <div class="my-rank-card">
      <div class="my-rank-header">
        <div>
          <h2>${player.name}#${player.tag}</h2>
          <p>Loading live season stats...</p>
        </div>

        <div class="my-rank-actions">
          <a class="profile-btn" href="player.html?mode=live&region=${encodeURIComponent(player.region)}&name=${encodeURIComponent(player.name)}&tag=${encodeURIComponent(player.tag)}">
            Open My Profile
          </a>
          <button class="logout-btn" onclick="logoutPlayer()">Logout</button>
        </div>
      </div>
    </div>
  `;

  try {
    const liveResponse = await fetch(
      `${window.location.origin}/live-player/${encodeURIComponent(player.region)}/${encodeURIComponent(player.name)}/${encodeURIComponent(player.tag)}`
    );
    const liveData = await liveResponse.json();

    const seasonResponse = await fetch(
      `${window.location.origin}/live-season-stats/${encodeURIComponent(player.region)}/${encodeURIComponent(player.name)}/${encodeURIComponent(player.tag)}`
    );
    const seasonData = await seasonResponse.json();

    const account = liveData.account?.data || {};
    const mmr = liveData.mmr?.data || {};
    const summary = seasonData?.summary || {};
    const agents = seasonData?.agents || [];
    const bestAgent = agents[0] || null;

    const rankName = mmr?.current_data?.currenttierpatched || "Unranked";
    const rr = mmr?.current_data?.ranking_in_tier ?? 0;

    // Şimdilik local/global simülasyon
    const globalPosition = typeof findPlayerGlobalPosition === "function"
      ? findPlayerGlobalPosition(player.name, player.tag)
      : "-";

    const agentRank =
      bestAgent && typeof findAgentLeaderboardRanks === "function"
        ? await (async () => {
            const ranks = await findAgentLeaderboardRanks([bestAgent]);
            return ranks?.[0]?.rank || null;
          })()
        : null;

    loggedInState.innerHTML = `
      <div class="my-rank-card">
        <div class="my-rank-header">
          <div>
            <h2>${player.name}#${player.tag}</h2>
            <p>
              ${(account.region || player.region).toUpperCase()} •
              <span class="rank-pill ${getRankClass(rankName)}">${rankName}</span>
              • ${rr} RR
            </p>
          </div>

          <div class="my-rank-actions">
            <a class="profile-btn" href="player.html?mode=live&region=${encodeURIComponent(player.region)}&name=${encodeURIComponent(player.name)}&tag=${encodeURIComponent(player.tag)}">
              Open My Profile
            </a>
            <button class="logout-btn" onclick="logoutPlayer()">Logout</button>
          </div>
        </div>

        <div class="my-rank-stats">
          <div class="my-rank-mini-card">
            <span>Global Position</span>
            <strong>${globalPosition || "-"}</strong>
          </div>

          <div class="my-rank-mini-card">
            <span>Best Agent</span>
            <strong>${bestAgent?.agent || "Unknown"}</strong>
          </div>

          <div class="my-rank-mini-card">
            <span>Season Win Rate</span>
            <strong>${summary.winRate || "0.0"}%</strong>
          </div>

          <div class="my-rank-mini-card">
            <span>Season KDA</span>
            <strong>${summary.kda || "0.00"}</strong>
          </div>

          <div class="my-rank-mini-card">
            <span>Season Matches</span>
            <strong>${seasonData?.totalMatches || 0}</strong>
          </div>

          <div class="my-rank-mini-card">
            <span>Agent Rank</span>
            <strong>${agentRank ? `#${agentRank}` : "-"}</strong>
          </div>
        </div>
      </div>
    `;
  } catch (error) {
    console.error("renderLoggedInPlayer error:", error);

    loggedInState.innerHTML = `
      <div class="my-rank-card">
        <div class="my-rank-header">
          <div>
            <h2>${player.name}#${player.tag}</h2>
            <p>Could not load live stats.</p>
          </div>

          <div class="my-rank-actions">
            <a class="profile-btn" href="player.html?mode=live&region=${encodeURIComponent(player.region)}&name=${encodeURIComponent(player.name)}&tag=${encodeURIComponent(player.tag)}">
              Open My Profile
            </a>
            <button class="logout-btn" onclick="logoutPlayer()">Logout</button>
          </div>
        </div>
      </div>
    `;
  }
}

async function initApp() {
  await loadPlayers();
  await loadAgents();
  setupAutocomplete();
  renderLoggedInPlayer();
}

initApp();