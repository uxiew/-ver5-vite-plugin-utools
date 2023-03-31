import { dirname } from 'node:path';
import escapeRegexStr from '@jsbits/escape-regex-str';
import { build as viteBuild, createServer, Plugin, ResolvedConfig } from 'vite';
import MagicString from 'magic-string';

import buildUpx from './buildUpx';
import { BUILD_UTOOLS_MODE } from './constant';
import {
  createPreloadFilter,
  createReplaceAlias,
  getLocalUrl,
  isUndef,
  ReplaceAlias,
  RESOLVE_MODULE_EXTENSIONS,
  transformFilter,
} from './helper';
import { RequiredOptions } from './options';
import { buildPluginJson, buildPreload, getDistPath } from './prepare';
import { getPluginJSON } from './utils';


const NAME = 'preload.js'
const O_MODE = 'SSR bundle'

let localUrl = ''
export const preloadPlugin = (options: RequiredOptions): Plugin => {
  if (!options.configFile)
    return {
      name: 'vite:utools-preload',
    };

  const { preload: { name } } = options;

  const path = getPluginJSON().preload || ''
  const filter = createPreloadFilter(path);

  let replaceAlias: ReplaceAlias = (path) => path;

  return {
    name: 'vite:utools-preload',
    config: (c) => ({
      base: isUndef(c.base) || c.base === '/' ? '' : c.base,
    }),
    configResolved: function (c) {
      replaceAlias = createReplaceAlias(c.resolve.alias);

      const log = c.logger.info
      c.logger.info = (info) => {
        info = info.includes(O_MODE) ? info.replace(O_MODE, "uTools boundle") : info
        if (info.includes('Local')) {
          buildPluginJson(c, localUrl = getLocalUrl(info))
        }
        log(info)
      }
      if (c.command === 'serve') {
        buildPreload(options)
      } else {
        options.preload.watch = false
      }
    },
    handleHotUpdate: async ({ file, server }) => {
      if (file.includes(getDistPath(server.config, 'plugin.json'))) {
        getPluginJSON(options.configFile, true)
        buildPluginJson(server.config, localUrl)
      }
      if (file.includes(dirname(options.configFile))) await viteBuild()
    },
  };
};

export const apiExternalPlugin = (options: RequiredOptions): Plugin => {
  const { preload: { name, onGenerate }, external } = options
  let config: ResolvedConfig

  return {
    name: 'vite:utools-api',
    configResolved: (c) => {
      config = c
    },
    generateBundle(_opts, bundle) {
      if (!bundle[NAME]) return
      // @ts-expect-error it's OutputChunk
      const exportsKeys = bundle[NAME].exports
      // @ts-expect-error it's OutputChunk
      const preoloadCode = bundle[NAME].code
      delete bundle[NAME]

      Promise.resolve().then(() => {
        const scode = new MagicString(preoloadCode);
        // clear needless code
        scode.update(13, 14, name ? `\nwindow['${name}'] = Object.create(null);\n` : '')

        // remove externals `require('xxx')`
        external.forEach((mod) => {
          scode.replace(new RegExp(escapeRegexStr(`require('${mod}')`)), 'void 0')
        })

        // inject into global window
        exportsKeys.forEach((key: string) => {
          const reg = new RegExp(`^exports.${key}`, 'mg')
          scode.replaceAll(reg, name ? `window['${name}'].${key}` : `window['${key}']`)
          scode.replaceAll(`defineProperty(exports, '${key}'`, `create(${name || 'window'}, '${key}'`)
        });

        // @ts-expect-error onGenerate is function
        const source = onGenerate ? onGenerate.call(scode, scode.toString()) : scode.toString()
        this.emitFile({
          type: 'asset',
          fileName: 'preload.js',
          name: 'preload.js',
          source
        })
      })
    },
    closeBundle() {
      if (config.mode === BUILD_UTOOLS_MODE) return;
      buildPreload(options);
    }
  };
};

export const buildUpxPlugin = (options: RequiredOptions): Plugin => {
  let config: ResolvedConfig;

  return {
    name: 'vite:utools-build-upx',
    apply: 'build',
    configResolved: (c) => {
      config = c;
    },
    closeBundle: async () => {
      if (config.mode === BUILD_UTOOLS_MODE && config.isProduction) {
        buildPluginJson(config, localUrl)
        if (!options.buildUpx || !options.configFile) return;
        await buildUpx(config.build.outDir, options, config.logger);
      }
    },
  };
};
