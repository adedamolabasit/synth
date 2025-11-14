import pako from "pako";

export function compress(data: any): string {
  try {
    const json = JSON.stringify(data);
    const binary = pako.gzip(json);
    return Buffer.from(binary).toString("base64");
  } catch (err) {
    return "";
  }
}

export function decompress<T = any>(encoded: string): T {
  try {
    const binary = Buffer.from(encoded, "base64");
    const json = pako.ungzip(binary, { to: "string" });
    return JSON.parse(json);
  } catch (err) {
    return null as T;
  }
}
