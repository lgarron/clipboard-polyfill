import babel from "rollup-plugin-babel";
import { terser } from "rollup-plugin-terser";
import * as typescript from "typescript";
import typescript2 from "rollup-plugin-typescript2";
import tslint from "rollup-plugin-tslint";
import { readFileSync } from "fs";

const plugins = [
  tslint({
    exclude: ["node_modules/**"],
  }),
  typescript2({
    typescript: typescript,
  }),
];

if (!process.env.ROLLUP_WATCH) {
  plugins.push(
    terser({
      keep_classnames: true,
    })
  );
}

const promisePolyfill = readFileSync(
  "node_modules/promise-polyfill/dist/polyfill.min.js"
).toString();

const promisePlugins = [
  ...plugins,
  babel({
    extensions: [".js", ".ts"],
    presets: [
      [
        "@babel/preset-typescript",
        {
          modules: false,
          targets: {
            browsers: "last 2 versions",
            ie: 11,
          },
        },
      ],
    ],
  }),
];

export default [
  {
    input: "./src/targets/main.ts",
    output: [
      {
        file: "dist/main/clipboard-polyfill.js",
        format: "umd",
        name: "clipboard",
        sourcemap: true,
      },
    ],
    plugins,
  },
  {
    input: "./src/targets/main.ts",
    output: [
      {
        file: "dist/main/clipboard-polyfill.esm.js",
        format: "esm",
        sourcemap: true,
      },
    ],
    plugins,
  },
  {
    input: "./src/targets/text.ts",
    output: [
      {
        file: "dist/text/clipboard-polyfill.text.js",
        format: "umd",
        name: "clipboard",
        sourcemap: true,
      },
    ],
    plugins,
  },
  {
    input: "./src/targets/text.ts",
    output: [
      {
        file: "dist/text/clipboard-polyfill.text.esm.js",
        format: "esm",
        sourcemap: true,
      },
    ],
    plugins,
  },
  {
    input: "./src/targets/overwrite-globals.ts",
    output: [
      {
        file: "dist/overwrite-globals/clipboard-polyfill.overwrite-globals.js",
        format: "umd",
        sourcemap: true,
      },
    ],
    plugins,
  },
  {
    input: "./src/targets/overwrite-globals.ts",
    output: [
      {
        file:
          "dist/overwrite-globals/clipboard-polyfill.overwrite-globals.esm.js",
        format: "esm",
        sourcemap: true,
      },
    ],
    plugins,
  },
  {
    input: "./src/targets/main.ts",
    output: [
      {
        banner: promisePolyfill,
        file: "dist/promise/clipboard-polyfill.promise.js",
        format: "umd",
        name: "clipboard",
        sourcemap: true,
      },
    ],
    plugins: promisePlugins,
  },
  {
    input: "./src/targets/overwrite-globals.ts",
    output: [
      {
        banner: promisePolyfill,
        file:
          "dist/overwrite-globals.promise/clipboard-polyfill.overwrite-globals.promise.js",
        format: "umd",
        name: "clipboard",
        sourcemap: true,
      },
    ],
    plugins: promisePlugins,
  },
];
