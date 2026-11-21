import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";

export default defineConfig({
  resolve: {
    alias: { "@": fileURLToPath(new URL("./src", import.meta.url)) },
  },
  test: {
    environment: "jsdom",
    include: ["src/**/*.test.{ts,tsx}", "scripts/**/*.test.mjs"],
    setupFiles: ["./vitest.setup.ts"],
    // next-intl's navigation imports "next/navigation" without an extension, which
    // Node's ESM resolver rejects; inlining lets Vite resolve it.
    server: { deps: { inline: ["next-intl"] } },
  },
});
