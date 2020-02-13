import { TEXT_PLAIN } from "./data-types";
import {debugLog, shouldShowWarnings} from "./debug";
import {copyTextUsingDOM, copyUsingTempElem, copyUsingTempSelection, execCopy} from "./dom";
import {DT, DTFromText} from "./DT";
import { readIE, seemToBeInIE, writeIE } from "./internet-explorer";

export async function write(data: DT): Promise<void> {
  if (shouldShowWarnings && !data.getData(TEXT_PLAIN)) {
    debugLog("clipboard.write() was called without a " +
      "`text/plain` data type. On some platforms, this may result in an " +
      "empty clipboard. Call clipboard.suppressWarnings() " +
      "to suppress this warning.");
  }

  // Internet Explorer
  if (seemToBeInIE()) {
    if (writeIE(data)) {
      return;
    } else {
      throw new Error("Copying failed, possibly because the user rejected it.");
    }
  }

  if (execCopy(data)) {
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
  if (copyUsingTempSelection(document.body, data)) {
    debugLog("copyUsingTempSelection worked");
    return;
  }

  // Fallback 2 for desktop Safari.
  if (copyUsingTempElem(data)) {
    debugLog("copyUsingTempElem worked");
    return;
  }

  // Fallback for iOS Safari.
  const text = data.getData(TEXT_PLAIN);
  if (text !== undefined && copyTextUsingDOM(text)) {
    debugLog("copyTextUsingDOM worked");
    return;
  }

  throw new Error("Copy command failed.");
}

const cachedClipboard = navigator.clipboard;

export async function writeText(s: string): Promise<void> {
  if (cachedClipboard && cachedClipboard.writeText && cachedClipboard !== this) {
    debugLog("Using `navigator.clipboard.writeText()`.");
    return cachedClipboard.writeText(s);
  }
  return write(DTFromText(s));
}

export async function read(): Promise<DT> {
  return DTFromText(await readText());
}

export async function readText(): Promise<string> {
  if (cachedClipboard && cachedClipboard.readText && cachedClipboard !== this) {
    debugLog("Using `navigator.clipboard.readText()`.");
    return cachedClipboard.readText();
  }
  if (seemToBeInIE()) {
    debugLog("Reading text using IE strategy.");
    return readIE();
  }
  throw new Error("Read is not supported in your browser.");
}
