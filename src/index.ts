import { Plugin } from 'vite';

import { resolveOptions } from './options';
import { buildPlugin, buildUpxPlugin, devPlugin } from './plugins';
import type { Options } from './options';

export const viteUtoolsPlugin = (options: Options): Plugin[] => {
  const requiredOptions = resolveOptions(options);
  return [
    devPlugin(requiredOptions),
    buildPlugin(requiredOptions),
    buildUpxPlugin(requiredOptions),
  ];
};

export default viteUtoolsPlugin;
