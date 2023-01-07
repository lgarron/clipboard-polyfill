import { build } from "esbuild";

await build({
  entryPoints: [
    "./src/clipboard-polyfill/entries/es6/clipboard-polyfill.es6.ts",
  ],
  format: "esm",
  target: "es6",
  bundle: true,
  outdir: "./dist/es6/",
});

async function buildES5(src, entriestem) {
  const common = {
    entryPoints: [src],
    target: "es5",
    bundle: true,
    banner: { js: '"use strict";' },
  };
  await build({
    ...common,
    outfile: `${entriestem}.es5.js`,
  });
}

buildES5(
  "src/clipboard-polyfill/entries/es5/window-var.ts",
  "dist/es5/window-var/clipboard-polyfill.window-var",
);
buildES5(
  "src/clipboard-polyfill/entries/es5/window-var.promise.ts",
  "dist/es5/window-var/clipboard-polyfill.window-var.promise",
);
buildES5(
  "src/clipboard-polyfill/entries/es5/overwrite-globals.ts",
  "dist/es5/overwrite-globals/clipboard-polyfill.overwrite-globals",
);
buildES5(
  "src/clipboard-polyfill/entries/es5/overwrite-globals.promise.ts",
  "dist/es5/overwrite-globals/clipboard-polyfill.overwrite-globals.promise",
);
