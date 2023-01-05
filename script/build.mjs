import { build } from "esbuild";

const es6 = {
  format: "esm",
  target: "es6",
  bundle: true,
};

await build({
  entryPoints: ["src/clipboard-polyfill/targets/main.ts"],
  ...es6,
  outfile: "dist/es6/main/clipboard-polyfill.main.es6.js",
});

await build({
  entryPoints: ["src/clipboard-polyfill/targets/text.ts"],
  ...es6,
  outfile: "dist/es6/text/clipboard-polyfill.text.es6.js",
});

async function buildES5(src, targetStem) {
  const common = {
    entryPoints: [src],
    target: "es5",
    bundle: true,
    banner: { js: '"use strict";' },
  };
  await build({
    ...common,
    outfile: `${targetStem}.es5.js`,
  });
}

buildES5(
  "src/clipboard-polyfill/targets/window-var.ts",
  "dist/es5/window-var/clipboard-polyfill.window-var",
);
buildES5(
  "src/clipboard-polyfill/targets/window-var.promise.ts",
  "dist/es5/window-var/clipboard-polyfill.window-var.promise",
);
buildES5(
  "src/clipboard-polyfill/targets/overwrite-globals.ts",
  "dist/es5/overwrite-globals/clipboard-polyfill.overwrite-globals",
);
buildES5(
  "src/clipboard-polyfill/targets/overwrite-globals.promise.ts",
  "dist/es5/overwrite-globals/clipboard-polyfill.overwrite-globals.promise",
);
