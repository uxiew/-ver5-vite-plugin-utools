import { existsSync, readFileSync } from 'fs';
import { resolve } from 'path';

import type { MockManifest } from './types';
import { OptionsResolver } from './options';

export interface MockFileManagerConfig {
  projectRoot?: string;
  mockDir?: string;
  userConfig?: any;
}

/**
 * Thin façade around {@link MockManifestBuilder}. This class keeps backwards
 * compatibility with the rest of the plugin by exposing a minimal API for
 * initialising and reading the generated manifest.
 */
export class MockFileManager {
  private readonly options: Required<MockFileManagerConfig>;
  private manifest?: MockManifest;

  constructor(config: MockFileManagerConfig = {}) {
    this.options = {
      projectRoot: config.projectRoot ?? process.cwd(),
      mockDir: config.mockDir ?? '.utools_mock',
      userConfig: config.userConfig,
    } as Required<MockFileManagerConfig>;
  }

  /**
   * Analyse preload.ts, generate the manifest and bootstrap runtime files.
   */
  initializeMockFiles(): MockManifest {
    const builderOptions: MockManifestBuilderOptions = {
      projectRoot: this.options.projectRoot,
      outputDir: this.options.mockDir,
      preloadFilePath: OptionsResolver.preloadPath,
      preloadGlobalName: OptionsResolver.resolvedOptions.preload.name,
      userConfig: this.options.userConfig,
    };

    const builder = new MockManifestBuilder(builderOptions);
    const result = builder.build();

    if (result.changed) {
      console.info(`[uTools Mock] Mock manifest regenerated.`);
    } else {
      console.info(`[uTools Mock] Mock manifest unchanged.`);
    }

    this.manifest = result.manifest;
    return result.manifest;
  }

  /**
   * Returns the last manifest on disk. Useful for hot-update checks.
   */
  readManifest(): MockManifest | null {
    if (this.manifest) {
      return this.manifest;
    }

    const manifestPath = resolve(this.options.projectRoot, this.options.mockDir, 'manifest.json');
    if (!existsSync(manifestPath)) {
      return null;
    }

    const manifest: MockManifest = JSON.parse(readFileSync(manifestPath, 'utf-8'));
    this.manifest = manifest;
    return manifest;
  }
}
