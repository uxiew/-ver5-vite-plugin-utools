import { readFileSync, existsSync, writeFileSync } from 'node:fs';
import { basename, dirname, resolve, resolve as resolvePath } from 'node:path';
import colors from 'picocolors';
import { cwd } from './helper';
import { OptionsResolver, UpxsJSON } from './options';

export function validatePluginJson(options: UpxsJSON) {
  const DOC_URL = 'https://www.u-tools.cn/docs/developer/information/plugin-json.html';

  const requiredKeys = [
    'name',
    'pluginName',
    'description',
    'author',
    // 'homepage',
    'version',
    'logo',
    'features',
  ] as const;

  if (!options.preload) console.warn("no preload file required")
  const pkg = loadPkg() as any

  requiredKeys.forEach((key) => {
    if (!options[key]) {
      options[key] = pkg[key]
      if ('pluginName' === key) options[key] = options['name'].replace(/@\//, '_')
    }
    if (!options[key]) throw new Error(colors.red(`[uTools]: 必须有插件字段 ${key}, 查看: ${colors.bold(DOC_URL)}`));
  });
};

export function loadPkg(dep = false): string[] | object {
  const pkg = JSON.parse(readFileSync(resolvePath(cwd, 'package.json'), 'utf8'))
  return dep ? [...Object.keys(pkg["devDependencies"]), ...Object.keys(pkg["dependencies"])] : pkg
}

/**
 * @description fs 异步生产新的文件，与 preload 在同级目录
 */
export function buildTsd(content: string, filename: string) {
  colors.green(`[uTools]: 生成 ${filename} 类型声明文件`)
  writeFileSync(resolve(dirname(OptionsResolver.upxsData.preload), filename), content)
}

/**
 * @description 生成 tsd 类型声明文件
 * @param {string} name window上的挂载名（例如 preload）
 */
export function generateTypes(name: string) {
  let typesContent = `// 该类型定义文件由 @ver5/vite-plugin-utools 自动生成
// 请不要更改这个文件！
import type defaultExport from './preload'
import type * as namedExports from './preload'

export type PreloadDefaultType = typeof defaultExport
export type PreloadNamedExportsType = typeof namedExports

export interface ExportsTypesForMock {
    window: PreloadDefaultType,
    ${name}: PreloadNamedExportsType,
}

declare global {
  interface Window extends PreloadDefaultType {
    ${name}: PreloadNamedExportsType;
  }
}
`
  return typesContent;
}
