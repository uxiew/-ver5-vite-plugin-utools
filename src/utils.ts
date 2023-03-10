import { readFileSync } from 'node:fs';
import { dirname, isAbsolute, resolve as resolvePath } from 'node:path';

import colors from 'picocolors';
import { normalizePath } from 'vite';

import { cwd } from './helper';
import type { PluginJSON } from './options';

const requiredKeys = [
  'name',
  'pluginName',
  'description',
  'author',
  'homepage',
  'version',
  'logo',
  'features',
] as const;
const DOC_URL = 'https://www.u.tools/docs/developer/config.html#基本配置';

const validatePluginOptions = (options: PluginJSON) => {
  requiredKeys.forEach((key) => {
    if (!options[key]) throw new Error(colors.red(`plugin ${key} is required,see: ${colors.bold(DOC_URL)}`));
  });
};

let pluginContext: Required<PluginJSON>

export const getPluginJSON = (path?: string, reload?: boolean) => {
  // @ts-ignore
  if (reload) pluginContext = null
  if (pluginContext) return pluginContext;
  if (!path) throw new Error(`You should specify a plugin file by pluginFile!`);

  const requirePath = isAbsolute(path) ? path : resolvePath(cwd, path);
  pluginContext = JSON.parse(readFileSync(requirePath, 'utf-8'));
  validatePluginOptions(pluginContext);
  if (!pluginContext.preload) console.warn("no preload file required")
  else {
    pluginContext.preload = resolvePath(dirname(requirePath), normalizePath(pluginContext.preload));
  }
  return pluginContext;
};
