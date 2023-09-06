import { barelyServe } from "barely-a-dev-server";

barelyServe({
  dev: false,
  entryRoot: "./src/demo",
  outDir: "./dist/demo",
  esbuildOptions: {
    minify: false,
    target: "es5",
    splitting: false,
  },
});
