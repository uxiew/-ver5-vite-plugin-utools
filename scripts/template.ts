import { mkdirSync, constants, existsSync, readdirSync, copyFile, readFileSync } from "fs"
import { resolve } from "path";


function buildTemplates() {
  if (process.argv.slice(2)[0] !== "--dir") throw new Error('template CLI args error!!!')
  const dir = resolve(process.cwd(), process.argv.slice(3)[0])


  if (!existsSync(dir)) {
    mkdirSync(dir, { recursive: false })
    const templatesDir = resolve(__dirname, '..', 'templates')

    // read pkg
    // const pkg = JSON.parse(readFileSync(resolve(process.cwd(), 'package.json'), 'utf8'))

    readdirSync(templatesDir).forEach((filename) => {
      copyFile(resolve(templatesDir, filename), resolve(dir, filename), constants.COPYFILE_EXCL, (err) => {
        if (err) throw err;
        console.log(`utools templates ${filename} created!`);
      });
    })
  } else {
    console.log(`${process.argv.slice(3)[0]} dir already existed, skipped...`);
  }

}


buildTemplates()
