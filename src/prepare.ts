
import { existsSync, mkdirSync, writeFileSync, copyFile, readFileSync } from 'node:fs';
import { basename, resolve } from 'node:path';
import { ResolvedConfig } from 'vite';
import { OptionsResolver } from './options';

/**
 * @description 获取构建输出目录中的文件路径
 * @param config Vite 配置对象
 * @param fileName 文件名（可选）
 * @returns 文件在目标目录中的绝对路径
 */
export const getDistPath = (config: ResolvedConfig, fileName = '') => {
  return resolve(config.root, config.build.outDir, fileName)
}

/**
 * @description 获取 node_modules 中的模块名
 * @param id 模块路径（例如：/xxx/node_modules/locad/index.js）
 * @returns 模块名（例如：locad）
 */
export const getNodeModuleName = (id: string) => {
  const lastIndex = id.lastIndexOf('node_modules');
  if (!~lastIndex) return;
  return id.slice(lastIndex + 'node_modules/'.length).match(/^(\S+?)\//)?.[1];
};

export function copyUpxsFiles(config: ResolvedConfig) {
  // if (!existsSync(getDistPath(config))) mkdirSync(getDistPath(config))
  const { logo } = OptionsResolver.upxsData
  copyFile(logo, resolve(getDistPath(config), basename(logo)), (err) => {
    if (err) throw err;
  })
}

export function writeUpxsFiles(config: ResolvedConfig, localUrl?: string) {
  if (!existsSync(getDistPath(config))) mkdirSync(getDistPath(config))
  writeFileSync(getDistPath(config, 'plugin.json'), JSON.stringify({
    ...OptionsResolver.upxsData,
    logo: basename(OptionsResolver.upxsData.logo),
    preload: 'preload.js',
    development: {
      main: localUrl
    }
  }, null, 2), { encoding: 'utf-8' })
}
