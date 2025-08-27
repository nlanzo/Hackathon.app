import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  ...compat.extends("next/core-web-vitals", "next/typescript"),
  {
    ignores: [
      "**/*.test.ts",
      "**/*.test.tsx", 
      "**/*.spec.ts",
      "**/*.spec.tsx",
      "src/test/**/*",
      "**/test/**/*",
      "**/__tests__/**/*",
      "**/coverage/**/*",
      "vitest.config.ts",
      "tsconfig.test.json"
    ]
  }
];

export default eslintConfig;
