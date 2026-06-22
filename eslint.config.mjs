import nextVitals from "eslint-config-next/core-web-vitals"
import eslintConfigPrettier from "eslint-config-prettier"

const eslintConfig = [
  {
    ignores: [
      ".next/**",
      "node_modules/**",
      "out/**",
      "public/sw.js",
      "playwright-report/**",
      "test-results/**",
    ],
  },
  ...nextVitals,
  eslintConfigPrettier,
  {
    rules: {
      "react-hooks/set-state-in-effect": "off",
      "react-hooks/purity": "off",
      "react-hooks/incompatible-library": "warn",
    },
  },
]

export default eslintConfig
