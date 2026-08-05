import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig({
  plugins: [react(), tsconfigPaths()],
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: ["./vitest.setup.ts"],
    include: ["src/**/*.{test,spec}.{ts,tsx}"],
    coverage: {
      provider: "v8",
      // "text" prints a summary in the terminal; "html" writes a browsable
      // report to ./coverage/index.html.
      reporter: ["text", "html"],
      include: ["src/**/*.{ts,tsx}"],
      exclude: [
        "src/**/*.{test,spec}.{ts,tsx}",
        "src/**/index.ts", // barrel re-exports only
        "src/**/types.ts", // type declarations have no runtime to cover
        "src/app/\\[lang\\]/layout.tsx", // framework shell
      ],
    },
  },
});
