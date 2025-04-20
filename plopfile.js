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
    (array, value) => Array.isArray(array) && array.includes(value),
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
        { name: "patchRecordSts", message: "Patch Status" },
      ];

      // Use inquirer directly for fallback prompts
      const serviceName =
        args.name ||
        (
          await inquirer.prompt({
            name: "name",
            type: "input",
            message: "Enter the endpoint category (e.g. players):",
          })
        ).name;

      const format =
        args.format ||
        (
          await inquirer.prompt({
            name: "format",
            type: "list",
            message: "Select output format:",
            choices: ["typescript", "javascript"],
          })
        ).format;

      const extras = args.extra
        ? args.extra.split(",")
        : (
            await inquirer.prompt({
              name: "extras",
              type: "checkbox",
              message: "Select additional endpoints to generate:",
              choices: extraEndpoints,
            })
          ).extras;

      const includeVitest =
        args.includeVitest ||
        (
          await inquirer.prompt({
            name: "includeVitest",
            type: "confirm",
            message: "Include Vitest testing using Vi Mock?",
            default: true,
          })
        ).includeVitest;

      const includeRedux =
        args.includeRedux ||
        (
          await inquirer.prompt({
            name: "includeRedux",
            type: "confirm",
            message: "Generate a Redux slice?",
            default: true,
          })
        ).includeRedux;

      const useRtkQuery =
        args.useRtkQuery ||
        (
          await inquirer.prompt({
            name: "useRtkQuery",
            type: "confirm",
            message: "Use RTK Query instead of standard Redux slices?",
            default: false,
          })
        ).useRtkQuery;

      return {
        name: serviceName,
        format,
        extras,
        includeVitest,
        includeRedux,
        useRtkQuery,
      };
    },

    // ^ Actions to perform after the prompts
    actions: (data) => {
      const templateFile =
        data.format === "typescript"
          ? "templates/services/service-ts.hbs"
          : "templates/services/service-js.hbs";

      // Convert string values to booleans for proper evaluation in the actions
      data.includeVitest =
        data.includeVitest === true || data.includeVitest === "true";
      data.includeRedux =
        data.includeRedux === true || data.includeRedux === "true";
      data.useRtkQuery =
        data.useRtkQuery === true || data.useRtkQuery === "true";

      const actions = [
        //*  Add the main service File
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
          },
        },
      ];

      // * Add the test file
      if (data.includeVitest) {
        actions.push({
          type: "add",
          path: `src/services/{{kebabCase name}}/{{camelCase name}}.service.test.{{#if (eq format "typescript")}}ts{{else}}js{{/if}}`,
          templateFile:
            data.format === "typescript"
              ? "templates/services/test-ts.hbs"
              : "templates/services/test-js.hbs",
          skip: () => {
            const testFilePath = `src/services/${plop.getHelper("kebabCase")(data.name)}/${plop.getHelper("camelCase")(data.name)}.service.test.${data.format === "typescript" ? "ts" : "js"}`;
            if (fs.existsSync(testFilePath)) {
              return `Test file for '${data.name}' already exists. Skipping test file creation.`;
            }
            return false; // Proceed with the action
          },
        });
      }

      // * Add the "Basic" Redux slice
      if (data.includeRedux && !data.useRtkQuery) {
        actions.push({
          type: "add",
          path: `src/services/{{kebabCase name}}/{{camelCase name}}Slice.{{#if (eq format "typescript")}}ts{{else}}js{{/if}}`,
          templateFile:
            data.format === "typescript"
              ? "templates/services/redux-slice-ts.hbs"
              : "templates/services/redux-slice-js.hbs",
          skip: () => {
            const sliceFilePath = `src/services/${plop.getHelper("kebabCase")(data.name)}/${plop.getHelper("camelCase")(data.name)}Slice.${data.format === "typescript" ? "ts" : "js"}`;
            if (fs.existsSync(sliceFilePath)) {
              return `Slice file for '${data.name}' already exists. Skipping slice file creation.`;
            }
            return false; // Proceed with the action
          },
        });
      } else if (data.includeRedux && data.useRtkQuery) {
        // * Add the RTK Query API slice
        actions.push({
          type: "add",
          path: `src/services/{{kebabCase name}}/{{camelCase name}}ApiSlice.{{#if (eq format "typescript")}}ts{{else}}js{{/if}}`,
          templateFile:
            data.format === "typescript"
              ? "templates/services/rtkqApiSlice-ts.hbs"
              : "templates/services/rtkqApiSlice-js.hbs",
          skip: () => {
            const apiFilePath = `src/services/${plop.getHelper("kebabCase")(data.name)}/${plop.getHelper("camelCase")(data.name)}ApiSlice.${data.format === "typescript" ? "ts" : "js"}`;
            if (fs.existsSync(apiFilePath)) {
              return `RTK Query API file for '${data.name}' already exists. Skipping file creation.`;
            }
            return false; // Proceed with the action
          },
        });

        // * Add the RTK Query Test file
        if (data.includeVitest) {
          actions.push({
            type: "add",
            path: `src/services/{{kebabCase name}}/{{camelCase name}}ApiSlice.test.{{#if (eq format "typescript")}}ts{{else}}js{{/if}}`,
            templateFile:
              data.format === "typescript"
                ? "templates/services/rtkqApiSlice-test-ts.hbs"
                : "templates/services/rtkqApiSlice-test-js.hbs",
            skip: () => {
              const apiFilePath = `src/services/${plop.getHelper("kebabCase")(data.name)}/${plop.getHelper("camelCase")(data.name)}ApiSlice.test.${data.format === "typescript" ? "ts" : "js"}`;
              if (fs.existsSync(apiFilePath)) {
                return `RTK Query API Test file for '${data.name}' already exists. Skipping file creation.`;
              }
              return false; // Proceed with the action
            },
          });
        }
      }

      // * Add Redux store logic
      const storePath = `src/store/store.${data.format === "typescript" ? "ts" : "js"}`;
      const hasStore = fs.existsSync(storePath);
      // const reducerInsertRegex = /reducer:\s*{([\s\S]*?)}/;

      if (data.includeRedux && !hasStore) {
        actions.push({
          type: "add",
          path: storePath,
          templateFile: data.useRtkQuery
            ? data.format === "typescript"
              ? "templates/services/store-rtkq-ts.hbs"
              : "templates/services/store-rtkq-js.hbs"
            : data.format === "typescript"
              ? "templates/services/store-ts.hbs"
              : "templates/services/store-js.hbs",
        });
      } else if (data.includeRedux && hasStore) {
        // TODO: Add condition for RtkQ check here - add apiSlice and Middleware else the code below.
        if (data.useRtkQuery === true) {
          // & Add the RTKQ reducer to the store
          actions.push({
            type: "modify",
            path: storePath,
            pattern: /reducer:\s*{([\s\S]*?)}/,
            template: `reducer: {\n    [{{camelCase name}}ApiSlice.reducerPath]: {{camelCase name}}ApiSlice.reducer,$1}`,
            skip: () => {
              const fileContent = fs.readFileSync(storePath, "utf8");
              const reducerExists = new RegExp(
                `\\b${plop.getHelper("camelCase")(data.name)}ApiSlice\\b`,
              ).test(fileContent);
              if (reducerExists) {
                return `Reducer for '${data.name}' already exists in the store. Skipping modification.`;
              }
              return false; // Proceed with the action
            },
          });
          // & Add the import statement for the RTKQ reducer
          actions.push({
            type: "modify",
            path: storePath,
            pattern:
              /(import\s+\{\s*configureStore\s*\}\s+from\s+['"]@reduxjs\/toolkit['"];)/,
            template: `$1\nimport { {{camelCase name}}ApiSlice } from './{{camelCase name}}ApiSlice';`,
            skip: () => {
              const fileContent = fs.readFileSync(storePath, "utf8");
              const reducerName = plop.getHelper("camelCase")(data.name); // Get the reducer name dynamically
              const regexPattern = new RegExp(
                `import\\s+\\{\\s*${reducerName}ApiSlice\\s*\\}\\s+from\\s+['"].*${reducerName}ApiSlice['"];`,
              );
              const importExists = regexPattern.test(fileContent);

              if (importExists) {
                return `Import for '${data.name}' already exists in the store. Skipping modification.`;
              }
              return false; // Proceed with the action
            },
          });
          // & Add or Update the middleware to the storePath

          //         // ? First check if the middleware already exists and if so, simply add using .concat
          //         actions.push({
          //           type: "modify",
          //           path: storePath,
          //           pattern:
          //             /(middleware:\s*\(getDefaultMiddleware\)\s*=>\s*{[\s\S]*?getDefaultMiddleware\(\)\.concat\([\s\S]*?)\);/,
          //           template: `$1.concat({{camelCase name}}ApiSlice.middleware);`,
          //           skip: () => {
          //             const fileContent = fs.readFileSync(storePath, "utf8");
          //             const middlewareExists = new RegExp(
          //               `\\b${plop.getHelper("camelCase")(data.name)}ApiSlice\\b`,
          //             ).test(fileContent);
          //             if (middlewareExists) {
          //               return `Middleware for '${data.name}' already exists in the store. Skipping modification.`;
          //             }
          //             return false; // Proceed with the action
          //           },
          //         });

          //         actions.push({
          //           type: "modify",
          //           path: storePath,
          //           pattern:
          //             /(middleware:\s*\(getDefaultMiddleware\)\s*=>\s*{[\s\S]*?})|$/,
          //           template: `middleware: (getDefaultMiddleware) => {
          //   return getDefaultMiddleware().concat({{camelCase name}}ApiSlice.middleware);
          // }`,
          //           skip: () => {
          //             const fileContent = fs.readFileSync(storePath, "utf8");
          //             const middlewareExists = new RegExp(
          //               `\\b${plop.getHelper("camelCase")(data.name)}ApiSlice\\b`,
          //             ).test(fileContent);
          //             if (middlewareExists) {
          //               return `Middleware for '${data.name}' already exists in the store. Skipping modification.`;
          //             }
          //             return false; // Proceed with the action
          //           },
          //         });
        } else {
          // & Add the standard reducer to the store
          actions.push({
            type: "modify",
            path: storePath,
            pattern: /reducer:\s*{([\s\S]*?)}/,
            template: `reducer: {\n    {{camelCase name}}: {{camelCase name}}Reducer,$1}`,
            skip: () => {
              const fileContent = fs.readFileSync(storePath, "utf8");
              const reducerExists = new RegExp(
                `\\b${plop.getHelper("camelCase")(data.name)}Reducer\\b`,
              ).test(fileContent);
              if (reducerExists) {
                return `Reducer for '${data.name}' already exists in the store. Skipping modification.`;
              }
              return false; // Proceed with the action
            },
          });

          // & Add the import statement for the standard reducer
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
                `import\\s+${reducerName}Reducer\\s+from\\s+['"].*${reducerName}Slice['"];`,
              );
              const importExists = regexPattern.test(fileContent);

              if (importExists) {
                return `Import for '${data.name}' already exists in the store. Skipping modification.`;
              }
              return false; // Proceed with the action
            },
          });
        }
      }

      // * Add the Provider wrapper to the Main file
      const mainPath = `src/main.${data.format === "typescript" ? "tsx" : "jsx"}`;
      const hasMain = fs.existsSync(mainPath);

      if (data.includeRedux && hasMain) {
        const mainContent = fs.readFileSync(mainPath, "utf8");
        if (
          !mainContent.includes("Provider") &&
          !mainContent.includes("store")
        ) {
          actions.push({
            type: "modify",
            path: mainPath,
            pattern: /[\s\S]*/, // match entire file
            templateFile: "templates/services/provider-wrap.hbs",
          });
        }
      }

      // * Add the Typed Redux Hooks file for Redux
      const hooksPath = "src/store/hooks.ts";
      const hasHooks = fs.existsSync(hooksPath);

      if (data.includeRedux && data.format === "typescript" && !hasHooks) {
        actions.push({
          type: "add",
          path: hooksPath,
          templateFile: "templates/services/hooks-ts.hbs",
        });
      }

      console.log("\n\n******* Generating Service *******");
      console.log("Service name:", data.name, "\n");
      console.log("Selected format:", data.format);
      console.log("Selected extras:", data.extras);
      console.log("Include Vitest:", data.includeVitest);
      console.log("Include Redux:", data.includeRedux);
      console.log("Use Redux Tool Kit Query:", data.useRtkQuery);
      // console.log("Data", data);

      return actions;
    },
  });
}
