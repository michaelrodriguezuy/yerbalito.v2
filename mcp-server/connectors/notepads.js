import fs from "fs";
import path from "path";

export async function getNotepads() {
  const dir = path.resolve(process.cwd(), ".cursor/notepads");
  const files = fs.readdirSync(dir).filter(f => f.endsWith(".mdc") || f.endsWith(".yml"));
  return files.map(file => ({
    name: file.replace(/\.(mdc|yml)$/, ""),
    content: fs.readFileSync(path.join(dir, file), "utf8"),
  }));
}

export default async function handler() {
  const notepads = await getNotepads();
  return {
    type: "context",
    data: notepads
  };
}