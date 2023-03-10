import type MagicString from 'magic-string';
import { Data, isObject, isUndef } from './helper';
import { getPluginJSON } from './utils';

export interface PreloadOptions {
  watch?: boolean;
  name?: string;
  minify?: boolean;
  onGenerate?: (this: MagicString, code: string) => string
}

export interface PluginJSON {
  name: string;
  logo: string;
  main?: string,
  preload?: string,
  features?: Data;
  pluginName?: string;
  description?: string;
  author?: string;
  homepage?: string;
  version?: string;
}

export interface BuildUpxOptions {
  outDir?: string;
  outName?: string;
}

export interface Options {
  pluginFile: string;
  external?: string[],
  preload?: PreloadOptions | null
  buildUpx?: BuildUpxOptions | null
}

export type NestedRequired<T> = {
  // [P in keyof T]-?: Exclude<T[P], undefined | null>
  [P in keyof T]-?: NestedRequired<Exclude<T[P], undefined | null>>;
};

export type RequiredOptions = NestedRequired<Options>;

const defaultOptions: Options = {
  pluginFile: '',
  external: ['utools-api-types'],
  preload: {
    watch: true,
    name: 'preload',
    minify: false,
  },
  buildUpx: {
    outDir: 'dist',
    outName: '[pluginName]_[version].upx',
  },
};

export const resolveOptions = (options: Options) => {
  getPluginJSON(options.pluginFile)

  return Object.entries(defaultOptions).reduce((ret, [key, v1]) => {

    if (key === 'buildUpx' && options.buildUpx === null) {
      return ret;
    }
    // @ts-ignore
    const v2 = options[key];
    if (key === 'external') {
      ret[key] = Array.isArray(v2) ? v2 : [v2]
    } else {
      ret[key] = isUndef(v2) ? v1 : isObject(v1) && isObject(v2) ? { ...v1, ...v2 } : v2;
    }
    return ret;
  }, {} as any);
}
