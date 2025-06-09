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
