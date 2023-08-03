import { defineConfig } from 'tsup'

//  "tsup-node src/index.ts --target node16 --clean --sourcemap --dts --format cjs,esm ",
export default defineConfig({
  entry: {
    index: 'src/index.ts',
    cli: 'cli/cli.ts'
  },
  minify: "terser",
  target: ["node16"],
  splitting: false,
  dts: {
    entry: 'src/index.ts'
  },
  format: ["esm", "cjs"],
  sourcemap: true,
  clean: true,
})
