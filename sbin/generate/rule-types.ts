#!/usr/bin/env -S node --experimental-transform-types --no-warnings=ExperimentalWarnings
import type { Rule } from "eslint";
import { ESLint } from "eslint";
import { compile, type JSONSchema } from "json-schema-to-typescript";

import { appendPeriodToText, capitalizeText, importOrRequire, is } from "../utils.ts";

type PluginRules = {
  module: string;
  id?: string | undefined;
  rules: Record<string, Rule.RuleModule>;
};

type RulesModule = Record<string, Rule.RuleModule>;
type EslintRulesModule = Map<string, Rule.RuleModule>;

type RuleInfo = {
  name: string;
  variable: string;
  options: Record<string, string>;
  description: string;
  documentation: string;
};

const eslint = new ESLint({});
const eslintPlugin = ["../node_modules/eslint/lib/rules/index.js", undefined] as [string, string | undefined];
const plugins = [eslintPlugin].concat(
  await getPlugins(
    eslint,
    ["js", "mjs", "cjs", "ts", "mts", "cts", "css", "html", "json", "jsonc", "yaml", "yml", "md"],
    { "@typescript-eslint": "@typescript-eslint/eslint-plugin" },
  ),
);

const modules: PluginRules[] = await Promise.all(plugins.map((args) => getRulesModule(...args)));
const rulesInfo: RuleInfo[] = (await Promise.all(modules.map(getRulesInfo))).flat();

console.log(rulesInfo.slice(200));

async function getRulesModule(name: string, id?: string): Promise<PluginRules> {
  const mod = await importOrRequire<EslintRulesModule | { rules: RulesModule }>(name);
  let rules: RulesModule;

  if (mod instanceof Map) {
    rules = Object.fromEntries(mod);
  } else {
    rules = mod.rules || {};
  }

  return {
    module: name,
    id,
    rules,
  };
}

async function getPlugins(eslint: ESLint, extensions: string[], nameMap: Record<string, string>) {
  const plugins = new Map<string, string>();

  for (const extension of extensions) {
    const config = await eslint.calculateConfigForFile(`sample.${extension}`);

    if (!config) continue;

    const names = Object.keys(config.plugins || {});

    for (const name of names) {
      if (name === "@") continue;

      let importName = nameMap[name] || name;

      if (!importName.startsWith("@")) {
        importName = `eslint-plugin-${importName}`;
      }

      if (plugins.has(importName)) continue;

      plugins.set(importName, name);
    }
  }

  return Array.from(plugins);
}

async function getRulesInfo(pluginRules: PluginRules): Promise<RuleInfo[]> {
  const rulesInfo: RuleInfo[] = [];

  for (const [ruleName, rule] of Object.entries(pluginRules.rules)) {
    if (rule.meta?.deprecated) continue;

    const docs = rule.meta?.docs || {};

    if (docs.description) {
      docs.description = appendPeriodToText(docs.description);
    }

    const info: RuleInfo = {
      name: pluginRules.id ? `${pluginRules.id}/${ruleName}` : ruleName,
      options: {},
      description: docs.description || "",
      documentation: docs.url || "",
      variable: toPascalCase(pluginRules.id ? `${pluginRules.id}/${ruleName}` : ruleName),
    };

    if (rule.meta?.schema) {
      const schemas = Array.isArray(rule.meta.schema) ? rule.meta.schema : [rule.meta.schema];

      schemas.forEach(fixSchema);

      for (let i = 0; i < schemas.length; i++) {
        const schema = schemas[i];
        const typeName = schemas.length > 1 ? `${info.variable}${i + 1}` : info.variable;
        const type = await compile(schema, typeName, { bannerComment: "" });

        info.options[typeName] = type;
      }
    }

    rulesInfo.push(info);
  }

  return rulesInfo;
}

function toPascalCase(text: string) {
  const parts = text.replaceAll("@", "").replaceAll("/", "-").split("-");

  return parts.map(capitalizeText).join("");
}

function fixSchema(schema: JSONSchema): JSONSchema {
  // schema.definitions = schema.definitions || schema.$defs;

  fixReferences(schema);

  return schema;
}

function fixReferences<T extends object>(obj: T): T {
  if (!is.object(obj)) return obj;

  for (const key in obj) {
    const value = obj[key];

    if (is.object(value)) {
      obj[key] = fixReferences(value);
    } else if (is.array(value)) {
      // @ts-ignore
      obj[key] = value.map(fixReferences);
    } else if (key === "$ref" && typeof value === "string") {
      // @ts-ignore
      obj[key] = value.replaceAll("#/items/0/$defs", "#/$defs");
    }
  }

  return obj;
}
