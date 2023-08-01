
import { existsSync, mkdirSync, writeFileSync, copyFile } from 'node:fs';
import { basename, resolve } from 'node:path';
import { build, InlineConfig, ResolvedConfig, transformWithEsbuild } from 'vite';
import { FILE_NAME, UTOOLS_BUILD_MODE } from './constant';
import type { RequiredOptions } from './options';
import { getPluginJSON } from './utils';
import { createPreloadFilter, NodeBuiltin } from './helper';

/**
 * @description 获取文件在目标目录中的绝对路径
 */
export const getDistPath = (config: ResolvedConfig, fileName = '') => {
  return resolve(config.root, config.build.outDir, fileName)
}
export const getModuleName = (id: string) => {
  const lastIndex = id.lastIndexOf('node_modules');
  if (!~lastIndex) return;
  return id.slice(lastIndex + 'node_modules/'.length).match(/^(\S+?)\//)?.[1];
};

export const buildConfig = (options: RequiredOptions): InlineConfig => {

  const { preload: { watch, name, minify }, external } = options;
  const path = getPluginJSON().preload
  external.unshift('electron')
  const filter = createPreloadFilter(path)

  return {
    mode: UTOOLS_BUILD_MODE,
    build: {
      minify,
      emptyOutDir: false,
      lib: {
        entry: path,
        formats: ["cjs"],
      },
      rollupOptions: {
        external: [...NodeBuiltin, ...external],
        input: path,
        output: {
          format: 'cjs',
          entryFileNames: FILE_NAME,
          inlineDynamicImports: false,
          chunkFileNames: 'node_modules/[name].js',
          manualChunks: (id) => (filter(id) ? 'preload' : getModuleName(id) || 'lib'),
        },
      },
    },
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
