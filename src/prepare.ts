



import { existsSync, mkdirSync, writeFile, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { build, InlineConfig, ResolvedConfig, ViteDevServer } from 'vite';
import { BUILD_UTOOLS_MODE } from './constant';
import { createPreloadFilter } from './helper';
import type { RequiredOptions } from './options';
import { getPluginJSON } from './utils';

export const getDistPath = (config: ResolvedConfig, fileName = '') => {
  return resolve(config.root, config.build.outDir, fileName)
}


export const buildConfig = (options: RequiredOptions): InlineConfig => {

  const { preload: { watch, name, minify }, external } = options;


  const path = getPluginJSON().preload

  return {
    mode: BUILD_UTOOLS_MODE,
    ssr: {
      format: "cjs",
      external,
    },
    resolve: {
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


export function buildPluginJson(config: ResolvedConfig, localUrl?: string) {
  if (!existsSync(getDistPath(config))) mkdirSync(getDistPath(config))
  writeFileSync(getDistPath(config, 'plugin.json'), JSON.stringify({
    ...getPluginJSON(),
    preload: 'preload.js',
    development: {
      main: localUrl
    }
  }, null, 2), { encoding: 'utf-8' })
}
