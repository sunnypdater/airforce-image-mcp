import js from "@eslint/js";
import tsPlugin from "@typescript-eslint/eslint-plugin";
import tsParser from "@typescript-eslint/parser";
import globals from "globals";

export default [
  js.configs.recommended,
  {
    files: ["src/**/*.ts"],
    languageOptions: {
      parser: tsParser,
      parserOptions: { project: "./tsconfig.json" },
      globals: { ...globals.node },
    },
    plugins: { "@typescript-eslint": tsPlugin },
    rules: {
      "@typescript-eslint/no-explicit-any": "error",
      "no-console": "error",
      "@typescript-eslint/no-floating-promises": "error",
      "no-unused-vars": "off",
      "@typescript-eslint/no-unused-vars": "error",
    },
  },
];
