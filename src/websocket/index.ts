import { WebSocketServer } from "ws";
import url from "url";

import connectDiscord, { updateGatewayURL } from "@legacery/clients/discord.js";
import decompressData from "@legacery/utils/decompressData.js";
import compressData from "@legacery/utils/compressData.js";

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

export default function initialise(httpServer) {
  let encoding = false;

  const webSocketServer = new WebSocketServer({
    server: httpServer,
    path: "/gateway",
  });

  webSocketServer.on("request", function (req) {
    if (url.parse(req.httpRequest.url).pathname.includes("&compress=")) {
      encoding = true;
    }
  });

  webSocketServer.on("connection", function connection(client) {
    client.on("error", console.error);

    let { inflate, discordGateway, isFirstSend, isHelloSent } =
      connectDiscord(encoding);

    discordGateway.onmessage = async function ({ data }) {
      while (client.readyState == 0) {
        await sleep(500);
      }
      const inflatedData = JSON.parse(decompressData(inflate, data).toString());
      let deflatedData;

      if (inflatedData.op == 10) {
        isHelloSent = true;
      }
      if (inflatedData.d) {
        if (inflatedData.d["resume_gateway_url"]) {
          updateGatewayURL(inflatedData.d["resume_gateway_url"]);
          delete inflatedData.d["resume_gateway_url"];
        }
      }

      console.debug(`[Discord] ${JSON.stringify(inflatedData)}`);

      if (encoding) {
        const result = compressData(inflatedData, isFirstSend);

        deflatedData = result.deflatedData;
        isFirstSend = result.isFirstSend;
      } else {
        deflatedData = JSON.stringify(inflatedData)
      }

      client.send(deflatedData);
    };

    discordGateway.onclose = function ({ code }) {
      console.debug(`[LegaceryWS] Websocket closed: ${code}`);
      const result = compressData(
        { op: 9, d: true, s: null, t: null },
        isFirstSend
      );

      const deflatedData = result.deflatedData;
      isFirstSend = result.isFirstSend;

      client.send(deflatedData, {
        binary: true,
        compress: false,
      });
      setTimeout(() => {
        const result = connectDiscord(encoding);
        inflate = result.inflate;
        discordGateway = result.discordGateway;
        isHelloSent = result.isHelloSent;
        isFirstSend = result.isFirstSend;
      }, 10000);
    };

    client.on("message", async function message(data) {
      while (discordGateway.readyState == 0 || isHelloSent == false) {
        await sleep(500);
      }
      const jsonData = JSON.parse(data.toString())
      if (jsonData.op == 1 && jsonData.d) {
        return
      }
      console.debug(`[Client] ${data.toString().replaceAll(/\\"/g, '"')}`);
      discordGateway.send(data);
    });
  });

  return webSocketServer;
}
