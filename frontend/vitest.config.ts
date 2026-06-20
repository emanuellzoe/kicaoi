import { defineConfig } from "vitest/config";
import path from "node:path";

// Vitest covers the pure logic modules under lib/ (no UI/DOM rendering).
// A lightweight localStorage stub is installed in test/setup.ts for the
// few modules that persist state in the browser.
export default defineConfig({
  test: {
    environment: "node",
    globals: true,
    setupFiles: ["./test/setup.ts"],
    include: ["test/**/*.test.ts"],
  },
  resolve: {
    alias: { "@": path.resolve(__dirname, ".") },
  },
});
