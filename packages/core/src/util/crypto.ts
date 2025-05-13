const encoder = new TextEncoder();

async function createHmacKey(secretKey: string) {
  const secretKeyData = encoder.encode(secretKey);
  return await crypto.subtle.importKey(
    "raw",
    secretKeyData,
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign", "verify"],
  );
}

function arrayBufferToHex(buffer: ArrayBuffer): string {
  return Array.from(new Uint8Array(buffer))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

function hexToBytes(hex: string): Uint8Array {
  const bytes = new Uint8Array(hex.length / 2);
  for (let i = 0; i < hex.length; i += 2) {
    bytes[i / 2] = parseInt(hex.slice(i, i + 2), 16);
  }
  return bytes;
}

export async function createHmacDigest({
  secretKey,
  data,
}: {
  secretKey: string;
  data: string;
}) {
  const key = await createHmacKey(secretKey);
  const mac = await crypto.subtle.sign("HMAC", key, encoder.encode(data));
  return arrayBufferToHex(mac);
}

export async function verifyHmacDigest({
  secretKey,
  data,
  digest,
}: {
  secretKey: string;
  data: string;
  digest: string;
}) {
  const key = await createHmacKey(secretKey);
  const signatureBytes = hexToBytes(digest);
  return await crypto.subtle.verify(
    "HMAC",
    key,
    signatureBytes,
    encoder.encode(data),
  );
}

export function urlBase64ToUint8Array(base64String: string) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");

  const rawData = atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}
