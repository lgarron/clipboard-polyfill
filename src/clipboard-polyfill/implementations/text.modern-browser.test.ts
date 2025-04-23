import { expect, test } from "bun:test";
import {
  createDebugLogConsoleMock,
  createDocumentMock,
  createWriteTextMock,
} from "../../test/mocks";

const debugLogConsoleMock = createDebugLogConsoleMock();
const writeTextMock = createWriteTextMock();
const { documentMock } = createDocumentMock();

test("writeText(…) success in a modern browser", async () => {
  const { writeText } = await import("./text");

  expect(() => writeText("hello modern browser")).not.toThrow();

  expect(debugLogConsoleMock.mock.calls).toEqual([
    ["Using `navigator.clipboard.writeText()`."],
  ]);

  expect(writeTextMock.mock.calls).toEqual([["hello modern browser"]]);

  expect(documentMock.execCommand).toHaveBeenCalledTimes(0);
  expect(documentMock.addEventListener).toHaveBeenCalledTimes(0);
  expect(documentMock.removeEventListener).toHaveBeenCalledTimes(0);
});
