// src/setupTests.js
import { vi } from "vitest";

// Stub environment variables needed globally before tests run
vi.stubEnv("BASE_API_URL", "http://localhost:8000/");

// You can add other global setup here if needed
