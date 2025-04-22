import { barelyServe } from "barely-a-dev-server";

await barelyServe({
  entryRoot: "./src/demo",
  outDir: "./.temp/dev",
  esbuildOptions: {
    target: "es5",
    splitting: false,
  },
});
