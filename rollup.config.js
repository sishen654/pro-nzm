// 如果打包的文件中有引入外部资源时，执行环境没有会导致出现问题，这个包可以将引入的包代码也打包进来
import resolve from '@rollup/plugin-node-resolve';
// rollup.js 编译源码中的模块引用默认只支持 ES6+的模块方式 import/export。
// 然而大量的 npm 模块是基于 CommonJS 模块方式，这就导致了大量 npm 模块不能直接编译使用
// 需要添加这个插件来支持基于 CommonJS 模块方式 npm 包
import commonjs from '@rollup/plugin-commonjs';
// 使用 esbuild 进行打包可以获得更快的打包速度
import esbuild from 'rollup-plugin-esbuild'
// 用于创建 .d.ts 文件，拟补 esbuid 无法生成声明文件问题
import dts from "rollup-plugin-dts";
import path from "node:path"
// 引入 require 函数，方便解析 json 文件
import { createRequire } from 'module';     // node12+
const require = createRequire(import.meta.url);
const tsConfig = require('./tsconfig.json');
const pkg = require('./package.json');

function resolveConfig (option) {
  let { bundlePath = "dist", declaration = true, bundleName, isResolve = false, isCut = false, format = "cjs", isMinify = true, platform = "node", target = "esnext", plugins = [], input, output = {}, esBuildConfig = {}, ...others } = option
  // 1 input 必须存在
  if (!input) throw new Error("Input value must valild!")
  // 2 获取 output
  let defaultOutput = {
    file: bundleName ? path.join(bundlePath, bundleName) : undefined,
    dir: bundleName ? undefined : bundlePath,
    format,   // https://rollupjs.org/guide/en/#outputformat
    preserveModules: isCut,   // https://www.rollupjs.com/guide/big-list-of-options#outputpreservemodules
    ...output
  }
  // 3 获取 esBuild 配置
  let esBuildDefaultConfig = {
    minify: process.env.NODE_ENV === 'production' && isMinify,
    platform, // esbuild: export type Platform = 'browser' | 'node' | 'neutral';
    target,   // https://esbuild.github.io/api/#target
    ...esBuildConfig
  }
  // 4 获取 plugins
  let defaultPlugins = [
    esbuild(esBuildDefaultConfig),
    commonjs()
  ]
  if (isResolve) defaultPlugins.push(resolve())
  // 5 创建返回对象
  let returnArr = [{
    input,
    output: defaultOutput,
    watch: {
      clearScreen: true,
      exclude: 'node_modules/**',
      include: 'src/**/*.ts'
    },
    plugins: defaultPlugins.concat(plugins),
    ...others
  }]
  // 6 判断是否添加声明文件
  if (declaration && tsConfig.compilerOptions.declaration && format === "es") {
    // 初始化生成位置
    if (defaultOutput.file) {
      defaultOutput.dir = path.dirname(defaultOutput.file);
      defaultOutput.file = undefined;
    }
    returnArr.push({
      ...others,
      input,
      output: defaultOutput,
      watch: false,
      plugins: [dts()]
    })
  }
  return returnArr
}

function getBundleName (format, name) {
  let matches = name.match(/\/([\w\W]+)/) || []
  let original = matches[1] ? matches[1] : name
  // 修改打包文件名
  switch (format) {
    case "es":
      if (path.extname(original) === ".ts") original = original.replace(path.extname(original), ".js");
      else if (path.extname(original) === ".tsx") original = original.replace(path.extname(original), ".jsx");
      return original
      return {
        bundleName: original
      }
    case "cjs":
      return original.replace(path.extname(original), ".cjs")
      return {
        bundleName: original.replace(path.extname(original), ".cjs")
      }
    case "amd":
      break;
    case "iife":
      break;
    case "umd":
      break;
    case "system":
      break;
    default:
      return {}
  }
}

function createConfig (configs = [], formatArr = ["cjs", "es"]) {
  // 1 创建配置数组
  let configArr = []
  // 2 循环配置项
  configs.forEach(item => {
    // 3 循环打包格式
    formatArr.forEach(format => {
      let options = { format }
      switch (typeof item) {
        case "string":
          options.input = item
          options.bundleName = getBundleName(format, item)
          break;
        case "object":
          options.bundleName = options.bundleName || getBundleName(format, item.input)
          options = Object.assign(item, options)
          break;
      }
      configArr.push(...resolveConfig(options))
    })
  })
  return configArr
}

export default createConfig([
  {
    input: "src/index.ts",
    treeshake: {
      moduleSideEffects: false
    },
  }
])
