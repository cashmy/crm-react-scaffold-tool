import { defineConfig } from "eslint/config";
import prettier from "eslint-plugin-prettier";
import hbs from "eslint-plugin-hbs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import js from "@eslint/js";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const compat = new FlatCompat({
  baseDirectory: __dirname,
  recommendedConfig: js.configs.recommended,
  allConfig: js.configs.all
});

export default defineConfig([
  {
    extends: compat.extends(
      "eslint:recommended",
      "plugin:react/recommended",
      "plugin:prettier/recommended",
      "prettier"
    ),

    plugins: {
      prettier,
      hbs
    },

    rules: {
      "prettier/prettier": "error"
    }
  },
  {
    files: ["**/*.hbs"],
    rules: {
      // Disable rules that conflict with Handlebars syntax
      "no-template-curly-in-string": "off", // Ignore {{ }} syntax
      "prettier/prettier": "off" // Disable Prettier for .hbs files
    }
  }
]);
