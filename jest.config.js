module.exports = {
  testEnvironment: "node",
  roots: ["<rootDir>/lib", "<rootDir>/src"],
  testMatch: ["**/*.test.ts"],
  transform: {
    "^.+\\.tsx?$": "ts-jest",
  },
  collectCoverage: true,
  collectCoverageFrom: ["<rootDir>/lib/**", "<rootDir>/src/**"],
  coverageThreshold: {
    global: {
      branches: 95,
      functions: 95,
      lines: 95,
      statements: 95,
    },
  },
  errorOnDeprecated: true,
};
