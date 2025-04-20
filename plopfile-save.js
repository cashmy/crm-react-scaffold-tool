import fs from "fs";
import path from "path";
import { fileURLToPath, pathToFileURL } from "url";
import minimist from "minimist";

/**
 * This plopfile dynamically imports all generators located in the ./plop-generators folder.
 * Each generator should export a default function that receives the plop object.
 */

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default async function (plop) {
  const generatorsPath = path.join(__dirname, "plop-generators");

  if (!fs.existsSync(generatorsPath)) {
    console.warn(
      `⚠️  No 'plop-generators' directory found at: ${generatorsPath}`
    );
    return;
  }

  // Parse CLI arguments to get the requested generator name
  const args = minimist(process.argv.slice(2));
  const requestedGenerator = args._[0]; // The generator name (e.g., "service")

  const files = fs.readdirSync(generatorsPath);

  for (const file of files) {
    if (file.endsWith("generator.js")) {
      const fullPath = path.join(generatorsPath, file);
      const fileUrl = pathToFileURL(fullPath).href; // Convert to file:// URL

      console.log(`🔍 Attempting to load generator: ${file}`);
      try {
        const generatorModule = await import(fileUrl);
        if (generatorModule?.default) {
          // Temporarily register the generator to check its name
          const tempPlop = { setGenerator: (name) => name };
          const generatorName = generatorModule.default(tempPlop);

          // Only register the generator if it matches the requested one
          if (generatorName === requestedGenerator) {
            console.log(`✅ Successfully loaded generator: ${file}`);
            generatorModule.default(plop);
          } else {
            console.log(`⏩ Skipping generator: ${file}`);
          }
        } else {
          console.warn(
            `⚠️  Generator ${file} does not export a default function.`
          );
        }
      } catch (err) {
        console.error(`❌ Error loading generator ${file}:`, err.message);
        console.error(err.stack);
      }
    }
  }

  console.log("✅ All generators processed.");
}
