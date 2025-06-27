import { defineVitestConfig } from "@nuxt/test-utils/config"
import { fileURLToPath } from "node:url"

export default defineVitestConfig({
  test: {
    environment: "nuxt",
    globals: true,
    include: ["tests/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}"],
    exclude: [
      "**/node_modules/**",
      "**/dist/**",
      "**/cypress/**",
      "**/.{idea,git,cache,output,temp}/**",
    ],
    setupFiles: ["./tests/setup.ts"],
  },
  resolve: {
    alias: {
      "~": fileURLToPath(new URL("./", import.meta.url)),
      "@": fileURLToPath(new URL("./", import.meta.url)),
    },
  },
  esbuild: {
    target: "node14",
  },
})
