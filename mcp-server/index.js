import express from "express";
import cors from "cors";
import fs from "fs";
import path from "path";

const app = express();
app.use(cors());
app.use(express.json());

const PORT = 3000;
const __dirname = path.resolve();
const manifestPath = path.join(__dirname, "manifest.json");

// ✅ Endpoint raíz: prueba rápida
app.get("/", (req, res) => {
  res.json({ message: "Servidor MCP Yerbalito activo 🚀" });
});

// ✅ Endpoint que Cursor consulta
app.get("/mcp", (req, res) => {
  try {
    const manifest = JSON.parse(fs.readFileSync(manifestPath, "utf8"));
    res.json(manifest);
  } catch (error) {
    console.error("Error leyendo manifest:", error);
    res.status(500).json({ error: "No se pudo leer el manifest" });
  }
});

// Ejemplo de endpoint para comandos MCP
app.post("/mcp", (req, res) => {
  const { command } = req.body;

  if (command === "mysql listar tablas") {
    // Acá más adelante conectarías a MySQL
    return res.json({ result: ["jugadores", "categorias", "entrenadores"] });
  }

  if (command === "notepads mostrar lista") {
    // Ejemplo simulado
    return res.json({ result: ["tareas.mdc", "ideas.mdc", "pendientes.mdc"] });
  }

  res.status(400).json({ error: "Comando desconocido" });
});

app.listen(PORT, () => {
  console.log(`✅ MCP Server Yerbalito corriendo en http://localhost:${PORT}/mcp`);
});