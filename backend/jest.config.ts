// jest.config.ts
import type { Config } from "@jest/types";

const config: Config.InitialOptions = {
  // Define separate projects for unit, integration, and e2e tests
  projects: [
    {
      displayName: "unit",
      testMatch: ["<rootDir>/test/unit/**/*.spec.ts"],
      transform: {
        "^.+\\.ts$": ["ts-jest", { useESM: true }],
      },
      testEnvironment: "node",
      extensionsToTreatAsEsm: [".ts"],
      moduleNameMapper: {
        "^@db/(.*)$": "<rootDir>/src/db/$1",
        "^@room/(.*)$": "<rootDir>/src/room/$1",
        "^src/(.*)$": "<rootDir>/src/$1",
        "^(\\.{1,2}/.*)\\.js$": "$1",
      },
    },
    {
      displayName: "integration",
      testMatch: ["<rootDir>/test/integration/**/*.int-spec.ts"],
      transform: {
        "^.+\\.ts$": ["ts-jest", { useESM: true }],
      },
      testEnvironment: "node",
      extensionsToTreatAsEsm: [".ts"],
      moduleNameMapper: {
        "^@db/(.*)$": "<rootDir>/src/db/$1",
        "^@room/(.*)$": "<rootDir>/src/room/$1",
        "^src/(.*)$": "<rootDir>/src/$1",
        "^(\\.{1,2}/.*)\\.js$": "$1",
      },
    },
    {
      displayName: "e2e",
      testMatch: ["<rootDir>/test/e2e/**/*.e2e-spec.ts"],
      transform: {
        "^.+\\.ts$": ["ts-jest", { useESM: true }],
      },
      testEnvironment: "node",
      extensionsToTreatAsEsm: [".ts"],
      moduleNameMapper: {
        "^@db/(.*)$": "<rootDir>/src/db/$1",
        "^@room/(.*)$": "<rootDir>/src/room/$1",
        "^src/(.*)$": "<rootDir>/src/$1",
        "^(\\.{1,2}/.*)\\.js$": "$1",
      },
    },
  ],
};

export default config;
