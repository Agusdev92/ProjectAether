import eslint from "@eslint/js";
import prettier from "eslint-config-prettier";
import tseslint from "typescript-eslint";

export default tseslint.config(
  {
    ignores: ["dist/**", "node_modules/**", "coverage/**"]
  },
  eslint.configs.recommended,
  ...tseslint.configs.strict,
  prettier,
  {
    files: ["client/src/**/*.ts", "vite.config.ts"],
    languageOptions: {
      parserOptions: {
        projectService: {
          allowDefaultProject: ["vite.config.ts"]
        },
        tsconfigRootDir: import.meta.dirname
      },
      globals: {
        console: "readonly",
        document: "readonly",
        globalThis: "readonly",
        window: "readonly"
      }
    },
    rules: {
      "@typescript-eslint/consistent-type-imports": [
        "error",
        {
          prefer: "type-imports"
        }
      ],
      "@typescript-eslint/no-import-type-side-effects": "error"
    }
  }
);
