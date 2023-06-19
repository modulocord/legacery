export default function (headers: any, type: string) {
    switch (type) {
      case "req": {
        if (headers.origin) {
          headers.origin = "https://canary.discord.com";
        }
        if (headers.referer) {
          headers.referer = headers.referer.replace(
            /https*:\/\/.*\//g,
            "https://canary.discord.com/"
          );
        }
        if (headers["content-length"]) {
          delete headers["content-length"];
        }
        if (headers.host) {
          headers.host = "canary.discord.com";
        }
        break;
      }
      case "res": {
        if (headers["content-encoding"]) {
          delete headers["content-encoding"];
        }
        if (headers["content-length"]) {
          delete headers["content-length"];
        }
        break;
      }
    }
    return headers;
  };