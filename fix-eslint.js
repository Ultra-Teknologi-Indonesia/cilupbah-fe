import fs from 'fs';
const content = fs.readFileSync('eslint.config.mjs', 'utf8');
const newContent = content.replace(
  'const eslintConfig = defineConfig([',
  `const eslintConfig = defineConfig([\n  {\n    rules: {\n      "@typescript-eslint/no-unused-vars": [\n        "warn",\n        {\n          argsIgnorePattern: "^_",\n          varsIgnorePattern: "^_",\n          caughtErrorsIgnorePattern: "^_",\n        }\n      ]\n    }\n  },`
);
fs.writeFileSync('eslint.config.mjs', newContent);
