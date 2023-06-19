import zlibSync from "zlib-sync";
import WebSocket from "ws";

var discordGatewayURL = "wss://gateway.discord.gg";
var options = "?encoding=json&v=10&compress=zlib-stream"

var discordGateway;

export default function connectDiscord(encode) {
  let isFirstSend = true;

  let isHelloSent = false;

  const inflate = new zlibSync.Inflate({
    chunkSize: 65535,
  }); // Should be available for one whole websocket cycle, will replace by another websocket cycle, or else a data error will occur

  discordGateway = new WebSocket(
    `${discordGatewayURL}/${options}`,
    {
      perMessageDeflate: false,
    }
  );

  discordGateway.onerror = function (event: { error: any }) {
    console.error(event.error);
  };

  return { inflate, discordGateway, isFirstSend, isHelloSent };
}

export function updateGatewayURL(newURL: string) {
  if (discordGatewayURL != newURL) {
    discordGatewayURL = newURL;
    console.debug(
      `[LegaceryWS] New GatewayURL: ${discordGatewayURL}/${options}`
    );
  }
}
