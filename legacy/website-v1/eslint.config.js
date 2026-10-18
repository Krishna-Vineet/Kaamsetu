import globals from "globals";
import pluginJs from "@eslint/js";


/** @type {import('eslint').Linter.Config[]} */
export default [
  {languageOptions: {
    globals: globals.node,
    parserOptions: {
      ecmaVersion: "latest", // Supports the latest ECMAScript features
      sourceType: "module",  // For ES modules (import/export syntax)
    },
  }},
  pluginJs.configs.recommended,
];