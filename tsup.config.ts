import { defineConfig, Options } from "tsup";

const common = {
  bundle: true,
  entry: ["source/bin/setup-linting.ts"],
  format: ["esm"],
  platform: "node",
  shims: true,
  splitting: false,
  target: "esnext",
  tsconfig: "tsconfig.bundle.json",
  treeshake: {
    preset: "smallest",
    moduleSideEffects: "no-external",
    correctVarValueBeforeDeclaration: true,
  },
} satisfies Options;

const library = {
  banner: {
    js: "// @ts-nocheck\n/* eslint-disable */\n",
  },
  dts: {
    only: false,
    banner: "// @ts-nocheck\n/* eslint-disable */\n",
    resolve: true,
  },
  entry: ["source/index.ts"],
  name: "library",
  outDir: "lib",
} satisfies Options;

const binaries = {
  banner: {
    js: "#!/usr/bin/env node\n// @ts-nocheck\n/* eslint-disable */\n",
  },
  dts: false,
  name: "binaries",
  outDir: "bin",
} satisfies Options;

export default defineConfig([
  {
    ...common,
    ...library,
  },
  {
    ...common,
    ...binaries,
  },
]);
