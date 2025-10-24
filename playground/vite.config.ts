import path from 'node:path'
import { defineConfig, loadEnv } from 'vite'
// import Inspect from 'vite-plugin-inspect'
import utools from '../dist/index.mjs';

export default defineConfig((env) => {
  const viteEnv = loadEnv(env.mode, process.cwd()) as unknown as ImportMetaEnv

  return {
    resolve: {
      alias: {
        '@': path.resolve(process.cwd(), 'src'),
        'utools': path.resolve(process.cwd(), 'utools'),
      },
    },
    plugins: [
      // Inspect(),
      utools({
        configFile: path.join(process.cwd(), 'utools', 'plugin.json'),
        // configFile: path.join(process.cwd(), 'playground/utools/plugin.json'),
        external: ['vite', 'vite-plugin-inspect'],
        preload: {
          watch: true,
          name: 'services', // 更改为 services 以匹配 preload.ts
          minify: false,
        },
        upx: {
          outName: '[pluginName]_[version].upx',
        },
        mock: {
          enabled: true,
          showDevIndicator: true,
          mockData: {
            runtimes: {
              node: 'v20.0.0 (Playground Mock)',
              python: 'Python 3.12.0 (Playground Mock)'
            }
          }
        },
      }),
    ],
  }
})
