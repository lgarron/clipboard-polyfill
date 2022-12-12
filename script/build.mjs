import { build } from "esbuild";

await build({
  entryPoints: ["src/clipboard-polyfill/targets/main.ts"],
  target: "es5",
  bundle: true,
  outfile: "dist/main/clipboard-polyfill.js",
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
