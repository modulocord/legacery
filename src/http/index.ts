import express from "express";
import cors from "cors";

import transformHeaders from "@legacery/utils/convertHeaders.js";

const httpServer = express();

httpServer.use(cors());

httpServer.options("/api/*", cors());

httpServer.use(express.json());

httpServer.all("/api/*", async (req, res) => {
  const discordResponse = await fetch(
    `https://canary.discord.com${req.originalUrl}`,
    {
      method: req.method,
      headers: transformHeaders(req.headers, "req"),
      body:
        req.body && req.method != "GET" ? JSON.stringify(req.body) : undefined,
      keepalive: true,
    }
  );
  const headers = Object.fromEntries(discordResponse.headers);
  const bodyReader = discordResponse.body?.getReader();

  var result;

  res.header(transformHeaders(headers, "res"));
  res.status(discordResponse.status);
  if (bodyReader) {
    result = "";
    while (true) {
      const { value, done } = await bodyReader.read();
      if (done) break;
      result += new TextDecoder().decode(value);
    }
  }

  if (req.originalUrl == "/api/*/gateway") {
    result = `{"url": "ws://localhost:3000/gateway"}`
  }

  if (req.originalUrl == "/api/gateway") {
    result = `{"url": "ws://localhost:3000/gateway"}`
  }

  res.send(result);
});

export default httpServer;
