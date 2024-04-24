import { basename } from "node:path";
import { Glob, spawn } from "bun";

const glob = new Glob("**/*.test.ts");

console.log("Running bun test files individually");

// Scans the current working directory and each of its sub-directories recursively
for await (const file of glob.scan(".")) {
  if (basename(file) === "bun-test-cannot-run-all-tests.test.ts") {
    continue;
  }
  console.log(`Running: bun test "${file}"`);

  if ((await spawn(["bun", "test", file], {}).exited) !== 0) {
    throw new Error(`Bun test failed for file: ${file}`);
  }
}
