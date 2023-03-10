import { normalizePath } from 'vite'

function aa() {
  console.log("x")
}

window.normalizePath = normalizePath
export { aa, normalizePath }
