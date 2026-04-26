import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
  ]),
  // 2026-04-26: react-hooks v7에 추가된 set-state-in-effect 규칙은
  // React 공식 doc이 권장하는 정당한 mount-init / external store sync
  // 패턴까지 차단함. false-positive가 다수라 비활성. 향후
  // useSyncExternalStore 마이그레이션 시 다시 활성 검토.
  {
    rules: {
      "react-hooks/set-state-in-effect": "off", "react-hooks/error-boundaries": "off",
    },
  },
]);

export default eslintConfig;
