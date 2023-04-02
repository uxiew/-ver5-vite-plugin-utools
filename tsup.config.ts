import { defineConfig } from 'tsup'



//  src/index.ts --target node16 --clean --sourcemap --dts --format cjs,esm
export default defineConfig({
  entry: ['src/index.ts'],
  target: 'node16',
  splitting: false,
  dts: true,
  format: ["cjs", "esm"],
  sourcemap: true,
  clean: true,
})
