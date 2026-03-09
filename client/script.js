const API_URL = window.location.origin;
let allPlayers = [];
let selectedIndex = -1;
let currentMatches = [];

function getAgentImage(agentName) {
  return `images/agents/${agentName.toLowerCase()}.png`;
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

async function initApp() {
  await loadPlayers();
  await loadAgents();
  renderRecentSearches();
  setupAutocomplete();
}

initApp();