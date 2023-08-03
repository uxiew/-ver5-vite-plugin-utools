# @ver5/vite-plugin-utools

[Utools](https://u.tools/docs/developer/preload.html) for Vite

- 自动配置开发环境的地址
- 支持直接打包出插件 upx
- 支持 preload.js 模块化
- 支持 uTools api 模块化

# 安装
```bash
npm i @ver5/vite-plugin-utools -D
```

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
      external: ["electron"],
      // preload 相关配置
      preload: {
        // 热更新
        watch: true,
        // window上的挂载名，为空则表示直接将导出挂载到window下
        name: "preload",
        // 是否压缩
        minify: false,
      },
      upx: {
        outDir: "dist",
        outName: "[pluginName]_[version].upx",
      },
    }),
  ],
};
```

##  准备开发

如果你是一个全新的 vite 的项目中可以先运行，那么可以先运行下面的命令：
```sh
npx utools
```
会在当前根目录生成 utools 文件夹和模版文件。当然了你也可以不运行该命令，直接进行参考上面的配置，进行 utools 开发了。

### preload 文件支持 ts 和 npm 库

> 注意 ⚠️：需要在`configFile`的`plugin.json`文件中指定 preload 入口文件，假如你的`preload:'./plugin/index.ts'`表示相对当前`plugin.json`所在路径，之后会自动转换。

### 默认支持部分可用 electron 模块
直接使用 window.electron 即可。（记住：utools  插件只支持部分 electorn 模块功能！）
```
export const hello = () => window.utools.showNotification("你好👋！")
export const clearClipboard = () => window.electron.clipboard.clear()
```

假设 preload 入口文件是`index.ts`，并且配置了 preload 的`name: 'preload'`
```js
// index.ts
import { readFileSync } from "fs";

// 所有需要挂载到`window`上的函数或其他，都需要导出使用（记住：只能在入口文件中导出！）
export const hello = () => window.utools.showNotification("你好👋！")
export const clearClipboard = () => window.electron.clipboard.clear()
export const readPlugin = () => readFileSync("./plugin.json");
```

最终转换为`preload.js`：

```js
"use strict";
window['preload'] = Object.create(null);

const { readFileSync } = require("fs");

window['preload'].hello = window.utools.showNotification("你好👋！")
window['preload'].clearClipboard = () => window.electron.clipboard.clear()
window['preload'].readPlugin = () => readFileSync("./plugin.json");
```

当然了也支持导入其他文件，和第三方 node 模块。

### 支持 preload 第三方 node 模块分割
保持`preload.js`的简洁。

运行`npm run dev`显示示例：
```sh
vite v4.1.4 building for utools-build-mode...
✓ 32 modules transformed.
dist/preload.js                 2.35 kB
dist/node_modules/lib.js       53.28 kB │ gzip: 12.22 kB
dist/node_modules/auth.js   53.71 kB │ gzip: 13.11 kB
dist/node_modules/@xmldom.js  122.16 kB │ gzip: 30.23 kB
```

启动项目后，生成的`dist`文件夹中就会包括所需的开发文件了，在“uTools 开发者工具”中指向目标目录中的`plugin.json`即可！

# upx 打包

插件的 `plugin.json` 文件必须项
以下字段不设置，会自动取`package.json`中对应的自动字段，没有的话，则报错！

```json
"name": "demo", // uTools 开发者工具中的项目 id
"pluginName": "demo",
"version": "0.0.1",
"description": "demo",
"author": "chandlerVer5",
"homepage": "https://github.com/chandlerVer5",
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

如果当前项目属于 typescript 项目，或者 设置`autoType:true`会自动 s生成名为`preload.d.ts`的类型文件（相对于`configFile`中的`preload`路径）。

基本上有两个作用：

1. 自动配置 utools api 的类型声明
2. 自动配置 electron 的类型声明
3. 生成相应的 typescript 类型

> 如果不生效，请尝试`preload.d.ts`的类型声明添加到`tsconfig.json`的`include`中，以便生效！

## external

默认值：`electron`，`electron`总是会被排除掉。

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
