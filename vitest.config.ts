import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    coverage: {
      clean: true,
      enabled: false,
      cleanOnRerun: true,
      include: ["source/**"],
    },
    watch: false,
    reporters: ["verbose"],
  },
});
