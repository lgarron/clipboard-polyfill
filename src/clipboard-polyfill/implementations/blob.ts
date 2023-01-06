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
  promiseConstructor,
  originalNavigatorClipboardRead,
  originalNavigatorClipboardWrite,
  originalWindowClipboardItem,
} from "../builtins/builtin-globals";
import {
  falsePromise,
  rejectThrownErrors,
  truePromiseFn,
  voidPromise,
} from "../promise/promise-compat";
import { readText } from "./text";
import { writeFallback } from "./write-fallback";

export function write(data: ClipboardItemInterface[]): Promise<void> {
  // Use the browser implementation if it exists.
  // TODO: detect `text/html`.
  return rejectThrownErrors((): Promise<boolean> => {
    if (originalNavigatorClipboardWrite && originalWindowClipboardItem) {
      // TODO: This reference is a workaround for TypeScript inference.
      var originalNavigatorClipboardWriteReference =
        originalNavigatorClipboardWrite;
      debugLog("Using `navigator.clipboard.write()`.");
      return promiseConstructor
        .all(data.map(clipboardItemToGlobalClipboardItem))
        .then(
          (
            globalClipboardItems: ClipboardItemInterface[],
          ): Promise<boolean> => {
            return originalNavigatorClipboardWriteReference(
              globalClipboardItems,
            )
              .then(truePromiseFn)
              .catch((e: Error): Promise<boolean> => {
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
                return falsePromise;
              });
          },
        );
    }
    return falsePromise;
  }).then((success: boolean) => {
    if (success) {
      return voidPromise;
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

    return toStringItem(data[0]).then((stringItem: StringItem) => {
      if (!writeFallback(stringItem)) {
        throw new Error("write() failed");
      }
    });
  });
}

export function read(): Promise<ClipboardItems> {
  return rejectThrownErrors(() => {
    // Use the browser implementation if it exists.
    if (originalNavigatorClipboardRead) {
      debugLog("Using `navigator.clipboard.read()`.");
      return originalNavigatorClipboardRead();
    }

    // Fallback to reading text only.
    return readText().then((text: string) => {
      return [textToClipboardItem(text)];
    });
  });
}
