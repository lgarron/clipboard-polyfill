import { hasItemWithType } from "../ClipboardItem/check";
import { clipboardItemToGlobalClipboardItem, toStringItem, textToClipboardItem } from "../ClipboardItem/convert";
import { TEXT_HTML, TEXT_PLAIN } from "../ClipboardItem/data-types";
import { ClipboardItemInterface, ClipboardItems } from "../ClipboardItem/spec";
import { debugLog, shouldShowWarnings } from "../debug";
import { originalNavigatorClipboardRead, originalNavigatorClipboardWrite, originalWindowClipboardItem } from "../globals";
import { readText } from "./text";
import { writeFallback } from "./write-fallback";

export async function write(data: ClipboardItemInterface[]): Promise<void> {
  // Use the browser implementation if it exists.
  // TODO: detect `text/html`.
  if (
    originalNavigatorClipboardWrite &&
    originalWindowClipboardItem
  ) {
    debugLog("Using `navigator.clipboard.write()`.");
    const globalClipboardItems: ClipboardItemInterface[] = await Promise.all(
      data.map(clipboardItemToGlobalClipboardItem)
    );
    try {
      return await originalNavigatorClipboardWrite(globalClipboardItems);
    } catch (e) {
      // Chrome 83 will throw a DOMException or NotAllowedError because it doesn't support e.g. `text/html`.
      // We want to fall back to the other strategies in a situation like this.
      // See https://github.com/w3c/clipboard-apis/issues/128 and https://github.com/w3c/clipboard-apis/issues/67
      if (!hasItemWithType(data, TEXT_PLAIN) && !hasItemWithType(data, TEXT_HTML)) {
        throw e;
      }
    }
  }

  const hasTextPlain = hasItemWithType(data, TEXT_PLAIN);
  if (shouldShowWarnings && !hasTextPlain) {
    debugLog(
      "clipboard.write() was called without a " +
        "`text/plain` data type. On some platforms, this may result in an " +
        "empty clipboard. Call suppressWarnings() " +
        "to suppress this warning."
    );
  }

  if (!writeFallback(await toStringItem(data[0]))) {
    throw new Error("write() failed");
  }
}

export async function read(): Promise<ClipboardItems> {
  // Use the browser implementation if it exists.
  if (originalNavigatorClipboardRead) {
    debugLog("Using `navigator.clipboard.read()`.");
    return originalNavigatorClipboardRead();
  }

  // Fallback to reading text only.
  return [textToClipboardItem(await readText())];
}
