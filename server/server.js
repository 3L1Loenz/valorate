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

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running on http://localhost:${PORT}`);
});