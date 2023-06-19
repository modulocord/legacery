import zlibSync from "zlib-sync";

export default function decompressData(inflate: any, data: any) {
  if (Array.isArray(data)) {
    data = new Uint8Array(Buffer.concat(data));
  } else if (Buffer.isBuffer(data) || data instanceof ArrayBuffer) {
    data = new Uint8Array(data);
  }

  const suffix = data.slice(data.length - 4, data.length);
  const zlibSuffix = new Uint8Array([0x00, 0x00, 0xff, 0xff]);

  let flush = true;
  for (let i = 0; i < suffix.length; i++) {
    if (suffix[i] !== zlibSuffix[i]) {
      flush = false;
      break;
    }
  }

  inflate.push(
    Buffer.from(data),
    flush ? zlibSync.Z_SYNC_FLUSH : zlibSync.Z_NO_FLUSH
  );
  if (inflate.err) {
    console.error(inflate.msg);
  }
  if (!flush) {
    return;
  }
  const { result } = inflate;

  return Array.isArray(result) ? new Uint8Array(result) : result!;
}