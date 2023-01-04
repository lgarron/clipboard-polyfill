import { hasItemWithType } from "../ClipboardItem/check";
import {
  clipboardItemToGlobalClipboardItem,
  toStringItem,
  textToClipboardItem,
  StringItem,
} from "../ClipboardItem/convert";
import { TEXT_HTML, TEXT_PLAIN } from "../ClipboardItem/data-types";
import { ClipboardItemInterface, ClipboardItems } from "../ClipboardItem/spec";
import { debugLog, shouldShowWarnings } from "../debug";
import {
  originalNavigatorClipboardRead,
  originalNavigatorClipboardWrite,
  originalWindowClipboardItem,
} from "../globals";
import { readText } from "./text";
import { writeFallback } from "./write-fallback";

function voidPromise(): Promise<void> {
  return Promise.resolve();
}

function truePromise(): Promise<boolean> {
  return Promise.resolve(true);
}

export function write(data: ClipboardItemInterface[]): Promise<void> {
  // Use the browser implementation if it exists.
  // TODO: detect `text/html`.
  return (function write1(): Promise<boolean> {
    if (originalNavigatorClipboardWrite && originalWindowClipboardItem) {
      debugLog("Using `navigator.clipboard.write()`.");
      return Promise.all(data.map(clipboardItemToGlobalClipboardItem)).then(
        function (
          globalClipboardItems: ClipboardItemInterface[],
        ): Promise<boolean> {
          return originalNavigatorClipboardWrite(globalClipboardItems)
            .then(truePromise)
            .catch(function (e: Error): Promise<boolean> {
              // Chrome 83 will throw a DOMException or NotAllowedError because it doesn't support e.g. `text/html`.
              // We want to fall back to the other strategies in a situation like this.
              // See https://github.com/w3c/clipboard-apis/issues/128 and https://github.com/w3c/clipboard-apis/issues/67
              if (
                // rome-ignore lint/complexity/useSimplifiedLogicExpression: <explanation>
                !hasItemWithType(data, TEXT_PLAIN) &&
                !hasItemWithType(data, TEXT_HTML)
              ) {
                throw e;
              }
              return Promise.resolve(false);
            });
        },
      );
    }
    return Promise.resolve(true);
  })().then(function (continueAttempt: boolean) {
    if (!continueAttempt) {
      return voidPromise();
    }

    var hasTextPlain = hasItemWithType(data, TEXT_PLAIN);
    if (shouldShowWarnings() && !hasTextPlain) {
      debugLog(
        "clipboard.write() was called without a " +
          "`text/plain` data type. On some platforms, this may result in an " +
          "empty clipboard. Call suppressWarnings() " +
          "to suppress this warning.",
      );
    }

    return toStringItem(data[0]).then(function (stringItem: StringItem) {
      if (!writeFallback(stringItem)) {
        throw new Error("write() failed");
      }
    });
  });
}

export function read(): Promise<ClipboardItems> {
  // Use the browser implementation if it exists.
  if (originalNavigatorClipboardRead) {
    debugLog("Using `navigator.clipboard.read()`.");
    return originalNavigatorClipboardRead();
  }

  // Fallback to reading text only.
  readText().then(function (text: string) {
    return [textToClipboardItem(text)];
  });
}
