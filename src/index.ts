import { Plugin } from 'vite';

import { resolveOptions } from './options';
import { apiExternalPlugin, buildUpxPlugin, preloadPlugin } from './plugins';
import type { Options } from './options';

export const viteUtoolsPlugin = (options: Options): Plugin[] => {
  const requiredOptions = resolveOptions(options);
  return [
    preloadPlugin(requiredOptions),
    apiExternalPlugin(requiredOptions),
    buildUpxPlugin(requiredOptions),
  ];
};

export default viteUtoolsPlugin;
