import httpServer from "@legacery/http/index.js";
import initialise from "@legacery/websocket/index.js";

const server = httpServer.listen(3000, () => {
  console.log(
    `Legacery is running at http://(local ip address, not localhost!):3000`
  );
});

const wss = initialise(server)

if (wss) {
  console.log(
    `LegaceryWS is running at ws://(local ip address, not localhost!):3000/gateway`
  );
}
