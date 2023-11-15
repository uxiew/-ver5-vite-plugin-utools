import escapeRegexStr from '@jsbits/escape-regex-str';
import { build as viteBuild, Plugin, ResolvedConfig } from 'vite';
import MagicString from 'magic-string';

import buildUpx from './buildUpx';
import { FILE_NAME, SSR_MODE, UTOOLS_BUILD_MODE } from './constant';
import {
  getLocalUrl,
  isUndef,
} from './helper';
import { RequiredOptions } from './options';
import { buildPluginJson, buildPreload, getDistPath } from './prepare';
import {
  buildFile,
  // copyModules,
  generateTypes, getPluginJSON, loadPkg
} from './utils';

let localUrl = ''
export const devPlugin = (options: RequiredOptions): Plugin => {
  if (!options.configFile)
    return {
      name: 'vite:@ver5/utools-dev',
    };

  // const path = getPluginJSON().preload || ''

  return {
    name: 'vite:@ver5/utools-dev',
    config: (c) => ({
      base: isUndef(c.base) || c.base === '/' ? '' : c.base,
    }),
    configResolved: function(c) {
      const log = c.logger.info
      c.logger.info = (info) => {
        info = info.includes(SSR_MODE) ? info.replace(SSR_MODE, "uTools bundle") : info
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
    }
  };
};

export const buildPlugin = (options: RequiredOptions): Plugin => {
  const { preload: { name, onGenerate }, external } = options
  let config: ResolvedConfig

  return {
    name: 'vite:@ver5/utools-bundle',
    configResolved: (c) => {
      config = c
    },
    generateBundle(_opts, bundle) {
      if (!bundle[FILE_NAME]) return
      // @ts-expect-error it's OutputChunk
      const exportsKeys = bundle[FILE_NAME].exports
      // @ts-expect-error it's OutputChunk
      const preoloadCode = bundle[FILE_NAME].code
      delete bundle[FILE_NAME]

      return Promise.resolve().then(() => {
        const scode = new MagicString(preoloadCode);
        // clear needless code
        /* 'use strict'; 's length  &&  add const electron = require('electorn')*/
        scode.update(12, 13, name ? `;\nwindow['${name}'] = Object.create(null);\nconst electron = require('electron')\n` : '')
        scode.replaceAll("window.electron", "electron")

        // remove external `require('xxx')`
        external.forEach((mod) => {
          scode.replace(new RegExp(escapeRegexStr(`require('${mod}')`)), 'void 0')
        })

        // inject into global window
        exportsKeys.forEach((key: string) => {
          const reg = new RegExp(`exports.${key}`, 'mg')
          scode.replaceAll(reg, name ? `window['${name}'].${key}` : `window['${key}']`)
          scode.replaceAll(`defineProperty(exports, '${key}'`, `defineProperty(${name || 'window'}, '${key}'`)
        });

        // 生成 type?
        buildFile(generateTypes(name, exportsKeys), 'preload.d.ts', options)

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
      if (config.mode === UTOOLS_BUILD_MODE) return;
      buildPreload(options);
    }
  };
};

/** 构建 upx 文件 */
export const buildUpxPlugin = (options: RequiredOptions): Plugin => {
  let config: ResolvedConfig;

  return {
    name: 'vite:utools-build-upx',
    apply: 'build',
    configResolved: (c) => {
      config = c;
    },
    closeBundle: async () => {
      if (config.mode === UTOOLS_BUILD_MODE && config.isProduction) {
        buildPluginJson(config, localUrl)
        if (!options.configFile || !options.upx) return;
        await buildUpx(config.build.outDir, options, config.logger);
      }
    },
  };
};
