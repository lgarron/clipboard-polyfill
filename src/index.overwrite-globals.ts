// Import `./globals` that the globals are cached before this runs.
import { read, readText, write, writeText } from "./clipboard-polyfill";
import { ClipboardItemPolyfill } from "./ClipboardItem/ClipboardItemPolyfill";
import { Clipboard as ClipboardInterface, ClipboardItemConstructor } from "./ClipboardItem/spec";
import "./globals";

declare global {
  const ClipboardItem: ClipboardItemConstructor;
  interface Window {
    ClipboardItem: ClipboardItemConstructor;
  }
  interface Clipboard extends ClipboardInterface {}
}

if (navigator) {
  // Create the `navigator.clipboard` object if it doesn't exist.
  (navigator as any).clipboard = navigator.clipboard ?? {};

  // Set/replace the implementations.
  navigator.clipboard.read = read;
  navigator.clipboard.readText = readText;
  navigator.clipboard.write = write;
  navigator.clipboard.writeText = writeText;
}

if (window) {
  window.ClipboardItem = ClipboardItemPolyfill;
}
