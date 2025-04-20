// vitest.config.js or vite.config.js
import { defineConfig } from "vitest/config"; // Or from 'vite'

export default defineConfig({
  // ... other configurations ...
  test: {
    globals: true,
    environment: "jsdom",
    setupFiles: "./src/setupTests.js", // <--- Add this line
    // ... other test configurations ...
  },
});
