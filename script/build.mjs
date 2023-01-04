import { build } from "esbuild";

await build({
  entryPoints: ["src/clipboard-polyfill/targets/text.ts"],
  format: "esm",
  target: "es6",
  bundle: true,
  outfile: "dist/text/clipboard-polyfill.text.esm.js",
});

await build({
  entryPoints: ["src/clipboard-polyfill/targets/main.ts"],
  format: "esm",
  target: "es6",
  bundle: true,
  outfile: "dist/esm/clipboard-polyfill.main.esm.js",
});

await build({
  entryPoints: ["src/clipboard-polyfill/targets/overwrite-globals.ts"],
  format: "esm",
  target: "es6",
  bundle: true,
  outfile: "dist/esm/clipboard-polyfill.overwrite-globals.esm.js",
});

await build({
  entryPoints: ["dist/esm/clipboard-polyfill.overwrite-globals.esm.js"],
  target: "es5",
  bundle: true,
  outfile: "dist/esm/clipboard-polyfill.overwrite-globals.es5.js",
});

// ".": {
//   "require": "./dist/main/clipboard-polyfill.js",
//   "import": "./dist/main/clipboard-polyfill.esm.js",
//   "types": "./dist/main/targets/main.d.ts"
// },
// "./overwrite-globals": {
//   "require": "./dist/overwrite-globals/clipboard-polyfill.overwrite-globals.js",
//   "import": "./dist/overwrite-globals/clipboard-polyfill.overwrite-globals.esm.js",
//   "types": "./dist/overwrite-globals/targets/overwrite-globals.d.ts"
// },
// "./text": {
//   "require": "./dist/text/clipboard-polyfill.text.js",
//   "import": "./dist/text/clipboard-polyfill.text.esm.js",
//   "types": "./dist/text/targets/text.d.ts"
// }
