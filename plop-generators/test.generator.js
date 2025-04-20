export default function (plop) {
  plop.setGenerator("test", {
    description: "A test generator",
    prompts: [
      {
        type: "input",
        name: "name",
        message: "Enter a name:",
      },
    ],
    actions: [
      {
        type: "add",
        path: "output/{{name}}.txt",
        template: "Hello, {{name}}!",
      },
    ],
  });
}
