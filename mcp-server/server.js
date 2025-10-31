import { createServer } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import fs from "fs";
import path from "path";
import { queryDB } from "./connectors/mysql.js";
import { getNotepads } from "./connectors/notepads.js";

// Carga del manifest para describir comandos
const __dirname = path.resolve();
const manifestPath = path.join(__dirname, "manifest.json");
let manifest = { name: "yerbalito-mcp", version: "1.0.0", commands: {} };
try {
  manifest = JSON.parse(fs.readFileSync(manifestPath, "utf8"));
} catch (_) {}

const server = createServer({ name: manifest.name || "yerbalito-mcp", version: manifest.version || "1.0.0" });

// Herramienta: mysql listar tablas (consulta real)
server.tool("mysql listar tablas", async () => {
  try {
    const rows = await queryDB("SHOW TABLES");
    return { content: [{ type: "text", text: JSON.stringify(rows) }] };
  } catch (err) {
    return { content: [{ type: "text", text: `Error MySQL: ${err.message}` }] };
  }
});

// Herramienta: notepads mostrar lista (lee .cursor/notepads)
server.tool("notepads mostrar lista", async () => {
  try {
    const pads = await getNotepads();
    const names = pads.map(p => p.name);
    return { content: [{ type: "text", text: JSON.stringify(names) }] };
  } catch (err) {
    return { content: [{ type: "text", text: `Error Notepads: ${err.message}` }] };
  }
});

// Inicio transporte stdio
const transport = new StdioServerTransport();
await server.connect(transport);
