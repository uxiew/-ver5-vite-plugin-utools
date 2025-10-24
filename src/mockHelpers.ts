import type { MockConfig, PreloadApiMockConfig, UtoolsApiMockConfig } from './mockConfigManager';

export type PreloadMockMap = Record<string, (...args: any[]) => any>;
export type UtoolsMockMap = Record<string, (...args: any[]) => any>;

/**
 * 为 Mock 配置提供显式的类型约束。纯粹的语法糖，帮助获得更好的智能提示。
 */
export function defineMockConfig<T extends MockConfig>(config: T): T {
  return config;
}

/**
 * 声明 preload 命名空间下的 Mock 方法。
 */
export function definePreloadMocks<T extends PreloadMockMap>(mocks: T): T {
  return mocks;
}

/**
 * 声明 window.utools 命名空间下的 Mock 方法。
 */
export function defineUtoolsMocks<T extends UtoolsMockMap>(mocks: T): T {
  return mocks;
}

export interface MockOverridesBuilderOptions {
  preload?: Partial<PreloadApiMockConfig>;
  utools?: Partial<UtoolsApiMockConfig>;
}

/**
 * 帮助在配置文件中快速合并自定义 overrides。
 */
export function applyMockOverrides(
  base: MockConfig,
  overrides: MockOverridesBuilderOptions,
): MockConfig {
  const next: MockConfig = {
    ...base,
    preloadApi: {
      ...base.preloadApi,
      ...overrides.preload,
      customMethods: {
        ...(base.preloadApi?.customMethods ?? {}),
        ...(overrides.preload?.customMethods ?? {}),
      }
    },
    utoolsApi: {
      ...base.utoolsApi,
      ...overrides.utools,
      customMethods: {
        ...(base.utoolsApi?.customMethods ?? {}),
        ...(overrides.utools?.customMethods ?? {}),
      }
    }
  };

  return next;
}
