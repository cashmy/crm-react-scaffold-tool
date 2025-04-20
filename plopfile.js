import inquirer from "inquirer";
import fs from "fs";
import minimist from "minimist";

export default function (plop) {
  // * Register the Helpers
  //#region Helpers
  // Register the 'eq' helper
  plop.setHelper("eq", (a, b) => a === b);
  // Register the 'includes' helper
  plop.setHelper(
    "includes",
    (array, value) => Array.isArray(array) && array.includes(value)
  );
  // Register the 'kebabCase' helper
  plop.setHelper("kebabCase", (text) => {
    // console.log("text", text);
    return text
      .replace(/\W+/g, " ")
      .split(/ |\B(?=[A-Z])/)
      .map((word) => word.toLowerCase())
      .join("-");
  });

  plop.setHelper("snakeCase", (text) => {
    return text
      .replace(/\W+/g, " ")
      .split(/ |\B(?=[A-Z])/)
      .map((word) => word.toLowerCase())
      .join("_");
  });
  //#endregion

  // * Register the Service Generator
  plop.setGenerator("service", {
    description: "Generate a CRUD axios service for a React project",

    // ^ Prompts to ask the user
    prompts: async () => {
      const args = minimist(process.argv.slice(2));
      const extraEndpoints = [
        { name: "getAllRecordsByUser", message: "Filter by User" },
        { name: "getAllRecordsByActiveSts", message: "Filter by Status" },
        { name: "getRecordByName", message: "Get by Name" },
        { name: "patchRecordSts", message: "Patch Status" }
      ];

      // Use inquirer directly for fallback prompts
      const serviceName =
        args.name ||
        (
          await inquirer.prompt({
            name: "name",
            type: "input",
            message: "Enter the endpoint category (e.g. players):"
          })
        ).name;

      const format =
        args.format ||
        (
          await inquirer.prompt({
            name: "format",
            type: "list",
            message: "Select output format:",
            choices: ["typescript", "javascript"]
          })
        ).format;

      const extras = args.extra
        ? args.extra.split(",")
        : (
            await inquirer.prompt({
              name: "extras",
              type: "checkbox",
              message: "Select additional endpoints to generate:",
              choices: extraEndpoints
            })
          ).extras;

      const includeVitest =
        args.includeVitest ||
        (
          await inquirer.prompt({
            name: "includeVitest",
            type: "confirm",
            message: "Include Vitest tests?",
            default: true
          })
        ).includeVitest;

      const includeRedux =
        args.includeRedux ||
        (
          await inquirer.prompt({
            name: "includeRedux",
            type: "confirm",
            message: "Generate a Redux slice?",
            default: true
          })
        ).includeRedux;

      const useRtkQuery =
        args.useRtkQuery ||
        (
          await inquirer.prompt({
            name: "useRtkQuery",
            type: "confirm",
            message: "Use RTK Query instead of standard Redux slices?",
            default: false
          })
        ).useRtkQuery;

      return {
        name: serviceName,
        format,
        extras,
        includeVitest,
        includeRedux,
        useRtkQuery
      };
    },

    // ^ Actions to perform after the prompts
    actions: (data) => {
      const templateFile =
        data.format === "typescript"
          ? "templates/services/service-ts.hbs"
          : "templates/services/service-js.hbs";

      const actions = [
        {
          type: "add",
          path: `src/services/{{kebabCase name}}/{{camelCase name}}.service.{{#if (eq format "typescript")}}ts{{else}}js{{/if}}`,
          templateFile,
          skip: () => {
            const outputPath = `src/services/${plop.getHelper("kebabCase")(data.name)}/${plop.getHelper("camelCase")(data.name)}.service.${data.format === "typescript" ? "ts" : "js"}`;
            if (fs.existsSync(outputPath)) {
              return `Service File already exists. Skipping file creation.`;
            }
            return false; // Proceed with the action
          }
        }
      ];

      // Add Redux store logic
      const storePath = `src/store/store.${data.format === "typescript" ? "ts" : "js"}`;
      const hasStore = fs.existsSync(storePath);
      const reducerInsertRegex = /reducer:\s*{([\s\S]*?)}/;

      if (data.includeRedux && !hasStore) {
        actions.push({
          type: "add",
          path: storePath,
          templateFile:
            data.format === "typescript"
              ? "templates/services/store-ts.hbs"
              : "templates/services/store-js.hbs"
        });
      } else if (data.includeRedux && hasStore) {
        actions.push({
          type: "modify",
          path: storePath,
          pattern: /reducer:\s*{([\s\S]*?)}/,
          template: `reducer: {\n    {{camelCase name}}: {{camelCase name}}Reducer,$1}`,
          skip: () => {
            const fileContent = fs.readFileSync(storePath, "utf8");
            const reducerExists = new RegExp(
              `\\b${plop.getHelper("camelCase")(data.name)}Reducer\\b`
            ).test(fileContent);
            if (reducerExists) {
              return `Reducer for '${data.name}' already exists in the store. Skipping modification.`;
            }
            return false; // Proceed with the action
          }
        });

        actions.push({
          type: "modify",
          path: storePath,
          pattern:
            /(import\s+\{\s*configureStore\s*\}\s+from\s+['"]@reduxjs\/toolkit['"];)/,
          template: `$1\nimport {{camelCase name}}Reducer from './{{camelCase name}}Slice';`,
          skip: () => {
            const fileContent = fs.readFileSync(storePath, "utf8");
            const reducerName = plop.getHelper("camelCase")(data.name); // Get the reducer name dynamically
            const regexPattern = new RegExp(
              `import\\s+${reducerName}Reducer\\s+from\\s+['"].*${reducerName}Slice['"];`
            );
            const importExists = regexPattern.test(fileContent);

            if (importExists) {
              return `Import for '${data.name}' already exists in the store. Skipping modification.`;
            }
            return false; // Proceed with the action
          }
        });
      }
      console.log("\n\n******* Generating Service *******");
      console.log("Service name:", data.name, "\n");
      // console.log("Selected format:", data.format);
      // console.log("Selected extras:", data.extras);
      // console.log("Include Vitest:", data.includeVitest);
      // console.log("Include Redux:", data.includeRedux);
      // console.log("Use Redux Tool Kit Query:", data.useRtkQuery);
      // console.log("Data", data);

      return actions;
    }
  });
}
