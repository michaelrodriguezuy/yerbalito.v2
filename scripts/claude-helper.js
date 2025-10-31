#!/usr/bin/env node

/**
 * Claude Helper - Script para consultas directas a Claude API
 * 
 * Comandos disponibles:
 * - ask "pregunta"           : Consulta simple
 * - doc archivo.jsx          : Documentar archivo
 * - test archivo.jsx         : Generar tests
 * - refactor archivo.jsx     : Refactorizar código
 * - explain archivo.jsx      : Explicar código
 * 
 * Uso: node scripts/claude-helper.js <comando> <args>
 */

import Anthropic from '@anthropic-ai/sdk';
import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

// Configurar __dirname para ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Cargar variables de entorno desde la raíz
dotenv.config({ path: join(__dirname, '../.env') });

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

/**
 * Consulta directa a Claude
 */
async function askClaude(prompt, options = {}) {
  const {
    maxTokens = 1024,
    temperature = 0.3,
    model = 'claude-sonnet-4-20250514'
  } = options;

  console.log('\n🤖 Consultando a Claude...\n');

  try {
    const message = await anthropic.messages.create({
      model,
      max_tokens: maxTokens,
      temperature,
      messages: [{ role: 'user', content: prompt }],
    });

    const response = message.content[0].text;
    const usage = message.usage;

    console.log(response);
    console.log('\n' + '─'.repeat(50));
    console.log(`📊 Tokens: ${usage.input_tokens} in / ${usage.output_tokens} out`);
    console.log(`💰 Costo: ~$${calculateCost(usage.input_tokens, usage.output_tokens)}`);
    console.log('─'.repeat(50) + '\n');

    return response;
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

/**
 * Leer archivo y agregar al contexto
 */
function readFile(filePath) {
  try {
    const fullPath = join(process.cwd(), filePath);
    return readFileSync(fullPath, 'utf8');
  } catch (error) {
    console.error(`❌ Error leyendo archivo: ${error.message}`);
    process.exit(1);
  }
}

/**
 * Documenta un archivo según claude-prompts.md
 */
async function documentFile(filePath) {
  const fileContent = readFile(filePath);
  
  const prompt = `Documenta este archivo en Markdown:

\`\`\`javascript
${fileContent}
\`\`\`

Formato requerido:
- **Descripción**: Qué hace y su propósito
- **Props/Parámetros**: Tipos y descripción (si aplica)
- **Ejemplo de uso**: Código de ejemplo
- **Dependencias**: Imports importantes
- **Notas**: Consideraciones especiales

Sé conciso y profesional.`;

  return await askClaude(prompt, { maxTokens: 2048 });
}

/**
 * Genera tests Jest
 */
async function generateTests(filePath) {
  const fileContent = readFile(filePath);
  
  const prompt = `Genera tests Jest para este archivo:

\`\`\`javascript
${fileContent}
\`\`\`

Requisitos:
- Usa mocks de axios si es necesario
- Cubre casos borde
- Include tests de props inválidas (si es componente)
- Tests de errores
- Usa describe/it/expect

Solo el código de los tests, sin explicación adicional.`;

  return await askClaude(prompt, { maxTokens: 3000 });
}

/**
 * Refactoriza código
 */
async function refactorCode(filePath) {
  const fileContent = readFile(filePath);
  
  const prompt = `Refactoriza este código para:

\`\`\`javascript
${fileContent}
\`\`\`

Objetivos:
- Mejor legibilidad
- Performance optimizada
- Mantener compatibilidad de interfaz
- Eliminar código duplicado
- Aplicar best practices

Muestra solo el código refactorizado con comentarios en cambios importantes.`;

  return await askClaude(prompt, { maxTokens: 3000 });
}

/**
 * Explica código
 */
async function explainCode(filePath) {
  const fileContent = readFile(filePath);
  
  const prompt = `Explica este código de forma clara y estructurada:

\`\`\`javascript
${fileContent}
\`\`\`

Incluye:
- Propósito general
- Flujo principal
- Funciones/componentes clave
- Patrones utilizados
- Posibles mejoras`;

  return await askClaude(prompt, { maxTokens: 2048 });
}

/**
 * Analiza tarea compleja y estima tokens
 */
async function estimateTask(description) {
  const prompt = `Analiza esta tarea de desarrollo y estima:

Tarea: ${description}

Proporciona:
1. Archivos que necesitarías ver/modificar
2. Pasos principales
3. Estimación de tokens necesarios (input)
4. Costo aproximado en USD
5. Tiempo estimado

Sé específico y realista.`;

  return await askClaude(prompt, { maxTokens: 1024 });
}

/**
 * Calcula costo aproximado
 */
function calculateCost(inputTokens, outputTokens) {
  const inputCost = (inputTokens / 1000000) * 3.00;
  const outputCost = (outputTokens / 1000000) * 15.00;
  return (inputCost + outputCost).toFixed(4);
}

/**
 * Muestra ayuda
 */
function showHelp() {
  console.log(`
📚 Claude Helper - Comandos disponibles:

Consultas simples:
  node scripts/claude-helper.js ask "¿Qué es useEffect?"

Documentar archivo:
  node scripts/claude-helper.js doc yerbalito/src/components/Blog.jsx

Generar tests:
  node scripts/claude-helper.js test yerbalito/src/components/Navbar.jsx

Refactorizar:
  node scripts/claude-helper.js refactor yerbalito/src/utils/api.js

Explicar código:
  node scripts/claude-helper.js explain yerbalito/src/App.jsx

Estimar tarea compleja:
  node scripts/claude-helper.js estimate "Implementar sistema de envío de emails"

Ejemplos de costos:
  - Pregunta simple:    ~$0.01
  - Documentar archivo: ~$0.02-0.04
  - Generar tests:      ~$0.03-0.05
  - Refactorizar:       ~$0.03-0.06

Alias recomendados (agregar a ~/.zshrc):
  alias ask='node ~/path/scripts/claude-helper.js ask'
  alias doc='node ~/path/scripts/claude-helper.js doc'
`);
}

// CLI Principal
const command = process.argv[2];
const args = process.argv.slice(3);

if (!command || command === 'help' || command === '--help') {
  showHelp();
  process.exit(0);
}

switch (command) {
  case 'ask':
    if (!args.length) {
      console.error('❌ Falta la pregunta');
      console.log('Uso: node scripts/claude-helper.js ask "tu pregunta"');
      process.exit(1);
    }
    askClaude(args.join(' '));
    break;

  case 'doc':
    if (!args[0]) {
      console.error('❌ Falta el archivo');
      console.log('Uso: node scripts/claude-helper.js doc <archivo>');
      process.exit(1);
    }
    documentFile(args[0]);
    break;

  case 'test':
    if (!args[0]) {
      console.error('❌ Falta el archivo');
      console.log('Uso: node scripts/claude-helper.js test <archivo>');
      process.exit(1);
    }
    generateTests(args[0]);
    break;

  case 'refactor':
    if (!args[0]) {
      console.error('❌ Falta el archivo');
      console.log('Uso: node scripts/claude-helper.js refactor <archivo>');
      process.exit(1);
    }
    refactorCode(args[0]);
    break;

  case 'explain':
    if (!args[0]) {
      console.error('❌ Falta el archivo');
      console.log('Uso: node scripts/claude-helper.js explain <archivo>');
      process.exit(1);
    }
    explainCode(args[0]);
    break;

  case 'estimate':
    if (!args.length) {
      console.error('❌ Falta la descripción de la tarea');
      console.log('Uso: node scripts/claude-helper.js estimate "descripción"');
      process.exit(1);
    }
    estimateTask(args.join(' '));
    break;

  default:
    console.error(`❌ Comando desconocido: ${command}`);
    showHelp();
    process.exit(1);
}