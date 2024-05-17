import {
  createDocumentMock,
  createDebugLogConsoleMock,
  createWriteTextMock,
} from "../../test/mocks";
import { test, expect, mock } from "bun:test";

const debugLogConsoleMock = createDebugLogConsoleMock();
const { documentMock, eventMock } = createDocumentMock();

test("writeText(…) execCommand fallback in a modern browser", async () => {
  const { writeText } = await import("./text");

  expect(() => writeText("hello execCommand fallback")).not.toThrow();

  expect(debugLogConsoleMock.mock.calls).toEqual([
    ["listener called"],
    ["regular execCopy worked"],
  ]);

  expect(documentMock.execCommand.mock.calls).toEqual([["copy"]]);

  expect(documentMock.addEventListener).toHaveBeenCalledTimes(1);
  expect(documentMock.removeEventListener).toHaveBeenCalledTimes(1);

  expect(eventMock.preventDefault).toHaveBeenCalledTimes(1);
  expect(eventMock.clipboardData.setData.mock.calls).toEqual([
    ["text/plain", "hello execCommand fallback"],
  ]);

  expect(eventMock.clipboardData.getData.mock.calls).toEqual([["text/plain"]]);
});
