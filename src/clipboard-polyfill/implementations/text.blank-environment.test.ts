import { expect, mock, test } from "bun:test";
import { setDebugLog } from "../debug";

const consoleLogMock = mock(console.log);
setDebugLog(consoleLogMock);

test("writeText(…) failure in a blank environmnent", async () => {
  const { writeText } = await import("./text");

  expect(async () => writeText("hello")).toThrowError(ReferenceError);
  expect(consoleLogMock).toHaveBeenCalledTimes(0);
});
