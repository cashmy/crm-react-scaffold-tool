#!/usr/bin/env node
import fs from "fs";
import inquirer from "inquirer";
import chalk from "chalk";
import plop from "plop";

const capitalize = (str) => str.charAt(0).toUpperCase() + str.slice(1);

plop.setHelper("includes", (array, value) => {
  return Array.isArray(array) && array.includes(value);
});

const endpointPrompts = [
  { name: "getAllRecordsByUser", message: "Filter by User" },
  { name: "getAllRecordsByActiveSts", message: "Filter by Status" },
  { name: "getRecordByName", message: "Get by Name" },
  { name: "patchRecordSts", message: "Patch Status" }
];

const generateService = (name, selectedEndpoints) => {
  const className = capitalize(name) + "Service";
  const apiUrl = `\${baseUrl}${name}/`;

  const optionalMethods = {
    getAllRecordsByUser: `
  getAllRecordsByUser = (userId = 1) => {
    return axios.get(API_URL + \`user/\${userId}\`, { headers: authHeader() });
  };`,
    getAllRecordsByActiveSts: `
  getAllRecordsByActiveSts = (status) => {
    return axios.get(API_URL + \`archive/\${status}\`, { headers: authHeader() });
  };`,
    getRecordByName: `
  getRecordByName = (name) => {
    return axios.get(API_URL + \`name/\${name}/\`, { headers: authHeader() });
  };`,
    patchRecordSts: `
  patchRecordSts = (id, sts) => {
    return axios
      .patch(API_URL + \`\${id}/\${sts}\`, { headers: authHeader() })
      .then((response) => response.data);
  };`
  };

  const selectedMethods = selectedEndpoints
    .map((key) => optionalMethods[key])
    .join("\n");

  return `import axios from 'axios';
import authHeader from "./authHeader";

const baseUrl = process.env.NEXT_PUBLIC_BASE_API_URL;
const API_URL = ${apiUrl};

class ${className} {
  getAllRecords = () => {
    return axios.get(API_URL, { headers: authHeader() });
  };

  getRecordById = (id) => {
    return axios.get(API_URL + \`\${id}/\`, { headers: authHeader() });
  };

  addRecord = (data) => {
    return axios.post(API_URL, data, { headers: authHeader() });
  };

  updateRecord = (data) => {
    return axios
      .put(API_URL + \`\${data.id}/\`, data, { headers: authHeader() })
      .then((response) => response.data);
  };

  deleteRecord = (id) => {
    return axios
      .delete(API_URL + \`\${id}\`, { headers: authHeader() })
      .then((response) => response.data);
  };

  ${selectedMethods}
}

export default new ${className}();
`;
};

(async () => {
  const { serviceName } = await inquirer.prompt({
    name: "serviceName",
    type: "input",
    message: "Enter the endpoint category (e.g. 'players'):"
  });

  const { extras } = await inquirer.prompt({
    name: "extras",
    type: "checkbox",
    message: "Select additional endpoints to generate:",
    choices: endpointPrompts
  });

  const code = generateService(serviceName, extras);
  const filename = `${capitalize(serviceName)}Service.js`;
  fs.writeFileSync(filename, code);

  console.log(chalk.green(`✅ ${filename} generated successfully.`));
})();
