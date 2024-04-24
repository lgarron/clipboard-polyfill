import { test, expect } from "bun:test";

(globalThis as any).document = {};

test("writeText(…) failure in an unsupported browser", async () => {
  const { writeText } = await import("./text");

  expect(async () => writeText("hello")).toThrowError(
    "document.addEventListener is not a function.",
  );
});
