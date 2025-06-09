#!/usr/bin/env node --experimental-transform-types --no-warnings=ExperimentalWarnings
// import { createRequire } from "node:module";
// import { inspect } from "node:util";

import type { Rule } from "eslint";

import { importOrRequire } from "../utils.ts";
// import { compile } from "json-schema-to-typescript";

// type EslintRules = typeof import("../../node_modules/eslint/lib/rules/index.js");
type RulesModule = {
  name: string;
  rules: Record<string, Rule.RuleModule>;
};

type RuleInfo = {
  name: string;
  variable: string;
  options: string[];
  description: string;
  documentation: string;
};

const modules: RulesModule[] = await Promise.all([
  getRulesModule("eslint"),
  getRulesModule("@typescript-eslint/eslint-plugin"),
]);

console.log(modules);

async function getRulesModule(name: string) {
  const mod = await importOrRequire<{ rules: Record<string, Rule.RuleModule> }>(name);

  console.log(mod);

  return {
    name,
    rules: {},
    // rules: (await importOrRequire<{ rules: Record<string, Rule.RuleModule> }>(name)).rules,
  };
}
// const require = createRequire(import.meta.url);
// const eslintRules: EslintRules = require("../../node_modules/eslint/lib/rules/index.js");
// const tsRules = require("@typescript-eslint/eslint-plugin").rules;
// const rules = processModule(Object.fromEntries(eslintRules)).concat(processModule(tsRules, "@typescript-eslint"));

function processModule({ name, rules }: RulesModule) {
  const rulesInfo: RuleInfo[] = [];

  for (const ruleName in rules) {
    const rule = rules[ruleName];
    const docs = rule.meta?.docs || {};
    const info: RuleInfo = {
      name: name === "eslint" ? ruleName : `${name}/${ruleName}`,
      options: [],
      description: docs.description || "",
      documentation: docs.url || "",
      variable: "",
    };

    info.variable = toPascalCase(info.name);

    console.log(info);
  }

  return rulesInfo;
}

function toPascalCase(text: string) {
  return text.replace(/(-|\/|@)\w/g, toUppercase).replaceAll(/-|\/|@/g, "");
}

function toUppercase(text: string) {
  return text.toUpperCase();
}

// const rulesModule = require("../../node_modules/eslint/lib/rules/index.js");
// const rules = [...rulesModule.entries()];
// const schema = rulesModule.get("no-console").meta.schema[0];
// const compiled = await compile(schema, "NoConsoleOptions");

// console.log(schema);
// console.log(compiled);
// // for (const [rule, info] of rules.slice(0, 10)) {
// //   if ("defaultOptions" in info.meta) {
// //     console.log(rule);
// //     console.log(info.meta.schema);
// //   }
// // }

// // function getRuleJsdoc(meta: object) {
// //   // const { defaultOption}
// // }
