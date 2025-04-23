import { expect, test } from "bun:test";
import {
  createDebugLogConsoleMock,
  createDocumentMock,
  createWriteTextMock,
} from "../../test/mocks";

const debugLogConsoleMock = createDebugLogConsoleMock();
const writeTextMock = createWriteTextMock(async () => {
  throw new Error("writeText(…) is disabled");
});
const { documentMock, eventMock } = createDocumentMock();

// Regression test for https://github.com/lgarron/clipboard-polyfill/issues/167
test("writeText(…) success in a modern browser with the async API disabled", async () => {
  const { writeText } = await import("./text");

  expect(() =>
    writeText("hello modern browser with async API disabled"),
  ).not.toThrow();

  expect(debugLogConsoleMock.mock.calls).toEqual([
    ["Using `navigator.clipboard.writeText()`."],
    ["listener called"],
    ["regular execCopy worked"],
  ]);

  expect(writeTextMock.mock.calls).toEqual([
    ["hello modern browser with async API disabled"],
  ]);

  expect(documentMock.execCommand.mock.calls).toEqual([["copy"]]);

  expect(documentMock.addEventListener).toHaveBeenCalledTimes(1);
  expect(documentMock.removeEventListener).toHaveBeenCalledTimes(1);

  expect(eventMock.preventDefault).toHaveBeenCalledTimes(1);
  expect(eventMock.clipboardData.setData.mock.calls).toEqual([
    ["text/plain", "hello modern browser with async API disabled"],
  ]);

  expect(eventMock.clipboardData.getData.mock.calls).toEqual([["text/plain"]]);
});
