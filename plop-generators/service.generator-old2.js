export default function (plop) {
  plop.setHelper(
    "includes",
    (array, value) => Array.isArray(array) && array.includes(value)
  );

  plop.setGenerator("service", {
    description: "Scaffold a full-featured React service + slice/form/etc.",
    prompts: [
      {
        type: "input",
        name: "name",
        message: "Enter the service name (e.g. player, team):",
        validate: (val) => val.length > 0 || "Name is required",
      },
      {
        type: "list",
        name: "format",
        message: "Choose output format:",
        choices: ["typescript", "javascript"],
        default: "typescript",
      },
      {
        type: "checkbox",
        name: "extras",
        message: "Select extra API endpoints:",
        choices: [
          { name: "getAllRecordsByUser" },
          { name: "getAllRecordsByActiveSts" },
          { name: "getRecordByName" },
          { name: "patchRecordSts" },
        ],
      },
      {
        type: "confirm",
        name: "includeRedux",
        message: "Generate a Redux slice?",
        default: true,
      },
      {
        type: "confirm",
        name: "useReactQuery",
        message: "Use React Query instead of Redux?",
        default: false,
      },
      {
        type: "confirm",
        name: "includeMUI",
        message: "Generate MUI Card + Form component?",
        default: true,
      },
      {
        type: "confirm",
        name: "includeStorybook",
        message: "Include Storybook story?",
        default: true,
      },
      {
        type: "list",
        name: "integrationTest",
        message: "Integration test framework?",
        choices: ["none", "vitest-msw", "cypress"],
        default: "vitest-msw",
      },
    ],

    actions: function (data) {
      const ext = data.format === "typescript" ? "ts" : "js";
      const jsx = data.format === "typescript" ? "tsx" : "jsx";
      const path = `src/features/{{kebabCase name}}`;

      const actions = [
        {
          type: "add",
          path: `${path}/{{camelCase name}}Service.${ext}`,
          templateFile: `templates/service-${ext}.hbs`,
        },
        {
          type: "add",
          path: `${path}/{{camelCase name}}.test.${ext}`,
          templateFile: `templates/test-${ext}.hbs`,
        },
        {
          type: "add",
          path: `${path}/index.ts`,
          templateFile: "templates/index-barrel.hbs",
        },
        {
          type: "add",
          path: `${path}/README.md`,
          templateFile: "templates/feature-readme.md.hbs",
        },
      ];

      if (data.includeRedux && !data.useReactQuery) {
        actions.push({
          type: "add",
          path: `${path}/{{camelCase name}}Slice.${ext}`,
          templateFile: `templates/redux-slice-${ext}.hbs`,
        });
      }

      if (data.useReactQuery) {
        actions.push({
          type: "add",
          path: `${path}/{{camelCase name}}.queries.${ext}`,
          templateFile: `templates/react-query-service-${ext}.hbs`,
        });
      }

      if (data.includeMUI) {
        actions.push(
          {
            type: "add",
            path: `${path}/{{pascalCase name}}Card.${jsx}`,
            templateFile: `templates/{{pascalCase name}}Card.tsx.hbs`,
          },
          {
            type: "add",
            path: `${path}/{{pascalCase name}}Form.${jsx}`,
            templateFile: `templates/{{pascalCase name}}Form.tsx.hbs`,
          }
        );
      }

      if (data.includeMUI && data.includeStorybook) {
        actions.push({
          type: "add",
          path: `${path}/{{pascalCase name}}Card.stories.${jsx}`,
          templateFile: `templates/{{pascalCase name}}Card.stories.tsx.hbs`,
        });
      }

      if (data.integrationTest === "vitest-msw") {
        actions.push({
          type: "add",
          path: `${path}/{{camelCase name}}.integration.test.${ext}`,
          templateFile: `templates/{{camelCase name}}.integration.test.${ext}.hbs`,
        });

        actions.push({
          type: "add",
          path: `src/mocks/handlers.ts`,
          templateFile: `templates/handlers.ts.hbs`,
          skipIfExists: true,
        });
      }

      if (data.integrationTest === "cypress") {
        actions.push({
          type: "add",
          path: `cypress/e2e/{{camelCase name}}.cy.${ext}`,
          templateFile: `templates/{{camelCase name}}.cy.${ext}.hbs`,
        });

        actions.push({
          type: "add",
          path: `cypress.config.ts`,
          templateFile: `templates/cypress.config.ts.hbs`,
          skipIfExists: true,
        });
      }

      return actions;
    },
  });
}
