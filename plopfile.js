import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default function (plop) {
  const generatorsPath = path.join(__dirname, "plop-generators");
  const files = fs.readdirSync(generatorsPath);

  files.forEach(async (file) => {
    if (file.endsWith(".js")) {
      const generator = await import(path.join(generatorsPath, file));
      generator.default(plop);
    }
  });
}
