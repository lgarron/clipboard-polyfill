import { barelyServe } from "barely-a-dev-server";

barelyServe({
  dev: false,
  entryRoot: "./src/demo",
  outDir: "./dist/demo",
  esbuildOptions: {
    target: "es5",
  },
});
