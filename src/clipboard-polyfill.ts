import { ClipboardItem, ClipboardItemAsResolvedText, getTypeAsText, resolveItemsToText, textToClipboardItem } from "./clipboard-item";
import { TEXT_PLAIN } from "./data-types";
import {debugLog, shouldShowWarnings} from "./debug";
import {copyTextUsingDOM, copyUsingTempElem, copyUsingTempSelection, execCopy} from "./dom";
import { readTextIE, seemToBeInIE, writeTextIE } from "./internet-explorer";

export async function write(data: ClipboardItem): Promise<void> {
  const hasTextPlain = data.types.indexOf(TEXT_PLAIN) !== -1;
  if (shouldShowWarnings && !hasTextPlain) {
    debugLog("clipboard.write() was called without a " +
      "`text/plain` data type. On some platforms, this may result in an " +
      "empty clipboard. Call clipboard.suppressWarnings() " +
      "to suppress this warning.");
  }

  // Use the browser implementation if it exists.
  if (navigator.clipboard && navigator.clipboard.write) {
    debugLog("Using `navigator.clipboard.write()`.");
    return navigator.clipboard.write(data);
  }

  // Internet Explorer
  if (seemToBeInIE()) {
    if (!hasTextPlain) {
      throw new Error(("No `text/plain` value was specified."));
    }
    if (writeTextIE(await getTypeAsText(data, TEXT_PLAIN))) {
      return;
    } else {
      throw new Error("Copying failed, possibly because the user rejected it.");
    }
  }

  const resolved: ClipboardItemAsResolvedText = await resolveItemsToText(data);
  if (execCopy(resolved)) {
    debugLog("regular execCopy worked");
    return;
  }

  // Success detection on Edge is not possible, due to bugs in all 4
  // detection mechanisms we could try to use. Assume success.
  if (navigator.userAgent.indexOf("Edge") > -1) {
    debugLog("UA \"Edge\" => assuming success");
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
  if (copyTextUsingDOM(await getTypeAsText(data, TEXT_PLAIN))) {
    debugLog("copyTextUsingDOM worked");
    return;
  }

  throw new Error("Copy command failed.");
}

export async function writeText(s: string): Promise<void> {
  // Use the browser implementation if it exists.
  if (navigator.clipboard && navigator.clipboard.writeText) {
    debugLog("Using `navigator.clipboard.writeText()`.");
    return navigator.clipboard.writeText(s);
  }

  // Fall back to the general writing strategy.
  return write(textToClipboardItem(s));
}

export async function read(): Promise<ClipboardItem> {
  // Use the browser implementation if it exists.
  if (navigator.clipboard && navigator.clipboard.readText) {
    debugLog("Using `navigator.clipboard.read()`.");
    return navigator.clipboard.read();
  }

  // Fallback to reading text only.
  return textToClipboardItem(await readText());
}

export async function readText(): Promise<string> {
  // Use the browser implementation if it exists.
  if (navigator.clipboard && navigator.clipboard.readText) {
    debugLog("Using `navigator.clipboard.readText()`.");
    return navigator.clipboard.readText();
  }

  // Fallback for IE.
  if (seemToBeInIE()) {
    debugLog("Reading text using IE strategy.");
    return readTextIE();
  }

  throw new Error("Read is not supported in your browser.");
}
