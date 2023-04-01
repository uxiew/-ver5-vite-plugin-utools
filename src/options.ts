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

export interface UpxOptions {
  outDir?: string;
  outName?: string;
}

export interface Options {
  configFile: string;
  autoType?: boolean;
  external?: string[],
  preload?: PreloadOptions | null
  upx?: UpxOptions | null
}

export type NestedRequired<T> = {
  // [P in keyof T]-?: Exclude<T[P], undefined | null>
  [P in keyof T]-?: NestedRequired<Exclude<T[P], undefined | null>>;
};

export type RequiredOptions = NestedRequired<Options>;

const defaultOptions: Options = {
  configFile: '',
  external: ['utools-api-types'],
  autoType: false,
  preload: {
    watch: true,
    name: 'preload',
    minify: false,
  },
  upx: {
    outDir: 'dist',
    outName: '[pluginName]_[version].upx',
  },
};

export const resolveOptions = (options: Options) => {

  getPluginJSON(options.configFile)

  return Object.entries(defaultOptions).reduce((ret, [key, defaultVal]) => {

    // @ts-ignore
    const optsVal = options[key];

    if (key === 'upx' && isUndef(optsVal)) {
      ret[key] = false
      return ret
    }

    if (key === 'external') {
      ret[key] = Array.isArray(optsVal) ? optsVal : [optsVal]
    } else {
      ret[key] = isUndef(optsVal) ? defaultVal : (isObject(defaultVal) && isObject(optsVal) ? { ...defaultVal, ...optsVal } : optsVal);
    }
    return ret;

  }, {} as any);
}
