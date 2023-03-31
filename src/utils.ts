import { readFileSync, existsSync } from 'node:fs';
import { dirname, isAbsolute, resolve as resolvePath } from 'node:path';

import colors from 'picocolors';
import { normalizePath } from 'vite';

import { cwd } from './helper';
import type { PluginJSON } from './options';

const requiredKeys = [
  // 'name',
  // 'pluginName',
  // 'description',
  // 'author',
  // 'homepage',
  // 'version',
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

/**
*@description 获取 plugin json 文件
*/
export const getPluginJSON = (path?: string, reload?: boolean) => {
  // @ts-ignore
  if (reload) pluginContext = null
  if (pluginContext) return pluginContext;
  if (!path) throw new Error(`You should specify plugin.json file by configFile!`);

  const requirePath = isAbsolute(path) ? path : resolvePath(cwd, path);
  pluginContext = JSON.parse(readFileSync(requirePath, 'utf-8'));
  validatePluginOptions(pluginContext);
  if (!pluginContext.preload) console.warn("no preload file required")
  const preloadEntryFile = resolvePath(dirname(requirePath), normalizePath(pluginContext.preload));
  if (!existsSync(preloadEntryFile)) throw new Error(`[@ver5/utools]: ${preloadEntryFile} not exists, Please check if it exists!`);
  else {
    pluginContext.preload = preloadEntryFile
  }
  return pluginContext;
};
