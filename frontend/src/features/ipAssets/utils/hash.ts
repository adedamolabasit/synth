export async function sha256Hash(data: any) {
  const encoder = new TextEncoder();
  const encoded = encoder.encode(JSON.stringify(data));

  const hashBuffer = await crypto.subtle.digest("SHA-256", encoded);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");

  return hashHex;
}
