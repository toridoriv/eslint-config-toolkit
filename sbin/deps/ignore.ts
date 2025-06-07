#!/usr/bin/env node --experimental-transform-types --no-warnings=ExperimentalWarnings --env-file-if-exists=.env
import * as fsplus from "@toridoriv/fs-plus";

const tsNoCheck = "// @ts-nocheck";
const files = fsplus.readdir("node_modules", {
  depth: 5,
  filter(path) {
    return /^.*\.(ts|js|mts|mjs|cjs)$/.test(path);
  },
});

console.info(`${files.length} TypeScript/JavaScript files found.`);

const toModify = files.filter(isMissingTsIgnore);

console.info(`${toModify.length} of them are missing the ${tsNoCheck} comment. Modifying...`);

for (const file of toModify) {
  prependTsNoCheck(file);
}

console.info("All done!");

function isMissingTsIgnore(file: fsplus.TextFile) {
  return !file.content.includes(tsNoCheck);
}

function prependTsNoCheck(file: fsplus.TextFile) {
  if (file.content.startsWith("#!")) return;
  file.content = `${tsNoCheck}\n${file.content}`;
  file.write();
}
