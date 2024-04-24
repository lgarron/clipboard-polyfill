import { test, expect } from "bun:test";

test("`bun test` must be run one file at a time", () => {
  console.error(
    "\n\n\n\n⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️\n\n\n\n[clipboard-polyfill] Each test file requires a fresh global environment before importing library code. Run `make test-bun` to run test files one at a time instead.\n\n\n\n⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️\n\n\n\n",
  );
  expect(true).toBe(false);
});
