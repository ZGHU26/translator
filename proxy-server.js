/**
 * 本地代理（推荐用于本地运行，解决 CORS & 隐藏 API Key）
 * 运行：
 *   npm i express
 *   # Windows PowerShell:
 *   $env:DEEPSEEK_API_KEY="你的key"
 *   node proxy-server.js
 *
 * 前端 CONFIG:
 *   url: "http://127.0.0.1:8787/translate"
 *   authMode: "proxy"
 */
import express from "express";

const app = express();
app.use(express.json({ limit: "2mb" }));

app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  if (req.method === "OPTIONS") return res.sendStatus(204);
  next();
});

app.post("/translate", async (req, res) => {
  const apiKey = process.env.DEEPSEEK_API_KEY;
  if (!apiKey) return res.status(500).json({ error: { message: "Missing DEEPSEEK_API_KEY env var" } });

  const { payload } = req.body || {};
  if (!payload) return res.status(400).json({ error: { message: "Missing payload" } });

  const r = await fetch("https://api.deepseek.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${apiKey}`,
    },
    body: JSON.stringify(payload),
  });

  const text = await r.text();
  res.status(r.status).send(text);
});

app.listen(8787, () => console.log("Proxy listening on http://127.0.0.1:8787"));
