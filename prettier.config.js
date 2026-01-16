import { prettierConfig } from "@toridoriv/eslint-config";

/**
 * @import {PrettierConfig} from "@toridoriv/eslint-config";
 */

const { printWidth, endOfLine, useTabs, ...rest } = prettierConfig;

/**
 * @type {PrettierConfig}
 */
const config = {
  ...rest,
  jsdocAllowDescriptionTag: true,
  jsdocPrintWidth: 150,
};

export default config;
