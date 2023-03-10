# vite-plugin-utools-v5

<a href="http://www.u.tools/">Utools</a> for Vite

更改自：https://github.com/13enBi/vite-plugin-utools/

- 支持 preload.js 模块化
- 支持 uTools api 模块化
- 支持插件打包

## 用法

```bash
npm i vite-plugin-utools-v5 -D
```

在 `vite.config.js` 中添加配置

```js
import utools from "vite-plugin-utools";

export default {
  plugins: [
    utools({
      // plugin.json 路径
      pluginFile: "./utools/plugin.json",
      // 不需要打包的库
      external: ["uTools"],
      // preload 相关配置
      preload: {
        // 热更新
        watch: true,
        // window上的挂载名，为空则表示直接将导出挂载到window下
        name: "preload",
        // 是否压缩
        minify: false,
        onGenerate: undefined,
      },
      buildUpx: {
        outDir: "dist",
        outName: "[pluginName]_[version].upx",
      },
    }),
  ],
};
```

## preload.js 支持 ESM & 支持引入三方库

```js
// preload.js

import { readFileSync } from "fs";
import _fdir from "fdir";

export const readConfig = () => readFileSync("./config.json");
export const fdir = _fdir;
```

其他文件从 preload.js 中导入

```js
// index.js

import { readConfig } from "./preload";

console.log(readConfig());
```

上诉文件会转换为

```js
// preload.js

window.preload = Object.create(null);

const { readFileSync } = require("fs");
const _fidr = require("fdir");

window.preload.readConfig = () => readFileSync("./config.json");
window.preload.fdir = _fdir;
```

```js
const readConfig = window.preload.readConfig;

console.log(readConfig());
```

## uTools api 支持 ESM

```js
import { onPluginReady, getUser } from "uTools";

onPluginReady(() => {
  console.log("Ready");
  console.log(getUser());
});
```

### TypeScript 类型支持

可使用官方提供的 utools-api-types 类型文件

```
npm i -D utools-api-types
```

```ts
declare module "uTools" {
  import Utools from "utools-api-types";
  export = Utools;
}
```

## Upx 打包

在插件的 `plugin.json` 文件添加额外配置 3. 修改 ./public/plugin.json

```json
"name": "demo", // uTools 开发者工具中的项目 id
"version": "1.0.0",
"pluginName": "demo",
"description": "demo",
"author": "yo3emite",
"logo": "logo.png",
"homepage": "https://github.com/13enbi",
```

可将 vite 构建后的产物打包成 uTools 的 `upx` 离线包

## 配置

### buildUpx.pluginPath

（必须）
默认值：`''`

插件`plugin.json`文件路径
注意 ⚠️：需要在`pluginFile`的`plugin.json`中需要指向到 preload 入口文件，假如你的`preload:'./plugin/index.ts'`表示相对当前`plugin.json`所在路径，之后会自动转换

### external

默认值：`utools-api-types`

扩展`window.utools`的模块名，

### preload. name

默认值：`preload`

`preload.js`在`window`的挂载名

### preload.watch

默认值：`true`

`preload.js`修改后重新构建,配合 uTools 开发者工具开启`隐藏插件后完全退出`使用

### preload.minify

默认值：`false`

启用文件的压缩

### preload.onGenerate

默认值：`undefined`
返回值：`(preloadCode:string) => string(required)`

可以通过该函数，修改最终`preload.js`内容
如果定义了该函数，其返回值会被设置为最终`preload.js`的内容。

### buildUpx.outDir

默认值： `dist`

插件打包输出路径

### buildUpx.outName

默认值：`[pluginName]_[version].upx`

插件输出文件名

# TODO

1. 生成所有 window 下的类型
2. preload 自动更新
3. preload 可放在目录，不打成一个 bundle
4. 去除 .DS_store 文件
