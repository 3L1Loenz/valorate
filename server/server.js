const axios = require("axios");

const TRACKER_API_KEY = "fb1f6248-5f55-473d-9fb2-61edeacf1527";
const express = require("express");
const cors = require("cors");
const path = require("path");

const app = express();

app.use(cors());
app.use(express.static(path.join(__dirname, "../client")));

const agents = require("./data/agents.json");
const players = require("./data/players.json");
const leaderboard = require("./data/leaderboard.json");

// HTML pages
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "../client", "index.html"));
});

app.get("/agent.html", (req, res) => {
  res.sendFile(path.join(__dirname, "../client", "agent.html"));
});

app.get("/leaderboard.html", (req, res) => {
  res.sendFile(path.join(__dirname, "../client", "leaderboard.html"));
});

app.get("/player.html", (req, res) => {
  res.sendFile(path.join(__dirname, "../client", "player.html"));
});

app.get("/compare.html", (req, res) => {
  res.sendFile(path.join(__dirname, "../client", "compare.html"));
});

app.get("/agents.html", (req, res) => {
  res.sendFile(path.join(__dirname, "../client", "agents.html"));
});

// API routes
app.get("/agents", (req, res) => {
  res.json(agents);
});

app.get("/players", (req, res) => {
  res.json(players);
});

app.get("/global-leaderboard", (req, res) => {
  const globalData = players.map((player) => {
    const avgWinRate =
      player.stats.reduce((sum, item) => sum + item.winRate, 0) / player.stats.length;

    const avgKda =
      player.stats.reduce((sum, item) => sum + item.kda, 0) / player.stats.length;

    const totalMatches =
      player.stats.reduce((sum, item) => sum + item.matches, 0);

    const bestAgent = [...player.stats].sort((a, b) => a.worldRank - b.worldRank)[0];

    return {
      name: player.name,
      tag: player.tag,
      region: player.region,
      rank: player.rank,
      avgWinRate: Number(avgWinRate.toFixed(1)),
      avgKda: Number(avgKda.toFixed(2)),
      totalMatches,
      bestAgent: bestAgent.agent
    };
  });

  res.json(globalData);
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

const PORT = process.env.PORT || 3000;
app.get("/tracker/:name/:tag", async (req, res) => {
  try {
    const { name, tag } = req.params;

    const response = await axios.get(
      `https://api.tracker.gg/api/v2/valorant/standard/profile/riot/${encodeURIComponent(name)}%23${encodeURIComponent(tag)}`,
      {
        headers: {
          "TRN-Api-Key": TRACKER_API_KEY
        }
      }
    );

    res.json(response.data);
  } catch (error) {
    console.error("Tracker API error:", error.response?.data || error.message);
    res.status(500).json({
      error: "Tracker API error",
      details: error.response?.data || error.message
    });
  }
});

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running on http://localhost:${PORT}`);
});