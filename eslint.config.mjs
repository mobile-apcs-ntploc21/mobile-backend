import tslint from "typescript-eslint";
import prettier from "eslint-config-prettier";
import prettierPlugin from "eslint-plugin-prettier";
import globals from "globals";

export default [
  { files: ["**/*.{js,mjs,cjs,ts}"] },
  { languageOptions: { globals: globals.browser } },
  ...tslint.configs.recommended,
  prettier,
  {
    plugins: { prettier: prettierPlugin },
    rules: {
      "prettier/prettier": "error",
      "no-console": "off",
      "no-shadow": "off",
      "prefer-const": "off",
      "@typescript-eslint/triple-slash-reference": "off",
      "@typescript-eslint/no-empty-interface": "off",
      "@typescript-eslint/no-unsafe-function-type": "off",
      "@typescript-eslint/ban-ts-comment": "off",
      "@typescript-eslint/no-explicit-any": "off",
      "@typescript-eslint/no-unused-vars": "off",
      "eslint/no-explicit-any": "off",
      "eslint/no-unused-vars": "off",
    },
  },
];
