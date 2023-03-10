import { dirname } from 'node:path';
import resolveModule from 'resolve';
import { build as viteBuild, Plugin, ResolvedConfig } from 'vite';
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
import transformExternal from './transform/external';
import { getPluginJSON } from './utils';


const NAME = 'preload.js'
const O_MODE = 'SSR bundle'

let localUrl = ''
export const preloadPlugin = (options: RequiredOptions): Plugin => {
  if (!options.pluginFile)
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
    // transform: (code, id) => {
    //   if (!transformFilter(id)) return code;
    //   const resolve = (sourcePath: string) => {
    //     try {
    //       return resolveModule.sync(sourcePath, {
    //         basedir: dirname(id),
    //         extensions: RESOLVE_MODULE_EXTENSIONS,
    //       });
    //     } catch (_) {
    //       return '';
    //     }
    //   };

    //   return transformExternal(code, (sourcePath) => {
    //     const resolvedPath = resolve(replaceAlias(sourcePath));
    //     return filter(resolvedPath) ? name : void 0;
    //   });
    // },
    handleHotUpdate: async ({ file, server }) => {
      if (file.includes(getDistPath(server.config, 'plugin.json'))) {
        getPluginJSON(options.pluginFile, true)
        buildPluginJson(server.config, localUrl)
      }
      if (file.includes(dirname(options.pluginFile))) await viteBuild()
    },
  };
};

export const apiExternalPlugin = (options: RequiredOptions): Plugin => {
  const { preload: { name, onGenerate } } = options
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
        if (!options.buildUpx || !options.pluginFile) return;
        await buildUpx(config.build.outDir, options, config.logger);
      }
    },
  };
};
