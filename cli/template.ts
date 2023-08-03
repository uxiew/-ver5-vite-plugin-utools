import { mkdirSync, constants, existsSync, readdirSync, copyFile } from 'node:fs';
import { resolve } from 'node:path';

/**
* 没有指定 --dir 参数，默认创建 utools 目录
*/
export function buildTemplates() {
  let utoolsDir = 'utools'
  if (process.argv.slice(2)[0] === "--dir")
    utoolsDir = resolve(process.cwd(), process.argv.slice(3)[0])
  // const viteConfigFile = resolve(process.cwd(), 'vite.config') + resolve(process.cwd(), 'tsconfig.json') ? '.ts' : '.js'
  if (!existsSync(utoolsDir)) {
    mkdirSync(utoolsDir, { recursive: false })
    const templatesDir = resolve(__dirname, '..', 'templates')

    readdirSync(templatesDir).forEach((filename) => {
      copyFile(resolve(templatesDir, filename), resolve(utoolsDir, filename), constants.COPYFILE_EXCL, (err) => {
        if (err) throw err;
        console.log(`utools templates ${filename} created!`);
      });
    })
  } else {
    console.log(`${process.argv.slice(3)[0]} dir already existed, skipped...`);
  }
}
