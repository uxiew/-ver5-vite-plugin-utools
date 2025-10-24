export interface PreloadSignature {
  /** Unique identifier for correlating factories and manifest entries */
  id: string;
  /** Exported function or property name */
  name: string;
  /** Detected export kind */
  kind: 'function' | 'class' | 'object' | 'primitive';
  /** Captured parameter names for functions */
  parameters: string[];
  /** Captured parameter type annotations (if available) */
  paramTypes?: string[];
  /** Captured return type annotation (if available) */
  returnType?: string;
  /** Optional description extracted from JSDoc */
  description?: string;
  /** Indicates whether analyzer had to fall back for this signature */
  fallback?: boolean;
  /** Window namespace where the method is mounted (use "window" for direct assignments) */
  namespace: string;
  /** If this window member is bridged from a module export, map to that export name for typeof import typing */
  sourceExportName?: string;
}

export interface ManifestMetadata {
  /** Hash of the current preload signature set */
  signatureHash: string;
  /** Indicates the analyzer succeeded without fallback */
  isComplete: boolean;
  /** Analyzer warnings (if any) */
  warnings: string[];
}

export interface MockManifest {
  version: string;
  generatedAt: string;
  preloadName: string;
  signatures: PreloadSignature[];
  metadata: ManifestMetadata;
}
