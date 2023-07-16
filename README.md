# @ver5/vite-plugin-utools

<a href="http://www.u.tools/">Utools</a> for Vite

- 支持 preload.js 模块化
- 支持 uTools api 模块化
- 自动配置开发环境的地址
- 支持插件打包

# 安装
```bash
npm i @ver5/vite-plugin-utools -D
```


# 生成模版：
在`scripts`中添加：
```json
  ...
  "utools": "node ./node_modules/@ver5/vite-plugin-utools/dist/template.js --dir utools",
```

之后直接`npm run utools`，可以在根目录生成 utools 文件夹和模版文件

# 配置
在 `vite.config.js` 中添加配置

```js
import utools from "@ver5/vite-plugin-utools";

export default {
  plugins: [
    utools({
      // plugin.json 路径
      configFile: "./utools/plugin.json",
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
      upx: {
        outDir: "dist",
        outName: "[pluginName]_[version].upx",
      },
    }),
  ],
};
```

## 模块化开发
preload 文件支持 ESM\TS & 支持引入三方库；

> 注意 ⚠️：需要在`configFile`的`plugin.json`文件中指定 preload 入口文件，假如你的`preload:'./plugin/index.ts'`表示相对当前`plugin.json`所在路径，之后会自动转换。

假设 preload 入口文件是`index.ts`，并且配置了 preload 的`name: 'preload'`
```js
// preload.ts

import { readFileSync } from "fs";
import _fdir from "fdir";

// 所有需要挂载到`window`上的函数或其他，都需要导出使用（记住：只能在入口文件中导出！）
export const readConfig = () => readFileSync("./config.json");
export const fdir = _fdir;
```

其他文件从 preload.ts 中导入

```js
// index.ts

import { readConfig } from "./preload";

console.log(readConfig());
export { readConfig }
```

最终转换为：

```js
// preload.js

window.preload = Object.create(null);

const { readFileSync } = require("fs");

const readConfig = () => readFileSync("./config.json");
window.preload.readConfig = readConfig
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

# upx 打包

插件的 `plugin.json` 文件必须项
以下字段不设置，会自动取 package.json 中对应的自动字段，没有的话，则报错！

```json
"name": "demo", // uTools 开发者工具中的项目 id
"pluginName": "demo",
"version": "0.0.1",
"description": "demo",
"author": "chandlerVer5",
"homepage": "https://github.com/13enbi",
"logo": "logo.png",
"features":[]
```

可将 vite 构建后的产物打包成 uTools 的 upx 离线包

# 配置项

## configFile

（必须）
默认值：`''`

插件`plugin.json`文件路径

## autoType

默认值：`false`

如果当前项目属于 typescript 项目，或者 强制设置`autoType:true`会生成名为`preload.d.ts`的类型文件（相对于`configFile`中的`preload`路径）。

基本上有两个作用：

1. 自动配置 utools api 的类型声明（使用官方提供的 utools-api-types 类型文件）
2. 生成相应的 typescript 类型

> 如果不生效，请尝试 utools 的类型声明添加到`tsconfig.json`的`include`中，类似`"types": ["utools-api-types"]`，以便生效！

## external

默认值：`utools-api-types`,

对于不想打包的包，可以先`external`排除掉，例如`external: ['tiktoken']`,，然后通过 [vite-plugin-static-copy](https://github.com/sapphi-red/vite-plugin-static-copy) 复制到目标目录。

## preload.name

默认值：`preload`

`preload.js`在`window`的挂载名

## preload.watch

默认值：`true`

`preload.js`修改后重新构建，配合 uTools 开发者工具开启`隐藏插件后完全退出`使用

## preload.minify

默认值：`false`

启用文件的压缩

## preload.onGenerate

默认值：`undefined`
返回值：`(preloadCode:string) => string(required)`

可以通过该函数，修改`preload.js`内容。
该函数的返回值会被设置为`preload.js`的内容。

## upx.outDir

默认值： `dist`

插件打包输出路径

## upx.outName

默认值：`[pluginName]_[version].upx`

插件输出文件名

# TODO

- [x] 生成 ts 类型
- [ ] preload 自动 reload


# 参考
- https://github.com/13enBi/vite-plugin-utools/

