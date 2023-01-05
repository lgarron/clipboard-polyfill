import { StringItem } from "../ClipboardItem/convert";
import { TEXT_PLAIN } from "../ClipboardItem/data-types";
import { debugLog } from "../debug";
import {
  originalNavigatorClipboardReadText,
  originalNavigatorClipboardWriteText,
} from "../builtin-globals";
import { readTextIE, seemToBeInIE } from "../strategies/internet-explorer";
import { writeFallback } from "./write-fallback";

function stringToStringItem(s: string): StringItem {
  var stringItem: StringItem = {};
  stringItem[TEXT_PLAIN] = s;
  return stringItem;
}

export function writeText(s: string): Promise<void> {
  // Use the browser implementation if it exists.
  if (originalNavigatorClipboardWriteText) {
    debugLog("Using `navigator.clipboard.writeText()`.");
    return originalNavigatorClipboardWriteText(s).catch(
      writeTextStringFallback,
    );
  }
  writeTextStringFallback(s);
}

function writeTextStringFallback(s: string): void {
  if (!writeFallback(stringToStringItem(s))) {
    throw new Error("writeText() failed");
  }
}

export function readText(): Promise<string> {
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
