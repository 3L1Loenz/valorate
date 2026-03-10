require("dotenv").config();

const express = require("express");
const cors = require("cors");
const path = require("path");
const axios = require("axios");

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, "../client")));

// ===== LOCAL MOCK DATA =====
const agents = require("./data/agents.json");
const players = require("./data/players.json");
const leaderboard = require("./data/leaderboard.json");

// ===== CONFIG =====
const PORT = process.env.PORT || 3000;
const HENRIK_API_KEY = process.env.HENRIK_API_KEY;

if (!HENRIK_API_KEY) {
  console.warn("WARNING: HENRIK_API_KEY is missing in server/.env");
}

// ===== STATIC PAGES =====
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "../client", "index.html"));
});

app.get("/agent.html", (req, res) => {
  res.sendFile(path.join(__dirname, "../client", "agent.html"));
});

app.get("/agents.html", (req, res) => {
  res.sendFile(path.join(__dirname, "../client", "agents.html"));
});

app.get("/leaderboard.html", (req, res) => {
  res.sendFile(path.join(__dirname, "../client", "leaderboard.html"));
});

app.get("/agent-leaderboard.html", (req, res) => {
  res.sendFile(path.join(__dirname, "../client", "agent-leaderboard.html"));
});

app.get("/player.html", (req, res) => {
  res.sendFile(path.join(__dirname, "../client", "player.html"));
});

app.get("/compare.html", (req, res) => {
  res.sendFile(path.join(__dirname, "../client", "compare.html"));
});

// ===== LOCAL DATA ROUTES =====
app.get("/agents", (req, res) => {
  res.json(agents);
});

app.get("/players", (req, res) => {
  res.json(players);
});

app.get("/leaderboard/:agent", (req, res) => {
  const agentName = req.params.agent.toLowerCase();

  const result = leaderboard.filter(
    (item) => item.agent.toLowerCase() === agentName
  );

  res.json(result);
});

app.get("/player/:name/:tag", (req, res) => {
  const playerName = req.params.name.toLowerCase();
  const playerTag = req.params.tag.toLowerCase();

  const player = players.find(
    (item) =>
      item.name.toLowerCase() === playerName &&
      item.tag.toLowerCase() === playerTag
  );

  if (!player) {
    return res.status(404).json({ error: "Player not found" });
  }

  res.json(player);
});

app.get("/global-leaderboard", (req, res) => {
  const globalData = players.map((player) => {
    const avgWinRate =
      player.stats.reduce((sum, item) => sum + item.winRate, 0) /
      player.stats.length;

    const avgKda =
      player.stats.reduce((sum, item) => sum + item.kda, 0) /
      player.stats.length;

    const totalMatches = player.stats.reduce(
      (sum, item) => sum + item.matches,
      0
    );

    const bestAgent = [...player.stats].sort(
      (a, b) => a.worldRank - b.worldRank
    )[0];

    return {
      name: player.name,
      tag: player.tag,
      region: player.region,
      rank: player.rank,
      avgWinRate: Number(avgWinRate.toFixed(1)),
      avgKda: Number(avgKda.toFixed(2)),
      totalMatches,
      bestAgent: bestAgent.agent,
    };
  });

  res.json(globalData);
});

// ===== HENRIK LIVE PLAYER ROUTE =====
// Example:
// /live-player/eu/scream/EU
// /live-player/na/TenZ/NA1
app.get("/live-player/:region/:name/:tag", async (req, res) => {
  try {
    if (!HENRIK_API_KEY) {
      return res.status(500).json({
        error: "Henrik API key missing",
        details: "Add HENRIK_API_KEY to server/.env"
      });
    }

    const { region, name, tag } = req.params;

    const allowedRegions = ["eu", "na", "ap", "kr", "latam", "br"];
    const normalizedRegion = region.toLowerCase();

    if (!allowedRegions.includes(normalizedRegion)) {
      return res.status(400).json({
        error: "Invalid region",
        details: `Allowed regions: ${allowedRegions.join(", ")}`
      });
    }

    const headers = {
      Authorization: HENRIK_API_KEY
    };

    // Account info
    const accountResponse = await axios.get(
      `https://api.henrikdev.xyz/valorant/v1/account/${encodeURIComponent(name)}/${encodeURIComponent(tag)}`,
      { headers }
    );

    // MMR / Rank info
    const mmrResponse = await axios.get(
      `https://api.henrikdev.xyz/valorant/v2/mmr/${normalizedRegion}/${encodeURIComponent(name)}/${encodeURIComponent(tag)}`,
      { headers }
    ).catch(() => null);

    res.json({
      source: "henrikdev",
      region: normalizedRegion,
      account: accountResponse.data,
      mmr: mmrResponse ? mmrResponse.data : null
    });
  } catch (error) {
    console.error("Henrik API error:", error.response?.data || error.message);

    res.status(error.response?.status || 500).json({
      error: "Henrik API error",
      details: error.response?.data || error.message
    });
  }
});

app.get("/live-matches/:region/:name/:tag", async (req, res) => {
  try {
    if (!HENRIK_API_KEY) {
      return res.status(500).json({
        error: "Henrik API key missing",
        details: "Add HENRIK_API_KEY to server/.env"
      });
    }

    const { region, name, tag } = req.params;
    const normalizedRegion = region.toLowerCase();

    const allowedRegions = ["eu", "na", "ap", "kr", "latam", "br"];
    if (!allowedRegions.includes(normalizedRegion)) {
      return res.status(400).json({
        error: "Invalid region",
        details: `Allowed regions: ${allowedRegions.join(", ")}`
      });
    }

    const headers = {
      Authorization: HENRIK_API_KEY
    };

    const response = await axios.get(
      `https://api.henrikdev.xyz/valorant/v3/matches/${normalizedRegion}/${encodeURIComponent(name)}/${encodeURIComponent(tag)}`,
      { headers }
    );

    res.json(response.data);
  } catch (error) {
    console.error("Henrik matches error:", error.response?.data || error.message);

    res.status(error.response?.status || 500).json({
      error: "Henrik matches error",
      details: error.response?.data || error.message
    });
  }
});
app.get("/live-season-stats/:region/:name/:tag", async (req, res) => {
  try {
    if (!HENRIK_API_KEY) {
      return res.status(500).json({
        error: "Henrik API key missing"
      });
    }

    const { region, name, tag } = req.params;

    const allowedRegions = ["eu", "na", "ap", "kr", "latam", "br"];
    const normalizedRegion = region.toLowerCase();

    if (!allowedRegions.includes(normalizedRegion)) {
      return res.status(400).json({
        error: "Invalid region"
      });
    }

    const headers = {
      Authorization: HENRIK_API_KEY
    };

    // ACCOUNT
    const accountResponse = await axios.get(
      `https://api.henrikdev.xyz/valorant/v1/account/${encodeURIComponent(name)}/${encodeURIComponent(tag)}`,
      { headers }
    );

    const account = accountResponse.data?.data;

    if (!account?.puuid) {
      return res.status(404).json({
        error: "Player PUUID not found"
      });
    }

    const puuid = account.puuid;

    // STORED MATCHES
    const matchesResponse = await axios.get(
      `https://api.henrikdev.xyz/valorant/v1/by-puuid/stored-matches/${normalizedRegion}/${puuid}?mode=competitive`,
      { headers }
    );

    const matches = matchesResponse.data?.data || [];

    if (!matches.length) {
      return res.json({
        totalMatches: 0,
        summary: {},
        agents: [],
        recentMatches: []
      });
    }

    // SORT MATCHES
    const sortedMatches = [...matches].sort(
      (a, b) => new Date(b.meta.started_at) - new Date(a.meta.started_at)
    );

    const currentSeasonId = sortedMatches[0].meta.season.id;
    const currentSeasonShort = sortedMatches[0].meta.season.short;

    const seasonMatches = sortedMatches.filter(
      (m) => m.meta.season.id === currentSeasonId
    );

    let totalKills = 0;
    let totalDeaths = 0;
    let totalAssists = 0;
    let totalWins = 0;

    const agentMap = {};

    seasonMatches.forEach((match) => {
      const stats = match.stats;

      const kills = stats.kills || 0;
      const deaths = stats.deaths || 0;
      const assists = stats.assists || 0;

      totalKills += kills;
      totalDeaths += deaths;
      totalAssists += assists;

      if (stats.won) totalWins++;

      const agent = stats.character?.name || "Unknown";

      if (!agentMap[agent]) {
        agentMap[agent] = {
          agent,
          matches: 0,
          wins: 0,
          kills: 0,
          deaths: 0,
          assists: 0
        };
      }

      agentMap[agent].matches++;
      agentMap[agent].kills += kills;
      agentMap[agent].deaths += deaths;
      agentMap[agent].assists += assists;

      if (stats.won) agentMap[agent].wins++;
    });

    const totalMatches = seasonMatches.length;

    const summary = {
      winRate: ((totalWins / totalMatches) * 100).toFixed(1),
      kda: ((totalKills + totalAssists) / Math.max(totalDeaths, 1)).toFixed(2),
      kills: totalKills,
      deaths: totalDeaths,
      assists: totalAssists
    };

    const agents = Object.values(agentMap)
      .map((a) => ({
        agent: a.agent,
        matches: a.matches,
        wins: a.wins,
        winRate: ((a.wins / a.matches) * 100).toFixed(1),
        kda: ((a.kills + a.assists) / Math.max(a.deaths, 1)).toFixed(2),
        kills: a.kills,
        deaths: a.deaths,
        assists: a.assists
      }))
      .sort((a, b) => b.matches - a.matches);

    res.json({
      season: {
        id: currentSeasonId,
        short: currentSeasonShort
      },
      totalMatches,
      summary,
      agents,
      recentMatches: seasonMatches
    });

  } catch (error) {

    console.error(
      "Season stats error:",
      error.response?.data || error.message
    );

    res.status(500).json({
      error: "Season stats error"
    });

  }
});
app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running on http://localhost:${PORT}`);
});