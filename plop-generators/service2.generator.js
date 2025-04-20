import inquirer from "inquirer";
import fs from "fs";
import minimist from "minimist";

export default function (plop) {
  plop.setGenerator("service", {
    description: "Generate a CRUD axios service for a React project",
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

      return { name: serviceName, format, extras };
    },
    actions: (data) => {
      const templateFile =
        data.format === "typescript"
          ? "templates/service-ts.hbs"
          : "templates/service-js.hbs";

      return [
        {
          type: "add",
          path: `src/services/{{pascalCase name}}Service.{{#if (eq format "typescript")}}ts{{else}}js{{/if}}`,
          templateFile,
        },
      ];
    },
  });
}
