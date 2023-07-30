



import { existsSync, mkdirSync, writeFileSync, copyFile } from 'node:fs';
import { basename, resolve } from 'node:path';
import { build, InlineConfig, ResolvedConfig } from 'vite';
import { UTOOLS_BUILD_MODE } from './constant';
import type { RequiredOptions } from './options';
import { getPluginJSON } from './utils';

/**
 * @description 获取文件在目标目录中的绝对路径
 */
export const getDistPath = (config: ResolvedConfig, fileName = '') => {
  return resolve(config.root, config.build.outDir, fileName)
}


export const buildConfig = (options: RequiredOptions): InlineConfig => {

  const { preload: { watch, name, minify }, external } = options;
  const path = getPluginJSON().preload
  external.unshift('electron')

  return {
    mode: UTOOLS_BUILD_MODE,
    ssr: {
      external,
    },
    plugins: [
      // viteStaticCopy({
      //   targets: [
      //     {
      //       // src: 'node_modules/@dqbd/tiktoken/dist/bundler/',
      //       src: './utools/preload/_tiktoken/_tiktoken_bg.wasm',
      //       dest: '.'
      //     }
      //   ]
      // })
    ],
    optimizeDeps: { exclude: external },
    build: {
      // @ts-ignore
      watch,
      emptyOutDir: false,
      ssr: true,
      target: `esnext`,
      minify, // process.env.MODE !== 'development',
      rollupOptions: {
        external,
        input: { preload: path },
        output: {
          format: 'cjs',
          entryFileNames: '[name].js' // '[name].cjs'
        }
      },
      reportCompressedSize: false
    }
  }
}

export async function buildPreload(options: RequiredOptions) {
  await build(buildConfig(options));
}


function copyFilesByPluginJson(config: ResolvedConfig) {
  // if (!existsSync(getDistPath(config))) mkdirSync(getDistPath(config))
  const pluginContext = getPluginJSON()
  copyFile(pluginContext.logo, resolve(getDistPath(config), basename(pluginContext.logo)), (err) => {
    if (err) throw err;
  })
}

export function buildPluginJson(config: ResolvedConfig, localUrl?: string) {
  if (!existsSync(getDistPath(config))) mkdirSync(getDistPath(config))
  writeFileSync(getDistPath(config, 'plugin.json'), JSON.stringify({
    ...getPluginJSON(),
    logo: basename(getPluginJSON().logo),
    preload: 'preload.js',
    development: {
      main: localUrl
    }
  }, null, 2), { encoding: 'utf-8' })

  copyFilesByPluginJson(config)
}
