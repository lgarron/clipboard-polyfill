import { setDebugLog } from "../debug";
import { test, expect, mock } from "bun:test";

const consoleLogMock = mock(console.log);
setDebugLog(consoleLogMock);

test("writeText(…) failure in a blank environmnent", async () => {
  const { writeText } = await import("./text");

  expect(async () => writeText("hello")).toThrowError(ReferenceError);
  expect(consoleLogMock).toHaveBeenCalledTimes(0);
});
