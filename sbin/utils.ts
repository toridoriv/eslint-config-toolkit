export { is } from "../source/utils/predicates.ts";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);

export async function importOrRequire<T>(path: string): Promise<T> {
  let mod: any = {};

  try {
    mod = await import(path);
  } catch {
    mod = require(path);
  }

  let hasDefault = "default" in mod;

  return hasDefault ? mod.default : mod;
}

/**
 * Transforms the first letter of a sentence to uppercase.
 *
 * @param value - The text to transform.
 */
export function capitalizeText(value: string) {
  return value
    .replace(/[a-zñáéíóúü]/i, function (letter) {
      return letter.toUpperCase();
    })
    .trim();
}

/**
 * If a text doesn't end with a period, it appends one at the end.
 *
 * @param value - The text to transform.
 */
export function appendPeriodToText(value: string) {
  return value.endsWith(".") ? value : `${value}.`;
}
