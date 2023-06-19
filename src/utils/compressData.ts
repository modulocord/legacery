import pako from "pako";

export default function (dataToCompress: any, isFirstSend: boolean) {
  let deflate: pako.Deflate;
  const suffix = new Uint8Array([0x00, 0x00, 0xff, 0xff]);

  if (isFirstSend) {
    deflate = new pako.Deflate({
      chunkSize: 65535,
    });
    isFirstSend = false;
  } else {
    deflate = new pako.Deflate({
      chunkSize: 65535,
      raw: true,
    });
  }

  deflate.push(JSON.stringify(dataToCompress), pako.constants.Z_SYNC_FLUSH);
  deflate.push("", true); // or else turn undefined

  const result = deflate.result;

  let trueLength: number;

  for (let i = 0; i <= result.length; i++) {
    if (
      result[i] === suffix[0] &&
      result[i + 1] === suffix[1] &&
      result[i + 2] === suffix[2] &&
      result[i + 3] === suffix[3]
    ) {
      trueLength = i + 4;
      break;
    }
  }

  const deflatedData = result.slice(0, trueLength)

  return {deflatedData, isFirstSend}
}
