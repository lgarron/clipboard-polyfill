import { build } from "esbuild";

await build({
  entryPoints: ["src/clipboard-polyfill/targets/main.ts"],
  format: "esm",
  target: "es6",
  bundle: true,
  outfile: "dist/main/clipboard-polyfill.main.es6.js",
});

await build({
  entryPoints: ["src/clipboard-polyfill/targets/text.ts"],
  format: "esm",
  target: "es6",
  bundle: true,
  outfile: "dist/text/clipboard-polyfill.text.es6.js",
});

await build({
  entryPoints: ["src/clipboard-polyfill/targets/overwrite-globals.ts"],
  format: "esm",
  target: "es6",
  bundle: true,
  outfile: "dist/overwrite-globals/clipboard-polyfill.overwrite-globals.es6.js",
});

await build({
  entryPoints: ["src/clipboard-polyfill/targets/overwrite-globals.ts"],
  target: "es5",
  bundle: true,
  outfile: "dist/overwrite-globals/clipboard-polyfill.overwrite-globals.es5.js",
});
