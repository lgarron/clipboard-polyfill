import { originalWindowClipboardItem, originalNavigatorClipboardWrite, originalNavigatorClipboardWriteText, originalNavigatorClipboardRead, originalNavigatorClipboardReadText } from "./globals";
import { hasItemWithType } from "./ClipboardItem/check";
import {
  ClipboardItemAsResolvedText,
  clipboardItemToGlobalClipboardItem,
  getTypeAsText,
  resolveItemsToText,
  textToClipboardItem
} from "./ClipboardItem/convert";
import { TEXT_HTML, TEXT_PLAIN } from "./ClipboardItem/data-types";
import { ClipboardItemInterface, ClipboardItems } from "./ClipboardItem/spec";
import { debugLog, shouldShowWarnings } from "./debug";
import {
  copyTextUsingDOM,
  copyUsingTempElem,
  copyUsingTempSelection,
  execCopy
} from "./strategies/dom";
import {
  readTextIE,
  seemToBeInIE,
  writeTextIE
} from "./strategies/internet-explorer";

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

  // Internet Explorer
  if (seemToBeInIE()) {
    if (!hasTextPlain) {
      throw new Error("No `text/plain` value was specified.");
    }
    if (writeTextIE(await getTypeAsText(data[0], TEXT_PLAIN))) {
      return;
    } else {
      throw new Error("Copying failed, possibly because the user rejected it.");
    }
  }

  const resolved: ClipboardItemAsResolvedText = await resolveItemsToText(
    data[0]
  );
  if (execCopy(resolved)) {
    debugLog("regular execCopy worked");
    return;
  }

  // Success detection on Edge is not possible, due to bugs in all 4
  // detection mechanisms we could try to use. Assume success.
  if (navigator.userAgent.indexOf("Edge") > -1) {
    debugLog('UA "Edge" => assuming success');
    return;
  }

  // Fallback 1 for desktop Safari.
  if (copyUsingTempSelection(document.body, resolved)) {
    debugLog("copyUsingTempSelection worked");
    return;
  }

  // Fallback 2 for desktop Safari.
  if (copyUsingTempElem(resolved)) {
    debugLog("copyUsingTempElem worked");
    return;
  }

  // Fallback for iOS Safari.
  if (copyTextUsingDOM(await getTypeAsText(data[0], TEXT_PLAIN))) {
    debugLog("copyTextUsingDOM worked");
    return;
  }

  throw new Error("Copy command failed.");
}

export async function writeText(s: string): Promise<void> {
  // Use the browser implementation if it exists.
  if (originalNavigatorClipboardWriteText) {
    debugLog("Using `navigator.clipboard.writeText()`.");
    return originalNavigatorClipboardWriteText(s);
  }

  // Fall back to the general writing strategy.
  return write([textToClipboardItem(s)]);
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

export async function readText(): Promise<string> {
  // Use the browser implementation if it exists.
  if (originalNavigatorClipboardReadText) {
    debugLog("Using `navigator.clipboard.readText()`.");
    return originalNavigatorClipboardReadText();
  }

  // Fallback for IE.
  if (seemToBeInIE()) {
    debugLog("Reading text using IE strategy.");
    return readTextIE();
  }

  throw new Error("Read is not supported in your browser.");
}
